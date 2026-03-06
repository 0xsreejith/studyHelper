import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

async function loadPdfDocument(arrayBuffer) {
    try {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        return await loadingTask.promise;
    } catch {
        // Fallback for environments where worker loading is blocked.
        const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            disableWorker: true
        });
        return await loadingTask.promise;
    }
}

function pageTextFromContent(textContent) {
    let output = '';

    for (const item of textContent.items) {
        const segment = item.str ?? '';
        if (!segment) {
            continue;
        }

        output += segment;
        output += item.hasEOL ? '\n' : ' ';
    }

    return output
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]{2,}/g, ' ')
        .trim();
}

export async function extractTextFromPDF(file, options = {}) {
    const { onProgress } = options;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await loadPdfDocument(arrayBuffer);
    const totalPages = pdf.numPages;
    const pages = [];
    let nonEmptyPages = 0;

    for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = pageTextFromContent(textContent);
        if (pageText.length > 0) {
            nonEmptyPages += 1;
        }
        pages.push(pageText);

        if (typeof onProgress === 'function') {
            onProgress(i, totalPages);
        }
    }

    if (nonEmptyPages === 0) {
        throw new Error('No readable text found in this PDF. It may be scanned/image-only.');
    }

    return { pages, totalPages };
}

export async function mergePDFs(files) {
    const mergedPdf = await PDFDocument.create();
    
    for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
    }
    
    const mergedPdfBytes = await mergedPdf.save();
    return new Blob([mergedPdfBytes], { type: 'application/pdf' });
}

export async function splitPDF(file, startPage, endPage) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const totalPages = pdf.getPageCount();
    
    if (startPage < 1 || endPage > totalPages || startPage > endPage) {
        throw new Error('Invalid page range');
    }
    
    const newPdf = await PDFDocument.create();
    const pageIndices = [];
    for (let i = startPage - 1; i < endPage; i++) {
        pageIndices.push(i);
    }
    
    const copiedPages = await newPdf.copyPages(pdf, pageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));
    
    const splitPdfBytes = await newPdf.save();
    return new Blob([splitPdfBytes], { type: 'application/pdf' });
}

export async function pdfToImages(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await loadPdfDocument(arrayBuffer);
    const totalPages = pdf.numPages;
    const images = [];
    
    for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = await page.getViewport({ scale: 2 });
        
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const textContent = await page.getTextContent();
        ctx.font = '12px Arial';
        ctx.fillStyle = 'black';
        
        for (const item of textContent.items) {
            const tx = item.transform;
            ctx.fillText(item.str, tx[4], viewport.height - tx[5]);
        }
        
        images.push({
            pageNum: i,
            dataUrl: canvas.toDataURL('image/png')
        });
    }
    
    return images;
}

export function downloadBlob(blob, filename) {
    saveAs(blob, filename);
}

export async function getPDFInfo(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await loadPdfDocument(arrayBuffer);
    
    return {
        pageCount: pdf.numPages,
        title: '',
        author: '',
        subject: '',
        creator: '',
        producer: '',
        creationDate: null,
        modificationDate: null
    };
}

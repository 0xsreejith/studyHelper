import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import mammoth from 'mammoth';

export async function createDocxFromText(text, title = 'Document') {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: title,
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({ text: '' }),
                ...text.split('\n').filter(line => line.trim()).map(line => 
                    new Paragraph({
                        children: [new TextRun(line)],
                        spacing: { after: 200 }
                    })
                )
            ]
        }]
    });
    
    const blob = await Packer.toBlob(doc);
    return blob;
}

export async function createDocxFromPages(pages, mode) {
    const children = [];
    
    children.push(new Paragraph({
        text: getModeTitle(mode),
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER
    }));
    children.push(new Paragraph({ text: '' }));
    
    for (let i = 0; i < pages.length; i++) {
        children.push(new Paragraph({
            text: `--- Page ${i + 1} ---`,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
        }));
        
        const lines = pages[i].split('\n');
        for (const line of lines) {
            if (line.trim()) {
                children.push(new Paragraph({
                    children: [new TextRun(line)],
                    spacing: { after: 100 }
                }));
            }
        }
    }
    
    const doc = new Document({
        sections: [{
            properties: {},
            children
        }]
    });
    
    return await Packer.toBlob(doc);
}

function getModeTitle(mode) {
    const titles = {
        translate: 'Malayalam Translation',
        exam: 'Exam Notes',
        summary: 'Summary',
        explain: 'Teacher Explanation',
        questions: 'Exam Questions',
        flashcards: 'Flashcards'
    };
    return titles[mode] || 'Document';
}

export function downloadDocx(blob, filename) {
    saveAs(blob, filename);
}

export async function extractTextFromDocx(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    } catch (error) {
        console.error('Error extracting text from DOCX:', error);
        throw new Error('Failed to extract text from DOCX file');
    }
}

export async function docxToPdf(file) {
    const text = await extractTextFromDocx(file);
    
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    const lines = doc.splitTextToSize(text, 180);
    let y = 10;
    
    for (const line of lines) {
        if (y > 280) {
            doc.addPage();
            y = 10;
        }
        doc.text(line, 10, y);
        y += 7;
    }
    
    return doc.output('blob');
}

export async function pdfToDocx(file) {
    const { extractTextFromPDF } = await import('./pdfTools.js');
    const { pages } = await extractTextFromPDF(file);
    
    const allText = pages.join('\n\n');
    return await createDocxFromText(allText, 'Extracted Text');
}

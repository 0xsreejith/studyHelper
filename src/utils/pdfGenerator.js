
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// PDF export uses html2canvas + jsPDF so Malayalam glyphs render correctly as captured output.

/**
 * Generate a downloadable HTML document with Malayalam content that can be
 * printed as PDF via the browser's print dialog (Ctrl+P).
 * 
 * This approach ensures proper Malayalam font rendering.
 * 
 * @param {string[]} translatedPages - Array of translated page texts
 * @param {string} originalFileName - Original file name
 * @param {string} mode - The processing mode used
 */
function getDocumentParts(translatedPages, originalFileName, mode) {
    const modeLabels = {
        translate: 'Malayalam Translation',
        exam: 'Exam Notes',
        summary: 'Summary',
        explain: 'Teacher Explanation',
        questions: 'Exam Questions',
        flashcards: 'Flashcards'
    };

    const title = `${originalFileName} - ${modeLabels[mode] || 'Translated'}`;

    const escapeHtml = (text) =>
        text
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');

    const isLikelyHeading = (line) => {
        if (/^#{1,6}\s+/.test(line)) return true;
        if (/^\*{2}.+\*{2}$/.test(line)) return true;
        if (/^(chapter|unit|module|section|part)\b[:\s]/i.test(line)) return true;
        if (line.endsWith(':')) return true;
        return false;
    };

    const formatPage = (text) => {
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        const html = [];
        let openList = null;

        const closeList = () => {
            if (openList) {
                html.push(`</${openList}>`);
                openList = null;
            }
        };

        for (const line of lines) {
            if (/^\*{2}.+\*{2}$/.test(line)) {
                closeList();
                html.push(`<h3>${escapeHtml(line.replace(/\*\*/g, '').trim())}</h3>`);
                continue;
            }

            if (/^#{1,6}\s+/.test(line)) {
                closeList();
                const level = Math.min((line.match(/^#+/)?.[0].length || 1) + 1, 4);
                html.push(`<h${level}>${escapeHtml(line.replace(/^#{1,6}\s+/, ''))}</h${level}>`);
                continue;
            }

            if (isLikelyHeading(line) && !/^\d+\.\s+/.test(line)) {
                closeList();
                html.push(`<h3>${escapeHtml(line.replace(/:$/, ''))}</h3>`);
                continue;
            }

            if (/^(\d+)[.)]\s+/.test(line)) {
                if (openList !== 'ol') {
                    closeList();
                    html.push('<ol>');
                    openList = 'ol';
                }
                html.push(`<li>${escapeHtml(line.replace(/^(\d+)[.)]\s+/, ''))}</li>`);
                continue;
            }

            if (/^[-•]\s+/.test(line)) {
                if (openList !== 'ul') {
                    closeList();
                    html.push('<ul>');
                    openList = 'ul';
                }
                html.push(`<li>${escapeHtml(line.replace(/^[-•]\s+/, ''))}</li>`);
                continue;
            }

            closeList();
            html.push(`<p>${escapeHtml(line)}</p>`);
        }

        closeList();
        return html.join('\n');
    };

    const pagesHTML = translatedPages
        .map((text) => `<div class="page">${formatPage(text)}</div>`)
        .join('\n<div class="page-break"></div>\n');

    const pageStyle = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Noto Sans Malayalam', 'Nirmala UI', 'Kartika', 'Meera', sans-serif;
      line-height: 1.8;
      color: #1a1a2e;
      background: #f5f5f5;
      padding: 0;
    }
    
    .page {
      background: white;
      max-width: 800px;
      margin: 20px auto;
      padding: 60px 50px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-radius: 4px;
      min-height: 1000px;
      position: relative;
    }

    h1, h2, h3, h4 { 
      margin: 1.5rem 0 0.75rem; 
      color: #16213e; 
      font-weight: 600;
    }
    h2 { font-size: 1.4rem; border-bottom: 2px solid #7b42f6; padding-bottom: 0.5rem; }
    h3 { font-size: 1.2rem; color: #0f3460; }
    h4 { font-size: 1.1rem; }

    p { margin-bottom: 0.75rem; font-size: 1rem; }

    ul, ol {
      margin: 0.6rem 0 1rem 1.5rem;
    }

    li {
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }

    .page-break { page-break-after: always; }
    `;

    const htmlContent = `<!DOCTYPE html>
<html lang="ml">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>${pageStyle}</style>
</head>
<body>
  ${pagesHTML}
</body>
</html>`;

    return { title, pagesHTML, htmlContent, pageStyle };
}

export function downloadAsHTML(translatedPages, originalFileName, mode) {
    const { htmlContent } = getDocumentParts(translatedPages, originalFileName, mode);

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    saveAs(blob, `${originalFileName.replace(/\.[^/.]+$/, '')}_${mode}.html`);
}

export async function downloadAsPDF(translatedPages, originalFileName, mode) {
    const { pagesHTML, pageStyle } = getDocumentParts(translatedPages, originalFileName, mode);

    const withTimeout = (promise, ms, message) =>
        new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error(message)), ms);
            promise
                .then((value) => {
                    clearTimeout(timer);
                    resolve(value);
                })
                .catch((error) => {
                    clearTimeout(timer);
                    reject(error);
                });
        });

    const root = document.createElement('div');
    root.style.position = 'fixed';
    root.style.left = '0';
    root.style.top = '0';
    root.style.width = '900px';
    root.style.opacity = '0';
    root.style.visibility = 'visible';
    root.style.pointerEvents = 'none';
    root.style.zIndex = '1';
    root.style.background = '#ffffff';
    root.innerHTML = `<style>${pageStyle}</style>${pagesHTML}`;
    document.body.appendChild(root);

    try {
        if (document.fonts?.ready) {
            // Best effort: do not fail export if font loading takes longer on slow systems.
            await Promise.race([
                document.fonts.ready,
                new Promise((resolve) => setTimeout(resolve, 12000))
            ]);
        }

        const pageElements = Array.from(root.querySelectorAll('.page'));
        if (pageElements.length === 0) {
            throw new Error('No pages generated for PDF export');
        }

        const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 24;

        for (let i = 0; i < pageElements.length; i++) {
            if (i > 0) {
                pdf.addPage();
            }

            const canvas = await withTimeout(
                html2canvas(pageElements[i], {
                    scale: 1.5,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                }),
                25000,
                `Page ${i + 1} rendering timed out`
            );

            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const renderWidth = pdfWidth - margin * 2;
            const scale = renderWidth / imgProps.width;
            const renderHeight = imgProps.height * scale;
            const fitHeight = Math.min(renderHeight, pdfHeight - margin * 2);
            const y = margin;

            pdf.addImage(imgData, 'PNG', margin, y, renderWidth, fitHeight);
        }

        const baseName = originalFileName.replace(/\.[^/.]+$/, '');
        const pdfBlob = pdf.output('blob');
        saveAs(pdfBlob, `${baseName}_${mode}.pdf`);
    } finally {
        document.body.removeChild(root);
    }
}

export async function downloadAsSimplePDF(translatedPages, originalFileName, mode) {
    const baseName = originalFileName.replace(/\.[^/.]+$/, '');
    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    const margin = 36;
    const lineHeight = 16;

    for (let i = 0; i < translatedPages.length; i++) {
        if (i > 0) {
            pdf.addPage();
        }

        let y = margin;
        const pageText = translatedPages[i] || '';
        const lines = pdf.splitTextToSize(pageText, width - margin * 2);

        for (const line of lines) {
            if (y > height - margin) {
                pdf.addPage();
                y = margin;
            }
            pdf.text(line, margin, y);
            y += lineHeight;
        }
    }

    const pdfBlob = pdf.output('blob');
    saveAs(pdfBlob, `${baseName}_${mode}.pdf`);
}

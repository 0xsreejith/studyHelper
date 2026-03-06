import { useState, useEffect } from 'react';
import { FiDownload, FiFile, FiFileText, FiEdit3, FiLayers, FiScissors, FiMaximize2, FiImage, FiCheck, FiX } from 'react-icons/fi';
import { extractTextFromPDF, mergePDFs, splitPDF, downloadBlob, getPDFInfo } from '../utils/pdfTools';
import { createDocxFromText, docxToPdf, pdfToDocx, downloadDocx } from '../utils/docxTools';
import { processDocumentLocally } from '../utils/localProcessor';
import { translateDocument } from '../utils/translator';
import UnifiedUpload from './UnifiedUpload';
import './Tools.css';

const Tools = () => {
    const [activeTool, setActiveTool] = useState('translate');
    const [files, setFiles] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('translate');
    const [pageRange, setPageRange] = useState({ start: 1, end: 1 });
    const [pdfInfo, setPdfInfo] = useState(null);

    const tools = [
    { id: 'translate', icon: <FiEdit3 />, name: 'Translate to Malayalam', desc: 'FastAPI translation service' },
    { id: 'pdfToDocx', icon: <FiFileText />, name: 'PDF to DOCX', desc: 'Convert PDF to Word document' },
    { id: 'docxToPdf', icon: <FiFile />, name: 'DOCX to PDF', desc: 'Convert Word document to PDF' },
    { id: 'merge', icon: <FiLayers />, name: 'Merge PDFs', desc: 'Combine multiple PDFs into one' },
    { id: 'split', icon: <FiScissors />, name: 'Split PDF', desc: 'Extract pages from PDF' },
    { id: 'extract', icon: <FiMaximize2 />, name: 'Extract Text', desc: 'Get all text from PDF' },
    { id: 'pdfToImg', icon: <FiImage />, name: 'PDF to Images', desc: 'Convert PDF pages to images' },
];

    const clearFiles = () => {
        setFiles([]);
        setResult(null);
        setError(null);
        setPdfInfo(null);
    };

    // Update PDF info when files change
    useEffect(() => {
        if (files.length > 0 && files[0].type === 'application/pdf') {
            getPDFInfo(files[0]).then(info => {
                setPdfInfo(info);
                setPageRange({ start: 1, end: info.pageCount });
            }).catch(() => {});
        }
    }, [files]);

    const handleProcess = async () => {
        if (files.length === 0) return;
        
        setProcessing(true);
        setError(null);
        setResult(null);

        try {
            switch (activeTool) {
                case 'translate': {
                    setStatus('Extracting text from PDF...');
                    const { pages } = await extractTextFromPDF(files[0]);
                    let translated;
                    if (mode === 'translate') {
                        setStatus('Translating with backend service...');
                        try {
                            translated = await translateDocument(pages);
                        } catch {
                            setStatus('Backend unavailable, using local fallback...');
                            translated = processDocumentLocally(pages, mode);
                        }
                    } else {
                        setStatus('Processing locally...');
                        translated = processDocumentLocally(pages, mode);
                    }
                    const docxBlob = await createDocxFromText(translated.join('\n\n'), 'Malayalam Translation');
                    downloadDocx(docxBlob, 'malayalam_translation.docx');
                    setResult({ type: 'docx', name: 'malayalam_translation.docx' });
                    break;
                }

                case 'pdfToDocx': {
                    setStatus('Converting PDF to DOCX...');
                    const docx = await pdfToDocx(files[0]);
                    downloadDocx(docx, 'converted.docx');
                    setResult({ type: 'docx', name: 'converted.docx' });
                    break;
                }

                case 'docxToPdf': {
                    setStatus('Converting DOCX to PDF...');
                    const pdfBlob = await docxToPdf(files[0]);
                    downloadBlob(pdfBlob, 'converted.pdf');
                    setResult({ type: 'pdf', name: 'converted.pdf' });
                    break;
                }

                case 'merge': {
                    if (files.length < 2) throw new Error('Select at least 2 PDF files');
                    setStatus('Merging PDFs...');
                    const merged = await mergePDFs(files);
                    downloadBlob(merged, 'merged.pdf');
                    setResult({ type: 'pdf', name: 'merged.pdf' });
                    break;
                }

                case 'split': {
                    setStatus('Splitting PDF...');
                    const split = await splitPDF(files[0], pageRange.start, pageRange.end);
                    downloadBlob(split, `pages_${pageRange.start}-${pageRange.end}.pdf`);
                    setResult({ type: 'pdf', name: `pages_${pageRange.start}-${pageRange.end}.pdf` });
                    break;
                }

                case 'extract': {
                    setStatus('Extracting text...');
                    const { pages: textPages } = await extractTextFromPDF(files[0]);
                    const textBlob = await createDocxFromText(textPages.join('\n\n'), 'Extracted Text');
                    downloadDocx(textBlob, 'extracted_text.docx');
                    setResult({ type: 'docx', name: 'extracted_text.docx' });
                    break;
                }

                case 'pdfToImg': {
                    setStatus('Converting to images...');
                    const { pdfToImages } = await import('../utils/pdfTools.js');
                    const images = await pdfToImages(files[0]);
                    
                    images.forEach((img, idx) => {
                        const link = document.createElement('a');
                        link.download = `page_${idx + 1}.png`;
                        link.href = img.dataUrl;
                        link.click();
                    });
                    setResult({ type: 'images', count: images.length });
                    break;
                }

                default:
                    throw new Error('Unknown tool');
            }
            setStatus('Done!');
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="tools-container">
            <h2 className="tools-title">Student Tools</h2>
            <p className="tools-subtitle">No API key needed. Uses FastAPI backend translation.</p>

            <div className="tools-grid">
                {tools.map(tool => (
                    <div
                        key={tool.id}
                        className={`tool-card ${activeTool === tool.id ? 'active' : ''}`}
                        onClick={() => { setActiveTool(tool.id); clearFiles(); }}
                    >
                        <div className="tool-icon">{tool.icon}</div>
                        <h3>{tool.name}</h3>
                        <p>{tool.desc}</p>
                    </div>
                ))}
            </div>

            <div className="tool-panel glass-panel">
                {activeTool === 'translate' && (
                    <div className="mode-selector">
                        <label>Translation Mode:</label>
                        <select value={mode} onChange={e => setMode(e.target.value)}>
                            <option value="translate">Simple Translation</option>
                            <option value="exam">Exam Notes</option>
                            <option value="summary">Summary</option>
                            <option value="explain">Teacher Explanation</option>
                        </select>
                    </div>
                )}

                {activeTool === 'split' && pdfInfo && (
                    <div className="page-range-selector">
                        <label>Page Range:</label>
                        <input 
                            type="number" 
                            min={1} 
                            max={pdfInfo.pageCount}
                            value={pageRange.start}
                            onChange={e => setPageRange({...pageRange, start: parseInt(e.target.value)})}
                        />
                        <span>to</span>
                        <input 
                            type="number" 
                            min={1} 
                            max={pdfInfo.pageCount}
                            value={pageRange.end}
                            onChange={e => setPageRange({...pageRange, end: parseInt(e.target.value)})}
                        />
                        <span>(Total: {pdfInfo.pageCount} pages)</span>
                    </div>
                )}

                <UnifiedUpload 
                    onFileSelect={setFiles} 
                    multiple={activeTool === 'merge'} 
                    maxFiles={activeTool === 'merge' ? 10 : 1}
                    className="tools-upload"
                />

                {pdfInfo && (
                    <div className="pdf-info">
                        <strong>PDF Info:</strong> {pdfInfo.pageCount} pages
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <FiX /> {error}
                    </div>
                )}

                {status && (
                    <div className="status-message">
                        {processing && <div className="spinner"></div>}
                        {status}
                    </div>
                )}

                {result && (
                    <div className="success-message">
                        <FiCheck /> Done! File downloaded: {result.name}
                    </div>
                )}

                {files.length > 0 && !result && (
                    <button 
                        className="btn-primary process-btn" 
                        onClick={handleProcess}
                        disabled={processing}
                    >
                        {processing ? 'Processing...' : (
                            <>
                                <FiDownload /> Process
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Tools;

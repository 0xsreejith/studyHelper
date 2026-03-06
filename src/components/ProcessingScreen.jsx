import { useEffect, useState } from 'react';
import { FiAlertCircle, FiZap } from 'react-icons/fi';
import { processDocumentLocally } from '../utils/localProcessor';
import { translateDocument } from '../utils/translator';
import { extractTextFromPDF } from '../utils/pdfTools';
import { extractTextFromDocx } from '../utils/docxTools';
import './ProcessingScreen.css';

const ProcessingScreen = ({ file, mode, onComplete, onError }) => {
    const [status, setStatus] = useState('Extracting text from PDF...');
    const [progress, setProgress] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function process() {
            try {
                if (!file?.name) {
                    throw new Error('No file selected. Please choose a PDF or DOCX file.');
                }

                const isPDF = file.name.toLowerCase().endsWith('.pdf');
                const isDOCX = file.name.toLowerCase().endsWith('.docx');

                if (!isPDF && !isDOCX) {
                    throw new Error('Unsupported file format. Please upload a PDF or DOCX file.');
                }

                setStatus(`Reading your ${isPDF ? 'PDF' : 'DOCX'} file...`);
                setProgress(5);

                let pages;
                let total;

                if (isPDF) {
                    const result = await extractTextFromPDF(file, {
                        onProgress: (done, count) => {
                            if (cancelled) return;
                            setCurrentPage(done);
                            setTotalPages(count);
                            setProgress(Math.min(40, Math.round((done / count) * 40)));
                            setStatus(`Extracting text from page ${done} of ${count}...`);
                        }
                    });
                    pages = result.pages;
                    total = result.totalPages;
                } else {
                    const text = await extractTextFromDocx(file);
                    pages = [text];
                    total = 1;
                }

                if (cancelled) return;
                setTotalPages(total);
                setStatus(`Found ${total} ${isPDF ? 'pages' : 'sections'}. Starting translation...`);

                let translatedPages = [];

                if (mode === 'translate') {
                    setStatus('Using backend translation service...');
                    try {
                        translatedPages = await translateDocument(pages, (done, totalProgress) => {
                            if (cancelled) return;
                            const pct = Math.round(done / totalProgress * 55);
                            setProgress(Math.min(95, 40 + pct));
                            const computedPage = Math.max(1, Math.min(total, Math.ceil((done / totalProgress) * total)));
                            setCurrentPage(computedPage);
                            setStatus(`Translating... ${done}%`);
                        });
                    } catch (error) {
                        throw new Error(error?.message || 'Translation service is unavailable.');
                    }
                } else {
                    for (let i = 0; i < pages.length; i++) {
                        if (cancelled) return;

                        const page = pages[i]?.trim() ?? '';
                        const translated = page ? processDocumentLocally([page], mode)[0] : '';
                        translatedPages.push(translated);

                        const done = i + 1;
                        setCurrentPage(done);
                        setProgress(Math.min(95, 40 + Math.round((done / total) * 55)));
                        setStatus(`Translating page ${done} of ${total}...`);

                        // Yield to keep UI responsive for large documents.
                        await new Promise(resolve => setTimeout(resolve, 0));
                    }
                }

                if (cancelled) return;

                setProgress(100);
                setStatus('Done! Preparing your results...');

                setTimeout(() => {
                    if (!cancelled) {
                        onComplete(pages, translatedPages);
                    }
                }, 600);

            } catch (err) {
                if (!cancelled) {
                    console.error('Processing error:', err);
                    setError(err.message);
                    if (onError) onError(err.message);
                }
            }
        }

        process();
        return () => { cancelled = true; };
    }, [file, mode, onComplete, onError]);

    if (error) {
        return (
            <div className="processing-container glass-panel">
                <div className="processing-content">
                    <div className="error-icon-wrapper">
                        <FiAlertCircle className="error-icon" />
                    </div>
                    <h2 className="processing-title" style={{ color: '#ff4444' }}>Something went wrong</h2>
                    <p className="processing-status">{error}</p>
                    <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => window.location.reload()}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="processing-container glass-panel">
            <div className="processing-content">
                <div className="loader-ring">
                    <div className="loader-ring-inner"></div>
                    <FiZap className="pulse-icon text-gradient" />
                </div>

                <h2 className="processing-title">Translating... ✨</h2>
                <p className="processing-status">{status}</p>

                {totalPages > 0 && (
                    <p className="page-counter">
                        Page {currentPage} / {totalPages}
                    </p>
                )}

                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}>
                        <div className="progress-glow"></div>
                    </div>
                </div>
                <p className="progress-text">{progress}% Complete</p>
            </div>
        </div>
    );
};

export default ProcessingScreen;

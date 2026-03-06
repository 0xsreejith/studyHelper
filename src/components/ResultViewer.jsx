import { useState } from 'react';
import { FiCheck, FiChevronLeft, FiChevronRight, FiCopy, FiDownload, FiLoader } from 'react-icons/fi';
import { downloadAsHTML, downloadAsPDF, downloadAsSimplePDF } from '../utils/pdfGenerator';
import './ResultViewer.css';

const ResultViewer = ({ mode, originalPages, translatedPages, fileName, onReset }) => {
    const [currentPageIdx, setCurrentPageIdx] = useState(0);
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [downloadStatus, setDownloadStatus] = useState('');

    const totalPages = translatedPages.length;

    const handleDownload = async () => {
        if (downloading) return;
        setDownloading(true);
        setDownloadProgress(0);
        setDownloadStatus('Preparing download...');
        const hasMalayalamContent = translatedPages.some((text) => /[\u0D00-\u0D7F]/u.test(text || ''));
        
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

        // Simulate progress updates
        const progressInterval = setInterval(() => {
            setDownloadProgress(prev => {
                if (prev >= 90) return prev;
                return prev + Math.random() * 15;
            });
        }, 500);

        try {
            setDownloadStatus('Generating PDF...');
            setDownloadProgress(30);
            
            await withTimeout(
                downloadAsPDF(translatedPages, fileName, mode),
                90000,
                'PDF generation timed out'
            );
            
            clearInterval(progressInterval);
            setDownloadProgress(100);
            setDownloadStatus('Download complete!');
            
            setTimeout(() => {
                setDownloadProgress(0);
                setDownloadStatus('');
            }, 2000);
            
        } catch (error) {
            console.error('Rich PDF failed, trying simple PDF:', error);
            clearInterval(progressInterval);

            if (hasMalayalamContent) {
                try {
                    setDownloadStatus('PDF render failed. Downloading HTML (best Malayalam support)...');
                    setDownloadProgress(80);

                    downloadAsHTML(translatedPages, fileName, mode);

                    setDownloadProgress(100);
                    setDownloadStatus('HTML downloaded. Use Print -> Save as PDF.');

                    setTimeout(() => {
                        setDownloadProgress(0);
                        setDownloadStatus('');
                    }, 3000);
                } catch {
                    setDownloadStatus('Download failed. Please try again.');
                    setTimeout(() => {
                        setDownloadProgress(0);
                        setDownloadStatus('');
                    }, 3000);
                }
                return;
            }

            try {
                setDownloadStatus('Trying alternative format...');
                setDownloadProgress(60);
                
                await downloadAsSimplePDF(translatedPages, fileName, mode);
                
                setDownloadProgress(100);
                setDownloadStatus('Download complete!');
                
                setTimeout(() => {
                    setDownloadProgress(0);
                    setDownloadStatus('');
                }, 2000);
                
            } catch (simpleError) {
                console.error('Simple PDF failed, falling back to HTML:', simpleError);
                
                try {
                    setDownloadStatus('Generating HTML...');
                    setDownloadProgress(80);
                    
                    downloadAsHTML(translatedPages, fileName, mode);
                    
                    setDownloadProgress(100);
                    setDownloadStatus('Download complete!');
                    
                    setTimeout(() => {
                        setDownloadProgress(0);
                        setDownloadStatus('');
                    }, 2000);
                    
                } catch {
                    setDownloadStatus('Download failed. Please try again.');
                    setTimeout(() => {
                        setDownloadProgress(0);
                        setDownloadStatus('');
                    }, 3000);
                }
            }
        } finally {
            setDownloading(false);
        }
    };

    const handleCopy = () => {
        const text = translatedPages[currentPageIdx];
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const goToPage = (idx) => {
        if (idx >= 0 && idx < totalPages) {
            setCurrentPageIdx(idx);
        }
    };

    const getModeTitle = () => {
        const labels = {
            translate: 'Malayalam Translation Ready ✅',
            exam: 'Exam Notes Generated ✅',
            summary: 'Smart Summary Complete ✅',
            explain: 'Detailed Explanation Ready ✅',
            questions: 'Exam Questions Generated ✅',
            flashcards: 'Flashcards Created ✅'
        };
        return labels[mode] || 'Your notes are ready';
    };

    const getOutputPaneTitle = () => {
        const titles = {
            translate: 'Malayalam Translation',
            exam: 'Exam Notes',
            summary: 'Summary',
            explain: 'Teacher Explanation',
            questions: 'Exam Questions',
            flashcards: 'Flashcards'
        };
        return titles[mode] || 'AI Output';
    };

    return (
        <div className="result-container">
            <div className="result-header">
                <button className="btn-icon back-btn" onClick={onReset}>
                    <FiChevronLeft /> New Document
                </button>
                <h2 className="result-title text-gradient">{getModeTitle()}</h2>
                <div className="result-actions">
                    <button className={`btn-primary action-btn ${downloading ? 'downloading' : ''}`} onClick={handleDownload} disabled={downloading}>
                        {downloading ? (
                            <>
                                <FiLoader className="spinner" />
                                {downloadStatus || 'Preparing PDF...'}
                            </>
                        ) : (
                            <>
                                <FiDownload /> Download PDF
                            </>
                        )}
                    </button>
                    {downloadProgress > 0 && downloadProgress < 100 && (
                        <div className="download-progress">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${downloadProgress}%` }}></div>
                            </div>
                            <span className="progress-text">{Math.round(downloadProgress)}%</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Page Navigation */}
            <div className="page-nav glass-panel">
                <button
                    className="btn-icon nav-arrow"
                    onClick={() => goToPage(currentPageIdx - 1)}
                    disabled={currentPageIdx === 0}
                >
                    <FiChevronLeft />
                </button>
                <span className="page-info">
                    Page <strong>{currentPageIdx + 1}</strong> of <strong>{totalPages}</strong>
                </span>
                <button
                    className="btn-icon nav-arrow"
                    onClick={() => goToPage(currentPageIdx + 1)}
                    disabled={currentPageIdx >= totalPages - 1}
                >
                    <FiChevronRight />
                </button>
            </div>

            <div className="result-split-view">
                {/* Original Document Pane */}
                <div className="pane original-pane glass-panel">
                    <div className="pane-header">
                        <h3>Original Text</h3>
                    </div>
                    <div className="pane-content custom-scrollbar">
                        {originalPages[currentPageIdx] ? (
                            originalPages[currentPageIdx].split('\n').map((line, i) => (
                                <p key={i}>{line || '\u00A0'}</p>
                            ))
                        ) : (
                            <p className="empty-page-msg">This page has no extractable text.</p>
                        )}
                    </div>
                </div>

                {/* Generated Result Pane */}
                <div className="pane output-pane glass-panel">
                    <div className="pane-header output-header">
                        <h3>{getOutputPaneTitle()}</h3>
                        <div className="pane-tools">
                            <button className={`tool-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} title="Copy text">
                                {copied ? <FiCheck /> : <FiCopy />}
                            </button>
                        </div>
                    </div>
                    <div className="pane-content custom-scrollbar output-content">
                        {translatedPages[currentPageIdx] ? (
                            translatedPages[currentPageIdx].split('\n').map((line, i) => (
                                <p key={i}>{line || '\u00A0'}</p>
                            ))
                        ) : (
                            <p className="empty-page-msg">No content generated for this page.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultViewer;

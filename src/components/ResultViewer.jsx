import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FileDown,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { downloadAsHTML, downloadAsPDF, downloadAsSimplePDF } from '../utils/pdfGenerator';

const ResultViewer = ({ mode, originalPages, translatedPages, fileName, onReset }) => {
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState('');

  const totalPages = translatedPages.length;

  const handleDownloadText = () => {
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const textPayload = translatedPages
      .map((pageText, index) => `Page ${index + 1}\n${pageText || ''}`)
      .join('\n\n------------------------------\n\n');

    const blob = new Blob([textPayload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseName}_malayalam_translation.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

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

    const progressInterval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      setDownloadStatus('Generating PDF...');
      setDownloadProgress(30);

      await withTimeout(downloadAsPDF(translatedPages, fileName, mode), 90000, 'PDF generation timed out');

      clearInterval(progressInterval);
      setDownloadProgress(100);
      setDownloadStatus('Download complete!');

      setTimeout(() => {
        setDownloadProgress(0);
        setDownloadStatus('');
      }, 2000);
    } catch {
      clearInterval(progressInterval);

      if (hasMalayalamContent) {
        try {
          setDownloadStatus('PDF render failed. Downloading HTML...');
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
      } catch {
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

  const getOutputPaneTitle = () => {
    const titles = {
      translate: 'Malayalam Translation',
      exam: 'Exam Notes',
      summary: 'Summary',
      explain: 'Teacher Explanation',
      questions: 'Exam Questions',
      flashcards: 'Flashcards',
    };
    return titles[mode] || 'AI Output';
  };

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-6">
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10"
          >
            <RotateCcw size={16} /> New Document
          </button>

          <h2 className="text-lg font-semibold text-white sm:text-xl">
            Output Ready: <span className="gradient-text">{getOutputPaneTitle()}</span>
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn-secondary text-sm"
              onClick={handleDownloadText}
            >
              <FileDown size={16} />
              Download Text
            </button>
            <button type="button" className="btn-primary text-sm" onClick={handleDownload} disabled={downloading}>
              {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {downloading ? downloadStatus || 'Preparing PDF...' : 'Download PDF'}
            </button>
          </div>
        </div>

        {downloadProgress > 0 && downloadProgress < 100 && (
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-ai-gradient" style={{ width: `${downloadProgress}%` }} />
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            className="rounded-xl border border-white/20 bg-white/5 p-2 text-slate-200 transition disabled:opacity-50"
            onClick={() => goToPage(currentPageIdx - 1)}
            disabled={currentPageIdx === 0}
          >
            <ChevronLeft size={16} />
          </button>
          <p className="text-sm text-slate-300">
            Page <span className="font-semibold text-white">{currentPageIdx + 1}</span> / {totalPages}
          </p>
          <button
            type="button"
            className="rounded-xl border border-white/20 bg-white/5 p-2 text-slate-200 transition disabled:opacity-50"
            onClick={() => goToPage(currentPageIdx + 1)}
            disabled={currentPageIdx >= totalPages - 1}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="glass-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Original Text</h3>
          </div>
          <div className="max-h-[520px] overflow-y-auto px-4 py-4 text-sm leading-7 text-slate-300">
            {originalPages[currentPageIdx]
              ? originalPages[currentPageIdx].split('\n').map((line, i) => <p key={`orig-${i}`}>{line || '\u00A0'}</p>)
              : <p className="italic text-slate-400">This page has no extractable text.</p>}
          </div>
        </article>

        <article className="glass-card overflow-hidden border-ai-primary/30">
          <div className="flex items-center justify-between border-b border-ai-primary/30 px-4 py-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ai-accent">Malayalam Translation</h3>
            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition ${
                copied
                  ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200'
                  : 'border-white/20 bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="max-h-[520px] overflow-y-auto px-4 py-4 text-sm leading-7 text-slate-100">
            {translatedPages[currentPageIdx]
              ? translatedPages[currentPageIdx].split('\n').map((line, i) => <p key={`trans-${i}`}>{line || '\u00A0'}</p>)
              : <p className="italic text-slate-400">No content generated for this page.</p>}
          </div>
        </article>
      </div>
    </motion.section>
  );
};

export default ResultViewer;

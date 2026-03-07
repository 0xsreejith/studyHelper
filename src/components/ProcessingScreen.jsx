import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, LoaderCircle, Sparkles } from 'lucide-react';
import { processDocumentLocally } from '../utils/localProcessor';
import { translateDocument } from '../utils/translator';
import { extractTextFromPDF } from '../utils/pdfTools';
import { extractTextFromDocx } from '../utils/docxTools';

const processingSteps = ['Extracting text', 'Translating to Malayalam', 'Generating result'];

const ProcessingScreen = ({ file, mode, onComplete, onError }) => {
  const [status, setStatus] = useState('Preparing your document...');
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
            },
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
              const pct = Math.round((done / totalProgress) * 55);
              setProgress(Math.min(95, 40 + pct));
              const computedPage = Math.max(1, Math.min(total, Math.ceil((done / totalProgress) * total)));
              setCurrentPage(computedPage);
              setStatus(`Translating... ${done}%`);
            });
          } catch (translateError) {
            throw new Error(translateError?.message || 'Translation service is unavailable.');
          }
        } else {
          for (let i = 0; i < pages.length; i += 1) {
            if (cancelled) return;

            const page = pages[i]?.trim() ?? '';
            const translated = page ? processDocumentLocally([page], mode)[0] : '';
            translatedPages.push(translated);

            const done = i + 1;
            setCurrentPage(done);
            setProgress(Math.min(95, 40 + Math.round((done / total) * 55)));
            setStatus(`Translating page ${done} of ${total}...`);

            await new Promise((resolve) => setTimeout(resolve, 0));
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
          setError(err.message);
          if (onError) onError(err.message);
        }
      }
    }

    process();
    return () => {
      cancelled = true;
    };
  }, [file, mode, onComplete, onError]);

  if (error) {
    return (
      <div className="section-shell mx-auto mt-6 max-w-3xl p-8 text-center">
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/40 bg-red-500/10 text-red-300">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-semibold text-red-200">Something went wrong</h2>
        <p className="mt-2 text-sm text-slate-300">{error}</p>
        <button type="button" className="btn-primary mt-6" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  const activeStep = progress < 35 ? 0 : progress < 88 ? 1 : 2;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="section-shell mx-auto mt-8 max-w-4xl p-6 sm:p-10"
    >
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-5 flex items-center justify-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, ease: 'linear', repeat: Infinity }}
            className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-ai-primary/40 bg-ai-primary/10 text-ai-accent"
          >
            <LoaderCircle size={24} />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-ai-accent/35 bg-ai-accent/10 text-ai-accent"
          >
            <Sparkles size={24} />
          </motion.div>
        </div>

        <h2 className="text-2xl font-semibold text-white">Processing Your Document</h2>
        <p className="mt-2 text-sm text-slate-300">{status}</p>

        {totalPages > 0 && (
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-ai-accent">
            Page {currentPage} / {totalPages}
          </p>
        )}

        <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-ai-gradient"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-300">{progress}% complete</p>

        <div className="mt-7 grid gap-2 text-left sm:grid-cols-3">
          {processingSteps.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0.6, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`rounded-xl border px-3 py-2 text-xs ${
                index <= activeStep
                  ? 'border-ai-accent/50 bg-ai-accent/10 text-ai-accent'
                  : 'border-white/15 bg-white/5 text-slate-300'
              }`}
            >
              {step}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default ProcessingScreen;

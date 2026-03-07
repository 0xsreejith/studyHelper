import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BookText, FileUp, Languages, Sparkles, Upload } from 'lucide-react';
import Header from './components/Header';
import ProcessingScreen from './components/ProcessingScreen';
import ResultViewer from './components/ResultViewer';
import UnifiedUpload from './components/UnifiedUpload';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedFile, setSelectedFile] = useState(null);

  const [originalPages, setOriginalPages] = useState([]);
  const [translatedPages, setTranslatedPages] = useState([]);

  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
  }, []);

  const handleStart = () => {
    if (selectedFile) {
      setCurrentView('processing');
    }
  };

  const handleProcessingComplete = useCallback((origPages, transPages) => {
    setOriginalPages(origPages);
    setTranslatedPages(transPages);
    setCurrentView('results');
  }, []);

  const handleReset = () => {
    setCurrentView('home');
    setSelectedFile(null);
    setOriginalPages([]);
    setTranslatedPages([]);
  };

  const canStart = Boolean(selectedFile);

  const goToSection = (id) => {
    const element = document.querySelector(id);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const navigateToSection = (id) => {
    setCurrentView('home');
    requestAnimationFrame(() => goToSection(id));
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <motion.div
        aria-hidden
        animate={{ y: [0, 22, -8, 0], x: [0, -12, 12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="blob blob-primary pointer-events-none absolute -left-32 top-20"
      />
      <motion.div
        aria-hidden
        animate={{ y: [0, -26, 8, 0], x: [0, 15, -10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="blob blob-secondary pointer-events-none absolute right-0 top-40"
      />
      <motion.div
        aria-hidden
        animate={{ y: [0, 20, -14, 0], x: [0, 8, -8, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="blob blob-accent pointer-events-none absolute bottom-8 left-[40%]"
      />

      <Header onNavigate={navigateToSection} />

      <main className="app-container relative z-10 pb-12 pt-6">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              <div className="space-y-8">
                <section
                  id="home"
                  className="relative grid items-center gap-10 py-8 md:py-12 lg:grid-cols-[1.15fr_0.85fr]"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="space-y-6"
                  >
                    <span className="inline-flex items-center gap-2 rounded-full border border-ai-accent/35 bg-ai-accent/10 px-4 py-1.5 text-xs font-medium text-ai-accent">
                      <Sparkles size={14} /> AI-Powered PDF Translation
                    </span>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                      Understand Any PDF Instantly
                    </h1>
                    <p className="max-w-xl text-base text-slate-300 sm:text-lg">
                      Upload your documents and translate them into simple Malayalam.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={() => goToSection('#translate')} className="btn-primary">
                        <Upload size={16} /> Upload PDF
                      </button>
                      <button type="button" onClick={() => goToSection('#translate')} className="btn-secondary">
                        Try Demo <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className="section-shell relative overflow-hidden"
                  >
                    <div className="pointer-events-none absolute inset-x-10 top-0 h-32 rounded-full bg-ai-primary/20 blur-3xl" />
                    <div className="relative space-y-4">
                      {[
                        'Upload your PDF syllabus or notes',
                        'Extract clean text from each page',
                        'Translate to simple Malayalam',
                        'Review and download instantly',
                      ].map((step, index) => (
                        <div
                          key={step}
                          className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-3"
                        >
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ai-gradient text-xs font-semibold text-white">
                            {index + 1}
                          </span>
                          <p className="text-sm text-slate-200/90">{step}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </section>

                <section id="translate" className="space-y-6">
                  <div className="section-shell">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-semibold text-white">Upload and Translate</h2>
                        <p className="mt-1 text-sm text-slate-300">Drag and drop your document to begin.</p>
                      </div>
                      <span className="hidden rounded-full border border-ai-accent/35 bg-ai-accent/10 px-3 py-1 text-xs text-ai-accent sm:block">
                        Malayalam Output
                      </span>
                    </div>
                    <UnifiedUpload onFileSelect={handleFileSelect} />
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-slate-300">
                        Drag &amp; Drop your PDF here or click to upload.
                      </p>
                      <button
                        type="button"
                        className="btn-primary px-8 py-3 text-base disabled:pointer-events-none disabled:opacity-50"
                        onClick={handleStart}
                        disabled={!canStart}
                      >
                        <Languages size={18} /> Start Translation
                      </button>
                    </div>
                  </div>
                </section>

                <section id="about">
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    className="section-shell grid gap-4 sm:grid-cols-3"
                  >
                    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <FileUp className="mb-2 text-ai-accent" size={20} />
                      <h3 className="text-sm font-semibold text-white">Fast Upload</h3>
                      <p className="mt-1 text-xs text-slate-300">Instant drag-and-drop support for lecture PDFs.</p>
                    </article>
                    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <Languages className="mb-2 text-ai-accent" size={20} />
                      <h3 className="text-sm font-semibold text-white">Malayalam Translation</h3>
                      <p className="mt-1 text-xs text-slate-300">Readable, student-friendly translated output.</p>
                    </article>
                    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <BookText className="mb-2 text-ai-accent" size={20} />
                      <h3 className="text-sm font-semibold text-white">Side-by-Side Review</h3>
                      <p className="mt-1 text-xs text-slate-300">Compare original and translated text page by page.</p>
                    </article>
                  </motion.div>
                </section>
              </div>
            </motion.div>
          )}

          {currentView === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <ProcessingScreen
                file={selectedFile}
                mode="translate"
                onComplete={handleProcessingComplete}
                onError={(err) => console.error(err)}
              />
            </motion.div>
          )}

          {currentView === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <ResultViewer
                mode="translate"
                originalPages={originalPages}
                translatedPages={translatedPages}
                fileName={selectedFile?.name || 'document'}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/10 bg-gradient-to-r from-ai-bg via-ai-card/50 to-ai-bg py-6">
        <div className="app-container flex flex-col items-center justify-between gap-2 text-sm text-slate-300 sm:flex-row">
          <p className="font-medium text-white">NoteLingo</p>
          <p>Built by Sreejith</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

import { useCallback, useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import './App.css';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import ProcessingScreen from './components/ProcessingScreen';
import ResultViewer from './components/ResultViewer';
import UnifiedUpload from './components/UnifiedUpload';
import Tools from './components/Tools';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedMode, setSelectedMode] = useState('translate');

  const [originalPages, setOriginalPages] = useState([]);
  const [translatedPages, setTranslatedPages] = useState([]);

  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
  }, []);

  const handleStart = () => {
    if (selectedFile && selectedMode) {
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
    setSelectedMode('translate');
    setOriginalPages([]);
    setTranslatedPages([]);
  };

  const canStart = Boolean(selectedFile);

  return (
    <>
      <div className="app-background"></div>
      <Header onNavigate={setCurrentView} currentView={currentView} />

      <main className="main-content">
        <div className="container">

          {currentView === 'home' && (
            <>
              <div className="hero-section">
                <h2 className="hero-title">
                  Transform Your Study Materials into <br />
                  <span className="text-gradient">Simple Malayalam Notes</span>
                </h2>
                <p className="hero-subtitle">
                  Upload file and click translate. Simple Malayalam output with backend translation + fallback.
                </p>
              </div>

              <UnifiedUpload onFileSelect={handleFileSelect} />

              <ModeSelector selectedMode={selectedMode} onSelectMode={setSelectedMode} />

              {canStart && (
                <div className="start-section">
                  <button className="btn-primary start-btn" onClick={handleStart}>
                    Translate Now <FiArrowRight />
                  </button>
                </div>
              )}
            </>
          )}

          {currentView === 'tools' && (
            <Tools />
          )}

          {currentView === 'processing' && (
            <ProcessingScreen
              file={selectedFile}
              mode={selectedMode}
              onComplete={handleProcessingComplete}
              onError={(err) => console.error(err)}
            />
          )}

          {currentView === 'results' && (
            <ResultViewer
              mode={selectedMode}
              originalPages={originalPages}
              translatedPages={translatedPages}
              fileName={selectedFile?.name || 'document'}
              onReset={handleReset}
            />
          )}

        </div>
      </main>

      <footer className="footer">
        <p>
          Created by Sreejith ·{' '}
          <a href="https://github.com/0xsreejith" target="_blank" rel="noreferrer">
            github.com/0xsreejith
          </a>
        </p>
      </footer>
    </>
  );
}

export default App;

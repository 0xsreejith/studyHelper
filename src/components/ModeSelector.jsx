import { FiBook, FiCreditCard, FiFileText, FiHelpCircle, FiList, FiMessageCircle } from 'react-icons/fi';
import './ModeSelector.css';

const modes = [
    {
        id: 'translate',
        title: '📄 Page-by-Page Translation',
        description: 'Translate English to Malayalam maintaining structure.',
        icon: <FiMessageCircle />,
        color: 'var(--accent-primary)'
    },
    {
        id: 'questions',
        title: '📝 Exam Q&A Generator',
        description: '2-mark, 5-mark, and 10-mark questions auto-generated.',
        icon: <FiHelpCircle />,
        color: '#ff6b6b'
    },
    {
        id: 'flashcards',
        title: '🃏 Flashcards',
        description: 'Quick revision cards created from your notes.',
        icon: <FiCreditCard />,
        color: '#4ecdc4'
    },
    {
        id: 'summary',
        title: '📚 Smart Summaries',
        description: 'Condense chapters into key concepts.',
        icon: <FiList />,
        color: '#ff007f'
    },
    {
        id: 'explain',
        title: '👨‍🏫 Teacher Explanations',
        description: 'Complex topics explained in simple Malayalam.',
        icon: <FiFileText />,
        color: '#00e676'
    },
    {
        id: 'exam',
        title: '📋 Exam Notes',
        description: 'Structured, point-wise notes for revision.',
        icon: <FiBook />,
        color: 'var(--accent-secondary)'
    }
];

const ModeSelector = ({ selectedMode, onSelectMode }) => {
    return (
        <div className="mode-selector">
            <h3 className="section-title">Select Study Mode</h3>
            <div className="mode-grid">
                {modes.map((mode) => (
                    <div
                        key={mode.id}
                        className={`mode-card glass-panel ${selectedMode === mode.id ? 'active' : ''}`}
                        onClick={() => onSelectMode(mode.id)}
                        style={{ '--card-color': mode.color }}
                    >
                        <div className="mode-icon-wrapper">
                            {mode.icon}
                        </div>
                        <div className="mode-content">
                            <h4>{mode.title}</h4>
                            <p>{mode.description}</p>
                        </div>
                        <div className="selection-indicator"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModeSelector;

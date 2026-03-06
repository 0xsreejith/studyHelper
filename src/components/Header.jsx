import './Header.css';
import { FiBookOpen, FiTool } from 'react-icons/fi';

const Header = ({ onNavigate, currentView }) => {
  return (
    <header className="header glass-panel">
      <div className="header-container">
        <div className="logo-section" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon-container">
            <FiBookOpen className="logo-icon" />
          </div>
          <h1 className="logo-text">
            Study<span className="text-gradient">Explain</span> <span className="logo-badge">AI</span>
          </h1>
        </div>
        
        <nav className="header-nav">
          <a 
            href="#" 
            className={`nav-link ${currentView === 'home' ? 'active' : ''}`} 
            onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
          >
            Home
          </a>
          <a 
            href="#" 
            className={`nav-link ${currentView === 'tools' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); onNavigate('tools'); }}
          >
            <FiTool /> Tools
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;

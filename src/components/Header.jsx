import './Header.css';
import { FiBookOpen } from 'react-icons/fi';

const Header = ({ onNavigate, currentView }) => {
  return (
    <header className="header glass-panel">
      <div className="header-container">
        <div className="logo-section" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon-container">
            <FiBookOpen className="logo-icon" />
          </div>
          <h1 className="logo-text">Note<span className="text-gradient">Lingo</span></h1>
        </div>
        
        <nav className="header-nav">
          <a 
            href="#" 
            className={`nav-link ${currentView === 'home' ? 'active' : ''}`} 
            onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
          >
            Home
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;

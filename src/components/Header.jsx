import { motion } from 'framer-motion';
import { FileUp, Languages, Sparkles } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Translate', href: '#translate' },
  { label: 'About', href: '#about' },
];

const Header = ({ onNavigate }) => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-white/10 bg-ai-bg/60 backdrop-blur-2xl"
    >
      <div className="app-container">
        <div className="flex h-16 items-center justify-between sm:h-20">
          <button
            type="button"
            onClick={() => onNavigate('#home')}
            className="group inline-flex items-center gap-3"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-ai-gradient text-white shadow-glow">
              <Languages size={20} />
            </span>
            <span className="text-lg font-bold tracking-tight text-ai-text sm:text-xl">
              NoteLingo
            </span>
          </button>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-300 md:flex">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => onNavigate(item.href)}
                className="transition-colors hover:text-white"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => onNavigate('#translate')}
            className="btn-primary px-3 py-2 text-sm sm:px-5 sm:py-3"
          >
            <FileUp size={16} />
            <span className="hidden sm:inline">Upload PDF</span>
          </button>
        </div>

        <nav className="mb-3 flex items-center justify-center gap-2 text-xs font-medium text-slate-300 md:hidden">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item.href)}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 transition hover:text-white"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-ai-accent/70 to-transparent" />
      <div className="pointer-events-none absolute right-12 top-3 hidden md:block">
        <Sparkles size={16} className="text-ai-accent/60" />
      </div>
    </motion.header>
  );
};

export default Header;

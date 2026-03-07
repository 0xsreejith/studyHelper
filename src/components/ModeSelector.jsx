import { motion } from 'framer-motion';
import { BookOpen, ClipboardList, FileText, HelpCircle, Layers, MessageSquareText } from 'lucide-react';

const modes = [
  {
    id: 'translate',
    title: 'Page Translation',
    description: 'Translate page by page while preserving structure.',
    icon: MessageSquareText,
    ring: 'from-indigo-500/40 to-cyan-300/40',
  },
  {
    id: 'questions',
    title: 'Exam Q&A',
    description: 'Auto-generate 2, 5, and 10-mark questions.',
    icon: HelpCircle,
    ring: 'from-cyan-400/30 to-violet-500/40',
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    description: 'Generate quick memory cards for revision.',
    icon: Layers,
    ring: 'from-sky-400/30 to-indigo-400/40',
  },
  {
    id: 'summary',
    title: 'Smart Summary',
    description: 'Condense long chapters into key concepts.',
    icon: ClipboardList,
    ring: 'from-fuchsia-500/30 to-indigo-500/40',
  },
  {
    id: 'explain',
    title: 'Teacher Explain',
    description: 'Detailed explanation in simple Malayalam.',
    icon: FileText,
    ring: 'from-emerald-400/30 to-cyan-500/40',
  },
  {
    id: 'exam',
    title: 'Exam Notes',
    description: 'Structured, point-wise notes for faster prep.',
    icon: BookOpen,
    ring: 'from-violet-400/30 to-indigo-500/40',
  },
];

const ModeSelector = ({ selectedMode, onSelectMode }) => {
  return (
    <section id="translate" className="section-shell">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-white">Translation Modes</h3>
          <p className="mt-1 text-sm text-slate-300">Select how NoteLingo should process your document.</p>
        </div>
        <span className="rounded-full border border-ai-accent/40 bg-ai-accent/10 px-3 py-1 text-xs font-medium text-ai-accent">
          AI Ready
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {modes.map((mode, index) => {
          const Icon = mode.icon;
          const active = selectedMode === mode.id;

          return (
            <motion.button
              key={mode.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * index, duration: 0.28 }}
              whileHover={{ y: -4 }}
              onClick={() => onSelectMode(mode.id)}
              className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all ${
                active
                  ? 'border-ai-primary/70 bg-white/10 shadow-glow'
                  : 'border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10'
              }`}
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${mode.ring} opacity-35`} />
              <div className="relative z-10 flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-black/20 text-ai-accent">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{mode.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">{mode.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};

export default ModeSelector;

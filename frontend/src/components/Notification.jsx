import { useEffect } from 'react';

export default function Notification({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-24 right-8 glass border-2 border-emerald-500/50 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-500/50 flex items-center gap-4 z-[100] animate-slide-in-right min-w-[300px] neon-glow">
      <span className="text-emerald-400 text-2xl">✓</span>
      <span className="flex-1 font-medium">{message}</span>
      <button onClick={onClose} className="text-2xl leading-none hover:text-emerald-400 transition-colors">×</button>
    </div>
  );
}

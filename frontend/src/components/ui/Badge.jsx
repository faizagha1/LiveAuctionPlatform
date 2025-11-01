import React from 'react';

const Badge = ({ children, variant = 'default' }) => {
    const variants = {
        default: 'bg-gray-900 text-white/70 border-white/20',
        draft: 'bg-gray-900 text-gray-400 border-gray-600/30',
        pending: 'bg-yellow-950/30 text-yellow-500/90 border-yellow-500/30',
        approved: 'bg-green-950/30 text-green-500/90 border-green-500/30',
        rejected: 'bg-red-950/30 text-red-500/90 border-red-500/30',
        in_auction: 'bg-blue-950/30 text-blue-400/90 border-blue-500/30',
        completed: 'bg-purple-950/30 text-purple-400/90 border-purple-500/30',
        cancelled: 'bg-orange-950/30 text-orange-400/90 border-orange-500/30',
    };

    return (
        <span className={`inline-flex items-center px-4 py-1.5 text-xs font-mono uppercase tracking-[0.2em] border ${variants[variant]}`}>
      {children}
    </span>
    );
};

export default Badge;
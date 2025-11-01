import React from 'react';

const Textarea = ({ error, label, ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-mono uppercase tracking-[0.25em] text-white/50 mb-3">
                    {label}
                </label>
            )}
            <textarea
                className={`w-full bg-gray-900/30 border ${error ? 'border-red-500/50' : 'border-white/10'} px-5 py-4 text-white placeholder:text-white/30 font-mono tracking-wider focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed`}
                {...props}
            />
            {error && (
                <p className="mt-2 text-xs text-red-400/90 font-mono tracking-wide">{error}</p>
            )}
        </div>
    );
};

export default Textarea;
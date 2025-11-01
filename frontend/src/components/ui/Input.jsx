import React from 'react';

const Input = ({ icon: Icon, error, label, ...props }) => {
    return (
        <div className="w-full group">
            {label && (
                <label className="block text-xs font-mono uppercase tracking-[0.25em] text-white/50 mb-3 group-focus-within:text-amber-500/70 transition-all">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-0 top-0 bottom-0 w-14 border-r border-white/10 flex items-center justify-center group-focus-within:border-amber-500/30 transition-all">
                        <Icon className="w-5 h-5 text-white/40 group-focus-within:text-amber-500/60 transition-all" />
                    </div>
                )}
                <input
                    className={`w-full bg-gray-900/30 border ${error ? 'border-red-500/50' : 'border-white/10'} px-5 py-4 text-white placeholder:text-white/30 font-mono tracking-wider focus:outline-none focus:border-amber-500/50 focus:bg-gray-900/50 transition-all ${Icon && 'pl-16'}`}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-2 text-xs text-red-400/90 font-mono tracking-wide animate-slideIn">{error}</p>
            )}
        </div>
    );
};

export default Input;
import React from 'react';

const Button = ({ children, variant = 'primary', size = 'md', disabled = false, isLoading = false, ...props }) => {
    const variants = {
        primary: "bg-gray-900 border-2 border-amber-500/60 hover:bg-amber-500/5 hover:border-amber-500 text-amber-500/90 hover:text-amber-500",
        secondary: "bg-transparent border border-white/20 hover:bg-white/5 hover:border-white/40 text-white/70 hover:text-white",
        ghost: "border border-transparent hover:border-white/20 hover:bg-white/5 text-white/60 hover:text-white",
        danger: "bg-transparent border border-red-500/50 hover:bg-red-500/5 hover:border-red-500 text-red-500/80 hover:text-red-500",
    };

    const sizes = {
        sm: "px-5 py-2 text-xs",
        md: "px-7 py-3 text-sm",
        lg: "px-10 py-4 text-base",
    };

    return (
        <button
            className={`font-mono uppercase tracking-[0.2em] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 justify-center transition-all duration-300 ${variants[variant]} ${sizes[size]}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <div className="w-4 h-4 border border-current border-t-transparent animate-spin" />
                    <span>Loading</span>
                </>
            ) : children}
        </button>
    );
};


export default Button;
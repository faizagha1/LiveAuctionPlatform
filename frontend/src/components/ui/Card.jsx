import React from 'react';

const Card = ({ children, hover = true, className = "", ...props }) => {
    return (
        <div
            className={`bg-gray-900/30 border border-white/10 p-8 ${hover && 'hover:border-amber-500/30 hover:bg-gray-900/40 cursor-pointer'} transition-all duration-300 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
import React from 'react';
import Button from './Button';

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => {
    return (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            {Icon && (
                <div className="w-32 h-32 border border-amber-500/20 flex items-center justify-center mb-8">
                    <div className="w-24 h-24 border border-amber-500/10 flex items-center justify-center">
                        <Icon className="w-12 h-12 text-amber-500/40" />
                    </div>
                </div>
            )}

            <h3 className="text-2xl font-bold font-mono text-white/80 mb-3 uppercase tracking-[0.2em]">{title}</h3>
            <p className="text-white/40 font-mono mb-8 max-w-md text-sm tracking-wide leading-relaxed">{description}</p>

            {actionLabel && onAction && (
                <Button variant="primary" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
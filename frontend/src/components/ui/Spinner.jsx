import React from 'react';
import { cn } from '../../lib/utils';

const Spinner = ({ size = 'md' }) => {
    const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-4' };
    return (
        <div className="flex items-center justify-center">
            <div className={`border-white/30 border-t-white animate-spin ${sizes[size]}`} />
        </div>
    );
};

export default Spinner;
import React from 'react';

const Background = () => {
    return (
        <div className="fixed inset-0 -z-10 bg-gray-950 overflow-hidden">
            {/* Animated shifting grid */}
            <div className="absolute inset-0 opacity-30 animate-gridShift" style={{
                backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(245, 158, 11, 0.2) 31px, rgba(245, 158, 11, 0.2) 32px),
          repeating-linear-gradient(90deg, transparent, transparent 31px, rgba(245, 158, 11, 0.2) 31px, rgba(245, 158, 11, 0.2) 32px)
        `,
            }} />

            {/* Major grid lines - thicker, more visible */}
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 127px, rgba(245, 158, 11, 0.4) 127px, rgba(245, 158, 11, 0.4) 129px),
          repeating-linear-gradient(90deg, transparent, transparent 127px, rgba(245, 158, 11, 0.4) 127px, rgba(245, 158, 11, 0.4) 129px)
        `,
            }} />

            {/* Scanning line - vertical */}
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-500/50 to-transparent animate-scanline"></div>
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-500/50 to-transparent animate-scanline" style={{ animationDelay: '4s' }}></div>

            {/* Pulsing corner markers - BIGGER */}
            <div className="absolute top-1/4 left-1/4 w-4 h-4 border-2 border-amber-500/60 animate-cornerPulse"></div>
            <div className="absolute top-1/4 right-1/4 w-4 h-4 border-2 border-amber-500/60 animate-cornerPulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-1/4 left-1/4 w-4 h-4 border-2 border-amber-500/60 animate-cornerPulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/4 right-1/4 w-4 h-4 border-2 border-amber-500/60 animate-cornerPulse" style={{ animationDelay: '1.5s' }}></div>

            {/* Rotating geometric shapes */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-32 h-32 border-2 border-amber-500/20 animate-boxRotate"></div>
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-24 h-24 border-2 border-amber-500/15 animate-boxRotate" style={{ animationDelay: '5s' }}></div>

            {/* Expanding squares */}
            <div className="absolute top-1/3 left-1/4 w-16 h-16 border border-amber-500/30 animate-expand"></div>
            <div className="absolute top-2/3 right-1/4 w-20 h-20 border border-amber-500/25 animate-expand" style={{ animationDelay: '3s' }}></div>

            {/* Central breathing ornament - ENHANCED */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-2 border-amber-500/20 animate-breathe">
                <div className="absolute inset-8 border-2 border-amber-500/15"></div>
                <div className="absolute inset-16 border border-amber-500/10"></div>
                <div className="absolute top-0 left-0 w-6 h-6 border-r-2 border-b-2 border-amber-500/40 animate-pulse-custom"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-l-2 border-b-2 border-amber-500/40 animate-pulse-custom" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-r-2 border-t-2 border-amber-500/40 animate-pulse-custom" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-l-2 border-t-2 border-amber-500/40 animate-pulse-custom" style={{ animationDelay: '3s' }}></div>
            </div>

            {/* Animated corner brackets */}
            <div className="absolute top-8 left-8 w-32 h-32 border-l-4 border-t-4 border-amber-500/30 animate-slideVertical"></div>
            <div className="absolute top-8 right-8 w-32 h-32 border-r-4 border-t-4 border-amber-500/30 animate-slideVertical" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute bottom-8 left-8 w-32 h-32 border-l-4 border-b-4 border-amber-500/30 animate-slideVertical" style={{ animationDelay: '3s' }}></div>
            <div className="absolute bottom-8 right-8 w-32 h-32 border-r-4 border-b-4 border-amber-500/30 animate-slideVertical" style={{ animationDelay: '4.5s' }}></div>

            {/* Horizontal scanning lines */}
            <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent animate-pulse-custom"></div>
            <div className="absolute top-2/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent animate-pulse-custom" style={{ animationDelay: '2s' }}></div>

            {/* Floating rectangles */}
            <div className="absolute top-20 right-1/4 w-24 h-12 border border-amber-500/20 animate-slideVertical" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 left-1/3 w-16 h-24 border border-amber-500/20 animate-slideVertical" style={{ animationDelay: '2.5s' }}></div>
        </div>
    );
};


export default Background;
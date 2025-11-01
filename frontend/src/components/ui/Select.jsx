import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({ options = [], error, label, icon: Icon, ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-mono uppercase tracking-[0.25em] text-white/50 mb-3">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-0 top-0 bottom-0 w-14 border-r border-white/10 flex items-center justify-center pointer-events-none">
                        <Icon className="w-5 h-5 text-white/40" />
                    </div>
                )}
                <select
                    className={`w-full bg-gray-900/30 border ${error ? 'border-red-500/50' : 'border-white/10'} px-5 py-4 text-white font-mono tracking-wider focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer ${Icon && 'pl-16'} pr-12`}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 border border-white/20 flex items-center justify-center pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-white/40" />
                </div>
            </div>
            {error && (
                <p className="mt-2 text-xs text-red-400/90 font-mono tracking-wide">{error}</p>
            )}
        </div>
    );
};

export default Select;
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const StatCard = ({ title, value, icon: Icon, trend, trendValue }) => {
    return (
        <div className="bg-gray-900/30 border border-white/10 p-8 hover:border-amber-500/30 hover:bg-gray-900/40 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                    <p className="text-white/40 text-xs font-mono uppercase tracking-[0.25em] mb-4">{title}</p>
                    <p className="text-5xl font-bold font-mono text-white/90 group-hover:text-amber-500/80 transition-all tracking-tight">{value}</p>
                </div>

                {Icon && (
                    <div className="w-16 h-16 border border-amber-500/30 flex items-center justify-center group-hover:border-amber-500/60 transition-all">
                        <Icon className="w-8 h-8 text-amber-500/50 group-hover:text-amber-500/80 transition-all" />
                    </div>
                )}
            </div>

            {trend && (
                <div className={`flex items-center gap-2 text-xs font-mono tracking-wider ${trend === 'up' ? 'text-green-500/80' : 'text-red-500/80'}`}>
                    <div className="w-6 h-6 border border-current flex items-center justify-center">
                        {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    </div>
                    <span>{trendValue}</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
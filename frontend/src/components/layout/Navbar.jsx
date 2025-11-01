import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, LogOut, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Button from '../ui/Button';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuthStore();

    return (
        <nav className="fixed top-0 left-0 right-0 z-30 bg-gray-950 border-b-2 border-amber-500/30">
            <div className="max-w-7xl mx-auto px-12">
                <div className="flex justify-between items-center h-24">
                    <div className="flex items-center gap-6 group cursor-pointer">
                        <div className="relative w-16 h-16 border-2 border-amber-500/50 flex items-center justify-center transition-all group-hover:border-amber-500">
                            <div className="absolute inset-2 border border-amber-500/30"></div>
                            <Gavel className="w-8 h-8 text-amber-500/80 transition-transform group-hover:rotate-12" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500"></div>
                        </div>
                        <div>
                            <span className="text-2xl font-bold font-mono tracking-[0.3em] text-amber-500/90 uppercase block">AuctionVerse</span>
                            <div className="h-px w-full bg-amber-500/30 mt-1"></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {isAuthenticated && user ? (
                            <>
                                <button className="text-sm text-white/60 hover:text-amber-500 font-mono uppercase tracking-[0.2em] border-b-2 border-transparent hover:border-amber-500/50 pb-1 transition-all">
                                    Dashboard
                                </button>
                                <div className="flex items-center gap-4 bg-gray-900/50 border border-white/10 px-6 py-3 hover:border-amber-500/30 transition-all">
                                    <div className="w-7 h-7 border border-amber-500/50 flex items-center justify-center">
                                        <User className="w-4 h-4 text-amber-500/70" />
                                    </div>
                                    <span className="text-sm text-white/80 font-mono tracking-wider">{user.username}</span>
                                </div>
                                <button onClick={logout} className="px-6 py-3 border border-white/20 hover:bg-white/5 hover:border-amber-500/30 flex items-center gap-3 font-mono text-sm uppercase tracking-[0.2em] text-white/70 hover:text-amber-500 transition-all">
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="px-6 py-3 border border-white/20 hover:bg-white/5 hover:border-amber-500/30 font-mono text-sm uppercase tracking-[0.2em] text-white/70 hover:text-amber-500 transition-all">
                                    Login
                                </button>
                                <button className="px-6 py-3 bg-amber-500/10 border border-amber-500/50 hover:bg-amber-500/20 hover:border-amber-500 font-mono text-sm uppercase tracking-[0.2em] text-amber-500 transition-all">
                                    Begin
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Gavel, ShoppingCart, ArrowRight, Shield } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Navbar from '../components/layout/Navbar';
import Background from '../components/layout/Background';
import Button from '../components/ui/Button';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { user, hasRole } = useAuthStore();

    const quickActions = [
        {
            title: 'My Items',
            description: 'Manage your auction items',
            icon: Package,
            color: 'from-purple-500 to-pink-500',
            path: '/seller/my-items',
            show: !hasRole('ADMIN'), // <-- UPDATED THIS LINE
        },
        {
            title: 'Become an Auctioneer',
            description: 'Apply to start hosting auctions',
            icon: Gavel,
            color: 'from-cyan-500 to-teal-500',
            path: '/auctioneer/apply',
            show: !hasRole('AUCTIONEER') && !hasRole('ADMIN'),
        },
        {
            title: 'Claim Marketplace',
            description: 'Browse items to claim',
            icon: ShoppingCart,
            color: 'from-blue-500 to-cyan-500',
            path: '/auctioneer/marketplace',
            show: hasRole('AUCTIONEER'),
        },
        {
            title: 'My Auctions',
            description: 'Manage your auctions',
            icon: Gavel,
            color: 'from-green-500 to-emerald-500',
            path: '/auctioneer/my-auctions',
            show: hasRole('AUCTIONEER'),
        },
        {
            title: 'Browse Auctions',
            description: 'Discover ongoing auctions',
            icon: Gavel,
            color: 'from-orange-500 to-red-500',
            path: '/auctions',
            show: !hasRole('ADMIN'),
        },
        {
            title: 'Admin Dashboard',
            description: 'Manage platform operations',
            icon: Shield,
            color: 'from-red-500 to-pink-500',
            path: '/admin/dashboard',
            show: hasRole('ADMIN'),
        },
    ];

    const visibleActions = quickActions.filter(action => action.show);

    return (
        <div className="min-h-screen">
            <Background />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Welcome, {user?.username}! 🎉
                    </h1>
                    <p className="text-white/60 text-lg mb-8">
                        Your email: {user?.email}
                    </p>

                    {/* Roles Card */}
                    <div className="glass rounded-2xl p-8 mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Your Roles</h2>
                        <div className="flex flex-wrap gap-2">
                            {user?.roles?.map((role, index) => (
                                <span
                                    key={index}
                                    className="glass px-4 py-2 rounded-lg text-purple-400 font-medium"
                                >
                  {role.replace('ROLE_', '')}
                </span>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {visibleActions.map((action, index) => {
                                const Icon = action.icon;
                                return (
                                    <motion.button
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => !action.disabled && navigate(action.path)}
                                        disabled={action.disabled}
                                        className={`glass rounded-2xl p-6 text-left glass-hover group relative overflow-hidden ${
                                            action.disabled ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4`}>
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                            {action.title}
                                            {!action.disabled && <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                        </h3>
                                        <p className="text-white/60 text-sm">{action.description}</p>

                                        {action.disabled && (
                                            <span className="inline-block mt-3 text-xs text-yellow-400">Coming Soon</span>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass rounded-2xl p-6"
                        >
                            <div className="text-purple-400 text-sm font-medium mb-2">Account Status</div>
                            <div className="text-3xl font-bold text-white mb-1">Active</div>
                            <div className="text-white/60 text-sm">All systems operational</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass rounded-2xl p-6"
                        >
                            <div className="text-blue-400 text-sm font-medium mb-2">My Items</div>
                            <div className="text-3xl font-bold text-white mb-1">0</div>
                            <div className="text-white/60 text-sm">No items yet</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass rounded-2xl p-6"
                        >
                            <div className="text-pink-400 text-sm font-medium mb-2">My Auctions</div>
                            <div className="text-3xl font-bold text-white mb-1">0</div>
                            <div className="text-white/60 text-sm">No auctions yet</div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardPage;
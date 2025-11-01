import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Package, Users, Gavel, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Background from '../../components/layout/Background';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';
import { useToast } from '../../components/ui/Toast';
import { adminItemAPI, adminAuthAPI } from '../../lib/api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        itemsForReview: 0,
        pendingApplications: 0,
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [itemsRes, appsRes] = await Promise.all([
                adminItemAPI.getItemsForReview(),
                adminAuthAPI.listPendingApplications(),
            ]);

            setStats({
                itemsForReview: itemsRes.data?.length || 0,
                pendingApplications: appsRes.data?.length || 0,
            });
        } catch (error) {
            toast.error('Failed to load dashboard stats');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: 'Review Items',
            description: 'Approve or reject pending items',
            icon: Package,
            color: 'from-purple-500 to-pink-500',
            path: '/admin/items',
            count: stats.itemsForReview,
        },
        {
            title: 'Review Applications',
            description: 'Approve auctioneer applications',
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            path: '/admin/applications',
            count: stats.pendingApplications,
        },
        {
            title: 'Platform Stats',
            description: 'View analytics and metrics',
            icon: TrendingUp,
            color: 'from-green-500 to-emerald-500',
            path: '#',
            disabled: true,
        },
    ];

    return (
        <div className="min-h-screen">
            <Background />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
                            <p className="text-white/60">Manage platform operations</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                title="Items Pending"
                                value={stats.itemsForReview}
                                icon={Clock}
                            />
                            <StatCard
                                title="Applications"
                                value={stats.pendingApplications}
                                icon={Users}
                            />
                            <StatCard
                                title="Total Items"
                                value="--"
                                icon={Package}
                            />
                            <StatCard
                                title="Active Auctions"
                                value="--"
                                icon={Gavel}
                            />
                        </div>

                        {/* Quick Actions */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {quickActions.map((action, index) => {
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

                                            {action.count > 0 && (
                                                <div className="absolute top-4 right-4">
                          <span className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">
                            {action.count}
                          </span>
                                                </div>
                                            )}

                                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4`}>
                                                <Icon className="w-7 h-7 text-white" />
                                            </div>

                                            <h3 className="text-xl font-bold text-white mb-2">
                                                {action.title}
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

                        {/* Recent Activity */}
                        <div className="glass rounded-2xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
                            <div className="space-y-4">
                                {stats.itemsForReview > 0 && (
                                    <div className="flex items-center gap-4 p-4 glass rounded-xl">
                                        <AlertCircle className="w-6 h-6 text-yellow-400" />
                                        <div className="flex-1">
                                            <p className="text-white font-medium">
                                                {stats.itemsForReview} items waiting for review
                                            </p>
                                            <p className="text-white/60 text-sm">Action required</p>
                                        </div>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => navigate('/admin/items')}
                                        >
                                            Review Now
                                        </Button>
                                    </div>
                                )}

                                {stats.pendingApplications > 0 && (
                                    <div className="flex items-center gap-4 p-4 glass rounded-xl">
                                        <AlertCircle className="w-6 h-6 text-blue-400" />
                                        <div className="flex-1">
                                            <p className="text-white font-medium">
                                                {stats.pendingApplications} auctioneer applications pending
                                            </p>
                                            <p className="text-white/60 text-sm">Action required</p>
                                        </div>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => navigate('/admin/applications')}
                                        >
                                            Review Now
                                        </Button>
                                    </div>
                                )}

                                {stats.itemsForReview === 0 && stats.pendingApplications === 0 && (
                                    <div className="text-center py-8 text-white/60">
                                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                                        <p>All caught up! No pending tasks.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
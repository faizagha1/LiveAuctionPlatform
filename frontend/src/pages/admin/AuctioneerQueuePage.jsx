import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, ChevronRight, User } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Background from '../../components/layout/Background';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { adminAuthAPI } from '../../lib/api';

const AuctioneerQueuePage = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await adminAuthAPI.listPendingApplications();
            if (response.data && Array.isArray(response.data.content)) {
                setApplications(response.data.content);
            } else {
                setApplications([]);
            }
        } catch (error) {
            toast.error('Failed to load applications');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen">
            <Background />
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/admin/dashboard')}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </Button>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Auctioneer Applications
                    </h1>
                    <p className="text-white/60">
                        Review and approve auctioneer applications
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                ) : applications.length === 0 ? (
                    <div className="glass rounded-2xl">
                        <EmptyState
                            icon={Users}
                            title="All caught up!"
                            description="No applications pending review at the moment"
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app, index) => (
                            <motion.div
                                key={app.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <button
                                    onClick={() => navigate(`/admin/applications/${app.id}`)}
                                    className="w-full glass rounded-2xl p-6 text-left glass-hover group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex-shrink-0 flex items-center justify-center">
                                                <User className="w-6 h-6 text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">
                                                    {app.username}
                                                </h3>
                                                <p className="text-white/60 text-sm">{app.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden sm:block">
                                                <Badge variant="pending">{app.status}</Badge>
                                                <p className="text-white/60 text-sm mt-1">
                                                    Applied: {formatDate(app.appliedAt)}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-6 h-6 text-white/60 group-hover:text-white" />
                                        </div>
                                    </div>
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuctioneerQueuePage;
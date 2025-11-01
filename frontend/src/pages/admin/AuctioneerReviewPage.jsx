import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, CheckCircle, XCircle, User,
    Mail, Calendar, Clock
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Background from '../../components/layout/Background';
import Button from '../../components/ui/Button';
import Dialog from '../../components/ui/Dialog';
import Textarea from '../../components/ui/Textarea';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { adminAuthAPI } from '../../lib/api';

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start justify-between py-2">
        <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-white/60" />
            <span className="text-white/60 text-sm">{label}</span>
        </div>
        <span className="text-white text-sm font-medium text-right">{value || 'N/A'}</span>
    </div>
);

const AuctioneerReviewPage = () => {
    const navigate = useNavigate();
    const { applicationId } = useParams();
    const toast = useToast();

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);

    const [reviewModal, setReviewModal] = useState({
        isOpen: false,
        approve: true,
    });
    const [reviewComment, setReviewComment] = useState('');
    const [reviewing, setReviewing] = useState(false);

    useEffect(() => {
        fetchApplicationDetails();
    }, [applicationId]);

    const fetchApplicationDetails = async () => {
        try {
            setLoading(true);
            const response = await adminAuthAPI.getApplicationDetails(applicationId);
            setApplication(response.data);
        } catch (error) {
            toast.error('Failed to load application details');
            console.error(error);
            navigate('/admin/applications');
        } finally {
            setLoading(false);
        }
    };

    const openReviewModal = (approve) => {
        setReviewModal({ isOpen: true, approve });
        setReviewComment('');
    };

    const closeReviewModal = () => {
        setReviewModal({ isOpen: false, approve: true });
        setReviewComment('');
    };

    const handleReviewApplication = async () => {
        try {
            setReviewing(true);
            await adminAuthAPI.reviewApplication(applicationId, {
                response: reviewModal.approve ? 'APPROVED' : 'REJECTED',
                comment: reviewComment,
            });

            toast.success(`Application ${reviewModal.approve ? 'approved' : 'rejected'} successfully!`);
            closeReviewModal();
            navigate('/admin/applications');
        } catch (error) {
            toast.error(error.message || 'Failed to review application');
        } finally {
            setReviewing(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
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
                        onClick={() => navigate('/admin/applications')}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Queue
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                ) : !application ? (
                    <div className="text-center text-white/60">Application not found.</div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-2xl p-6 md:p-8"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <User className="w-8 h-8 text-purple-400" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">
                                        {application.username}
                                    </h1>
                                    <p className="text-white/60 text-lg flex items-center gap-2">
                                        <Mail className="w-5 h-5" /> {application.email}
                                    </p>
                                </div>
                            </div>
                            <Badge variant="pending">{application.status}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                            <div className="glass rounded-xl p-4">
                                <h4 className="text-white font-medium mb-2">Application Reason</h4>
                                <p className="text-white/80 text-sm max-h-48 overflow-y-auto">
                                    {application.applicationReason || 'No reason provided.'}
                                </p>
                            </div>

                            <div className="glass rounded-xl p-4 divide-y divide-white/10">
                                <InfoRow icon={Clock} label="Application Date" value={formatDate(application.appliedAt)} />
                                <InfoRow icon={Calendar} label="User Since" value={formatDate(application.userRegisteredAt)} />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={() => openReviewModal(true)}
                            >
                                <CheckCircle className="w-5 h-5" />
                                Approve
                            </Button>
                            <Button
                                variant="danger"
                                className="flex-1"
                                onClick={() => openReviewModal(false)}
                            >
                                <XCircle className="w-5 h-5" />
                                Reject
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>

            <Dialog
                isOpen={reviewModal.isOpen}
                onClose={closeReviewModal}
                title={reviewModal.approve ? 'Approve Application' : 'Reject Application'}
                size="md"
            >
                {application && (
                    <div className="space-y-6">
                        <div className="glass rounded-xl p-4">
                            <h3 className="text-lg font-bold text-white mb-1">
                                {application.username}
                            </h3>
                            <p className="text-white/60 text-sm">
                                {application.email}
                            </p>
                        </div>

                        <div className={`glass rounded-xl p-4 ${
                            reviewModal.approve
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-red-500/10 border-red-500/30'
                        }`}>
                            <p className={reviewModal.approve ? 'text-green-300' : 'text-red-300'}>
                                {reviewModal.approve
                                    ? 'This user will be granted AUCTIONEER role.'
                                    : 'This application will be rejected.'}
                            </p>
                        </div>

                        <Textarea
                            label={`Review Comment ${reviewModal.approve ? '(Optional)' : '(Recommended)'}`}
                            placeholder={reviewModal.approve
                                ? 'Add a welcome message or notes...'
                                : 'Explain why the application is being rejected...'}
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            rows={4}
                        />

                        <div className="flex gap-4">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={closeReviewModal}
                                disabled={reviewing}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={reviewModal.approve ? 'primary' : 'danger'}
                                className="flex-1"
                                onClick={handleReviewApplication}
                                isLoading={reviewing}
                                disabled={reviewing}
                            >
                                {reviewModal.approve ? 'Approve Application' : 'Reject Application'}
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default AuctioneerReviewPage;
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {Gavel, CheckCircle, Clock, XCircle, AlertCircle, ArrowLeft, Send} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Background from '../../components/layout/Background';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import { useToast } from '../../components/ui/Toast';
import { authAPI } from '../../lib/api.js'
import useAuthStore from '../../store/authStore';

const AuctioneerApplicationPage = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuthStore(); // Get the logged-in user's data
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (reason.length < 50) {
            toast.error('Please provide a more detailed reason (at least 50 characters).');
            return;
        }

        setIsLoading(true);
        try {
            // Send the full request object as defined by your DTO
            await authAPI.applyForAuctioneer({
                userId: user.id,
                username: user.username,
                email: user.email,
                reason: reason
            });

            toast.success('Application submitted successfully! Please wait for admin review.');
            navigate('/dashboard');

        } catch (error) {
            toast.error(error.message || 'Failed to submit application.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Background />
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard')}
                    className="mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Dashboard
                </Button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <form
                        onSubmit={handleSubmit}
                        className="glass rounded-2xl p-8 md:p-12"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/50">
                            <Gavel className="w-10 h-10 text-white" />
                        </div>

                        <h1 className="text-4xl font-bold text-white text-center mb-4">
                            Become an Auctioneer
                        </h1>
                        <p className="text-white/60 text-lg text-center mb-8">
                            Tell us why you'd be a great auctioneer. Your application will be reviewed by an administrator.
                        </p>

                        <div className="space-y-6">
                            <Textarea
                                label="Why do you want to be an auctioneer?"
                                placeholder="Describe your experience with auctions, the types of items you specialize in, or why you're passionate about this..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={6}
                                required
                                minLength={50}
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full"
                                isLoading={isLoading}
                                disabled={isLoading}
                            >
                                Submit Application
                                <Send className="w-5 h-5" />
                            </Button>
                        </div>

                        <p className="text-white/40 text-sm text-center mt-6">
                            Applications are typically reviewed within 24-48 hours.
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default AuctioneerApplicationPage;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Gavel, CheckCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../components/ui/Toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Background from '../../components/layout/Background';

const ForgotPasswordPage = () => {
    const toast = useToast();
    const { forgotPassword, isLoading } = useAuthStore();

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    const validateForm = () => {
        if (!email) {
            setError('Email is required');
            return false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Email is invalid');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        const result = await forgotPassword(email);

        if (result.success) {
            setEmailSent(true);
            toast.success('Password reset email sent! Check your inbox.');
        } else {
            toast.error(result.error || 'Failed to send reset email.');
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Background />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md text-center"
                >
                    <div className="glass rounded-2xl p-8">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-4">Check Your Email</h1>
                        <p className="text-white/60 mb-6">
                            We've sent password reset instructions to <strong className="text-white">{email}</strong>
                        </p>
                        <Link to="/login">
                            <Button variant="primary" className="w-full">
                                Back to Login
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Background />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Gavel className="w-7 h-7" />
                    </div>
                    <span className="text-3xl font-bold gradient-text">AuctionVerse</span>
                </div>

                {/* Forgot Password Card */}
                <div className="glass rounded-2xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
                        <p className="text-white/60">Enter your email to reset your password</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            placeholder="your@email.com"
                            icon={Mail}
                            error={error}
                            disabled={isLoading}
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={isLoading}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
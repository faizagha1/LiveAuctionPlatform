import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

const useRefreshToken = () => {
    const refreshAccessToken = useAuthStore((state) => state.refreshAccessToken);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) return;

        // Refresh token every 14 minutes (access token expires in 15 min)
        const interval = setInterval(() => {
            refreshAccessToken();
        }, 14 * 60 * 1000);

        return () => clearInterval(interval);
    }, [isAuthenticated, refreshAccessToken]);
};

export default useRefreshToken;
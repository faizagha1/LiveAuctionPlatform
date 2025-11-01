import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../lib/api';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,

            register: async (credentials) => {
                set({ isLoading: true });
                try {
                    const response = await authAPI.register(credentials);
                    set({ isLoading: false });
                    return { success: true, message: response.message };
                } catch (error) {
                    set({ isLoading: false });
                    return { success: false, error: error.message };
                }
            },

            login: async (credentials) => {
                set({ isLoading: true });
                try {
                    const response = await authAPI.login(credentials);
                    const { accessToken, refreshToken } = response.data;

                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);

                    const profileResponse = await authAPI.getProfile();
                    const user = profileResponse.data;

                    set({
                        user,
                        accessToken,
                        refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    return { success: true };
                } catch (error) {
                    set({ isLoading: false });
                    return { success: false, error: error.message };
                }
            },

            verifyEmail: async (token) => {
                set({ isLoading: true });
                try {
                    const response = await authAPI.verifyEmail(token);
                    set({ isLoading: false });
                    return { success: true, message: response.message };
                } catch (error) {
                    set({ isLoading: false });
                    return { success: false, error: error.message };
                }
            },

            forgotPassword: async (email) => {
                set({ isLoading: true });
                try {
                    const response = await authAPI.forgotPassword(email);
                    set({ isLoading: false });
                    return { success: true, message: response.message };
                } catch (error) {
                    set({ isLoading: false });
                    return { success: false, error: error.message };
                }
            },

            resetPassword: async (token, newPassword) => {
                set({ isLoading: true });
                try {
                    const response = await authAPI.resetPassword(token, newPassword);
                    set({ isLoading: false });
                    return { success: true, message: response.message };
                } catch (error) {
                    set({ isLoading: false });
                    return { success: false, error: error.message };
                }
            },

            logout: () => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                });
            },

            refreshAccessToken: async () => {
                const { refreshToken } = get();
                if (!refreshToken) return false;

                try {
                    const response = await authAPI.refreshToken(refreshToken);
                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

                    localStorage.setItem('accessToken', newAccessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    set({
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken,
                    });

                    return true;
                } catch (error) {
                    get().logout();
                    return false;
                }
            },

            checkAuth: async () => {
                const token = localStorage.getItem('accessToken');
                if (!token) return;

                try {
                    const response = await authAPI.getProfile();
                    set({
                        user: response.data,
                        accessToken: token,
                        refreshToken: localStorage.getItem('refreshToken'),
                        isAuthenticated: true,
                    });
                } catch (error) {
                    get().logout();
                }
            },

            applyForAuctioneer: async (data) => {
                set({ isLoading: true });
                try {
                    const response = await authAPI.applyForAuctioneer(data);
                    set({ isLoading: false });
                    return { success: true, data: response.data };
                } catch (error) {
                    set({ isLoading: false });
                    return { success: false, error: error.message };
                }
            },

            hasRole: (roleName) => {
                const { user } = get();
                if (!user || !user.roles) return false;
                return user.roles.some(role => role === roleName || role === `ROLE_${roleName}`);
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;
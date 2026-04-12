/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const USER_FIELDS = [
    'id',
    'userId',
    'email',
    'username',
    'userName',
    'name',
    'firstName',
    'lastName',
    'surname',
];

const looksLikeUser = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    return USER_FIELDS.some((field) => value[field] != null && value[field] !== '');
};

const extractUserFromPayload = (payload) => {
    if (!payload || typeof payload !== 'object') return null;

    const candidates = [
        payload.user,
        payload.profile,
        payload.data?.user,
        payload.data?.profile,
        payload.result?.user,
        payload.result?.profile,
        payload.data,
        payload.result,
        payload,
    ];

    return candidates.find(looksLikeUser) ?? null;
};

export function AuthProvider({ children }) {
    // Artık token tutmuyoruz, sadece user ve loading durumlarımız var.
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async ({ keepExistingUserOnError = false } = {}) => {
        try {
            setLoading(true);
            // Doğrudan backend'e "ben kimim?" diye soruyoruz.
            // Tarayıcı bu isteğe sahip olduğu cookie'yi otomatik olarak ekler.
            const res = await api.getUserProfile();
            const resolvedUser = extractUserFromPayload(res);
            setUser(resolvedUser);
        } catch {
            // Eğer backend 401 (Unauthorized) vb. bir hata dönerse,
            // demek ki cookie yok veya süresi dolmuş.
            if (!keepExistingUserOnError) {
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const login = useCallback(async (email, password) => {
        // Login işlemi yapılıyor. Backend başarılı olursa browser'a 'Set-Cookie' ile cookie ekler.
        const result = await api.login(email, password);

        const userFromLogin = extractUserFromPayload(result);
        setUser(userFromLogin);

        // Cookie eklendiği için artık profilimizi çekebiliriz, state'i güncelliyoruz.
        await refreshUser({ keepExistingUserOnError: true });
        return result;
    }, [refreshUser]);

    const logout = useCallback(async () => {
        try {
            // Backend'deki endpoint cookie'yi geçersiz kılacak (clear-cookie) işlemi yapar.
            await api.logout();
        } finally {
            // Çıkış yapıldıktan sonra user'ı sıfırlıyoruz. (localStorage silmemize gerek kalmadı)
            setUser(null);
        }
    }, []);

    const value = useMemo(
        () => ({
            isLoggedIn: !!user,
            user,
            loading,
            login,
            logout,
            refreshUser,
        }),
        [user, loading, login, logout, refreshUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
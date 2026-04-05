import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // Artık token tutmuyoruz, sadece user ve loading durumlarımız var.
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            setLoading(true);
            // Doğrudan backend'e "ben kimim?" diye soruyoruz.
            // Tarayıcı bu isteğe sahip olduğu cookie'yi otomatik olarak ekler.
            const res = await api.getUserProfile();
            setUser(res?.data || res);
        } catch {
            // Eğer backend 401 (Unauthorized) vb. bir hata dönerse,
            // demek ki cookie yok veya süresi dolmuş.
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const login = async (email, password) => {
        // Login işlemi yapılıyor. Backend başarılı olursa browser'a 'Set-Cookie' ile cookie ekler.
        const result = await api.login(email, password);
        // Cookie eklendiği için artık profilimizi çekebiliriz, state'i güncelliyoruz.
        await refreshUser();
        return result;
    };

    const logout = async () => {
        try {
            // Backend'deki endpoint cookie'yi geçersiz kılacak (clear-cookie) işlemi yapar.
            await api.logout();
        } finally {
            // Çıkış yapıldıktan sonra user'ı sıfırlıyoruz. (localStorage silmemize gerek kalmadı)
            setUser(null);
        }
    };

    const value = useMemo(
        () => ({
            isLoggedIn: !!user, // Sadece 'user' objesi varsa giriş yapılmış sayılır.
            user,
            loading,
            login,
            logout,
            refreshUser,
        }),
        [user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
'use client';

import { fetchWithAuth } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from './provider/auth-provider';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const REDIRECT_URI = process.env.NEXT_PUBLIC_CLIENT_URL + '/auth/callback/google';
const SCOPE = 'email profile';

export default function Login() {
    const router = useRouter();
    const { isAuthenticated, logout } = useAuth();
    // 1. 로그인 요청: 구글 로그인 페이지로 리디렉션

    const handleGoogleLogin = () => {
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}&access_type=offline&prompt=consent`;
        router.push(googleAuthUrl);
    };

    console.log('isAuthenticated', isAuthenticated);

    const handleTokenVerify = async () => {
        const token = localStorage.getItem('accessToken');
        console.log('Token', token);

        const response = await fetchWithAuth('/api/auth/verify');

        console.log('Data', response);
    };

    return isAuthenticated ? (
        <div className="login-container">
            <button onClick={logout}>Logout</button>
            <button onClick={handleTokenVerify}>Token Verify</button>
        </div>
    ) : (
        <div className="login-container">
            <button onClick={handleGoogleLogin}>Google Login</button>
            <button onClick={handleTokenVerify}>Token Verify</button>
        </div>
    );
}

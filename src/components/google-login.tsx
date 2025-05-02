'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from './provider/auth-provider';
import { Button } from './ui/button';

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

    return isAuthenticated ? (
        <Button size={'sm'} onClick={logout}>
            Logout
        </Button>
    ) : (
        <Button size={'sm'} onClick={handleGoogleLogin}>
            Google Login
        </Button>
    );
}

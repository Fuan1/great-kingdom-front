'use client';

import { useAuth } from '@/components/provider/auth-provider';
// pages/auth/callback/google.tsx
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function GoogleCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const code = searchParams.get('code');

    useEffect(() => {
        if (code) {
            sendAuthCodeToBackend(code as string);
        }
    }, [code]);

    const sendAuthCodeToBackend = async (authCode: string) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/google/callback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: authCode }),
                credentials: 'include', // 쿠키 포함
            });

            console.log('response', response);

            if (response.ok) {
                const data = await response.json();
                // 6. 백엔드로부터 토큰 수신 및 저장

                login(data.accessToken);
                // 로그인 성공 후 홈페이지로 리디렉션
                router.push('/');
            } else {
                console.error('인증 실패');
                router.push('/login?error=authentication_failed');
            }
        } catch (error) {
            console.error('인증 과정에서 오류 발생:', error);
            router.push('/login?error=server_error');
        }
    };

    return <div>구글 인증 처리 중...</div>;
}

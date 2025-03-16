// app/oauth-callback/page.jsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function OAuthCallbackPage() {
    const router = useRouter();
    const { login } = useAuth();

    useEffect(() => {
        // Get token from URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            // Store the token
            localStorage.setItem('authToken', token);

            // Redirect to dashboard
            router.push('/dashboard');
        } else {
            // Handle error
            router.push('/login?error=authentication_failed');
        }
    }, [router]);

    return (
        <div className="flex justify-center items-center min-h-screen">
            <p>Processing authentication, please wait...</p>
        </div>
    );
}
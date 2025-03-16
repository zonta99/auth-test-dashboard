// app/oauth-callback/page.jsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function OAuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { fetchUserProfile } = useAuth();
    const [status, setStatus] = useState('Processing authentication...');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Use a ref to prevent processing the callback multiple times
    const processingRef = useRef(false);

    useEffect(() => {
        // Prevent processing the callback multiple times
        if (processingRef.current) return;
        processingRef.current = true;

        async function processCallback() {
            try {
                // Get token from URL
                const token = searchParams.get('token');
                const errorMsg = searchParams.get('error');

                // For debugging
                console.log('OAuth callback received', {
                    hasToken: !!token,
                    errorMessage: errorMsg,
                    urlParams: Array.from(searchParams.entries())
                });

                if (errorMsg) {
                    setStatus('Authentication failed');
                    setError(errorMsg);
                    return;
                }

                if (!token) {
                    setStatus('Authentication failed');
                    setError('No authentication token received. Check the server logs for issues with the OAuth provider callback.');
                    return;
                }

                // Store the token
                localStorage.setItem('authToken', token);
                setStatus('Token received, fetching user profile...');

                // Fetch user profile with the token
                const profileResult = await fetchUserProfile(token);

                if (profileResult && profileResult.success) {
                    setStatus('Authentication successful!');
                    setSuccess(true);

                    // Wait a moment to show success message before redirect
                    setTimeout(() => {
                        // Use window.location instead of router to force a full page load
                        window.location.href = '/dashboard';
                    }, 1500);
                } else {
                    setStatus('Failed to fetch user profile');
                    setError(profileResult?.message || 'Could not retrieve user information');
                    localStorage.removeItem('authToken');
                }
            } catch (error) {
                console.error('OAuth callback error:', error);
                setStatus('Authentication error');
                setError(error.message || 'An unexpected error occurred');
                localStorage.removeItem('authToken');
            }
        }

        processCallback();
    }, [fetchUserProfile, searchParams]); // Remove router from dependencies

    return (
        <div className="flex flex-col justify-center items-center min-h-screen p-4">
            <div className="bg-card rounded-lg shadow-md p-8 max-w-md w-full">
                <h1 className="text-2xl font-bold mb-4">Authentication</h1>

                <div className="mb-4 flex flex-col items-center text-center">
                    {!error && !success && (
                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    )}

                    {success && (
                        <CheckCircle className="h-8 w-8 text-green-500 mb-4" />
                    )}

                    {error && (
                        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
                    )}

                    <p className="text-lg">{status}</p>

                    {error && (
                        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mt-4 text-left w-full">
                            {error}
                        </div>
                    )}
                </div>

                {error && (
                    <button
                        onClick={() => {
                            // Use window.location for a full page navigation instead of router
                            window.location.href = '/login';
                        }}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md w-full hover:bg-primary/90"
                    >
                        Return to Login
                    </button>
                )}
            </div>
        </div>
    );
}
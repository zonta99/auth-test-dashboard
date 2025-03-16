// app/login/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            return setError('Email and password are required');
        }

        try {
            setError('');
            setLoading(true);

            const result = await login(email, password);

            if (result.success) {
                router.push('/dashboard');
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('Failed to log in');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = (provider) => {
        window.location.href = `http://localhost:8080/oauth2/authorize/${provider}`;
    };

    return (
        <div className="container mx-auto max-w-md py-10">
            <div className="bg-card rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold mb-6">Login</h1>

                {error && (
                    <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="w-full px-3 py-2 border border-input rounded-md"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="w-full px-3 py-2 border border-input rounded-md"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOAuthLogin('google')}
                        >
                            Google
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOAuthLogin('github')}
                        >
                            GitHub
                        </Button>
                    </div>
                </div>

                <p className="text-center mt-6 text-sm">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-primary hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}

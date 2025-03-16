// app/signup/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !email || !password) {
            return setError('All fields are required');
        }

        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        try {
            setError('');
            setLoading(true);

            const result = await signup(name, email, password);

            if (result.success) {
                alert('Signup successful! You can now login.');
                router.push('/login');
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('Failed to create an account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-md py-10">
            <div className="bg-card rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold mb-6">Sign Up</h1>

                {error && (
                    <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            className="w-full px-3 py-2 border border-input rounded-md"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

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
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>

                <p className="text-center mt-6 text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
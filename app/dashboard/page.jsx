// app/dashboard/page.jsx
'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
    const { currentUser, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!currentUser) {
        return <div className="text-center py-10">Loading...</div>;
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-primary/10 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
                    <p className="mb-4">Hello, {currentUser.name}! Welcome to the Auth Test Dashboard.</p>
                    <p className="text-sm text-muted-foreground">
                        You're logged in with {currentUser.provider || 'email and password'}.
                    </p>
                </div>

                <div className="bg-card rounded-lg p-6 border">
                    <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
                    <p className="mb-4">View and manage your profile information.</p>
                    <Button onClick={() => router.push('/profile')}>
                        Go to Profile
                    </Button>
                </div>

                {currentUser.roles?.includes('ROLE_ADMIN') && (
                    <div className="bg-card rounded-lg p-6 border">
                        <h2 className="text-xl font-semibold mb-2">Admin Panel</h2>
                        <p className="mb-4">Manage users and roles in the system.</p>
                        <Button variant="destructive" onClick={() => router.push('/admin')}>
                            Go to Admin Panel
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
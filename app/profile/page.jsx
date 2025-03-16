// app/profile/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { userService } from '@/lib/api';

export default function ProfilePage() {
    const { currentUser, token, isAuthenticated } = useAuth();
    const router = useRouter();

    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (currentUser) {
            setName(currentUser.name || '');
            setImageUrl(currentUser.imageUrl || '');
        }
    }, [currentUser, isAuthenticated, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name && !imageUrl) {
            return setError('At least one field must be provided');
        }

        try {
            setError('');
            setSuccess('');
            setLoading(true);

            const result = await userService.updateProfile(token, { name, imageUrl });

            if (result.success) {
                setSuccess('Profile updated successfully');
                // Reload page to refresh user data
                window.location.reload();
            } else {
                setError(result.data?.message || 'Failed to update profile');
            }
        } catch (error) {
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return <div className="text-center py-10">Loading...</div>;
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card rounded-lg p-6 border">
                    <h2 className="text-xl font-semibold mb-4">User Information</h2>

                    <div className="flex items-start space-x-4 mb-6">
                        {currentUser.imageUrl ? (
                            <img
                                src={currentUser.imageUrl}
                                alt={currentUser.name}
                                className="w-20 h-20 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold">
                  {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
                            </div>
                        )}

                        <div>
                            <h3 className="text-lg font-medium">{currentUser.name}</h3>
                            <p className="text-muted-foreground">{currentUser.email}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                  {currentUser.provider || 'LOCAL'}
                </span>
                                {currentUser.roles?.map(role => (
                                    <span
                                        key={role}
                                        className="bg-primary/10 text-primary px-2 py-1 rounded text-xs"
                                    >
                    {role.replace('ROLE_', '')}
                  </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Email Verified</p>
                            <p>{currentUser.emailVerified ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">User ID</p>
                            <p className="truncate" title={currentUser.id}>{currentUser.id}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-lg p-6 border">
                    <h2 className="text-xl font-semibold mb-4">Update Profile</h2>

                    {error && (
                        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md mb-4">
                            {success}
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
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
                                Profile Image URL
                            </label>
                            <input
                                id="imageUrl"
                                type="text"
                                className="w-full px-3 py-2 border border-input rounded-md"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://example.com/avatar.jpg"
                            />
                        </div>

                        <Button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Profile'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
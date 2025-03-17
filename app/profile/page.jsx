// app/profile/page.jsx
'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/lib/auth-context';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {authService, userService} from '@/lib/api';
import {AlertCircle, CheckCircle, ChevronRight, Link as LinkIcon} from 'lucide-react';

export default function ProfilePage() {
    const { currentUser, isAuthenticated } = useAuth();
    const router = useRouter();

    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [linkedAccounts, setLinkedAccounts] = useState([]);
    const [linkingProvider, setLinkingProvider] = useState(null);
    const [showLinkSuccess, setShowLinkSuccess] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (currentUser) {
            setName(currentUser.name || '');
            setImageUrl(currentUser.imageUrl || '');

            // Check URL for link success parameter
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('linkSuccess') === 'true') {
                setShowLinkSuccess(true);
                // Remove the query parameter from URL after a short delay
                setTimeout(() => {
                    window.history.replaceState({}, document.title, window.location.pathname);
                }, 3000);
            }

            // Fetch linked accounts
            fetchLinkedAccounts();
        }
    }, [currentUser, isAuthenticated, router]);

    const fetchLinkedAccounts = async () => {
        try {
            // This would typically come from your API
            // For now, we'll derive it from the currentUser object
            const userProvider = currentUser?.provider || 'LOCAL';

            // Simulate linked accounts
            const linkedProviders = [];

            if (userProvider !== 'LOCAL') {
                linkedProviders.push(userProvider);
            }

            setLinkedAccounts(linkedProviders);
        } catch (error) {
            console.error('Error fetching linked accounts:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name && !imageUrl) {
            return setError('At least one field must be provided');
        }

        try {
            setError('');
            setSuccess('');
            setLoading(true);

            const result = await userService.updateProfile({ name, imageUrl });

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

    const handleLinkAccount = async (provider) => {
        setLinkingProvider(provider);
        try {
            // Generate the OAuth URL for linking
            // Redirect to the OAuth provider
            window.location.href = authService.initiateOAuthLink(provider);
        } catch (error) {
            setError(`Failed to link ${provider} account: ${error.message}`);
            setLinkingProvider(null);
        }
    };

    const handleUnlinkAccount = async (provider) => {
        if (!confirm(`Are you sure you want to unlink your ${provider} account? You won't be able to log in using this method anymore.`)) {
            return;
        }

        try {
            setLoading(true);
            setError('');

            const result = await authService.unlinkAccount(provider);

            if (result.success) {
                setSuccess(`${provider} account successfully unlinked`);
                fetchLinkedAccounts();
            } else {
                setError(result.data?.message || `Failed to unlink ${provider} account`);
            }
        } catch (error) {
            setError(`Error unlinking account: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const isProviderLinked = (provider) => {
        return linkedAccounts.includes(provider);
    };

    if (!currentUser) {
        return <div className="text-center py-10">Loading...</div>;
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Profile</h1>

            {showLinkSuccess && (
                <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md mb-6 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Account successfully linked! You can now sign in using either method.
                </div>
            )}

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
                        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4 flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                            <div>{error}</div>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md mb-4 flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2" />
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

            {/* Account Linking Section */}
            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LinkIcon className="h-5 w-5" />
                            Connected Accounts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-muted-foreground">
                            Link your account with other services to enable easier login.
                            You can use any of your linked accounts to sign in.
                        </p>

                        {showLinkSuccess && (
                            <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md mb-4 flex items-center">
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Account successfully linked! You can now sign in using either method.
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Google Account */}
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src="/google-icon.png" alt="Google" />
                                        <AvatarFallback>G</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-medium">Google</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {isProviderLinked('GOOGLE')
                                                ? 'Connected with your Google account'
                                                : 'Sign in with your Google account'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    {isProviderLinked('GOOGLE') ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleUnlinkAccount('google')}
                                            disabled={currentUser.provider === 'GOOGLE' || loading}
                                        >
                                            {currentUser.provider === 'GOOGLE'
                                                ? 'Primary Account'
                                                : 'Disconnect'}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleLinkAccount('google')}
                                            disabled={linkingProvider === 'google' || loading}
                                        >
                                            {linkingProvider === 'google'
                                                ? 'Connecting...'
                                                : 'Connect'}
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* GitHub Account */}
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src="/github-icon.png" alt="GitHub" />
                                        <AvatarFallback>GH</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-medium">GitHub</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {isProviderLinked('GITHUB')
                                                ? 'Connected with your GitHub account'
                                                : 'Sign in with your GitHub account'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    {isProviderLinked('GITHUB') ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleUnlinkAccount('github')}
                                            disabled={currentUser.provider === 'GITHUB' || loading}
                                        >
                                            {currentUser.provider === 'GITHUB'
                                                ? 'Primary Account'
                                                : 'Disconnect'}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleLinkAccount('github')}
                                            disabled={linkingProvider === 'github' || loading}
                                        >
                                            {linkingProvider === 'github'
                                                ? 'Connecting...'
                                                : 'Connect'}
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Local Account */}
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src="/email-icon.png" alt="Email" />
                                        <AvatarFallback>E</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-medium">Email & Password</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {currentUser.provider === 'LOCAL' || !currentUser.provider
                                                ? 'Your primary login method'
                                                : 'Set a password for email login'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    {currentUser.provider === 'LOCAL' || !currentUser.provider ? (
                                        <Badge variant="outline">Primary Account</Badge>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push('/set-password')}
                                        >
                                            Set Password
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 text-sm text-muted-foreground">
                            <p>
                                <strong>Note:</strong> Your primary login method cannot be disconnected.
                                If you want to use a different primary method, please contact support.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
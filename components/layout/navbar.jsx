// components/layout/navbar.jsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export function Navbar() {
    const { currentUser, logout, isAuthenticated, isAdmin } = useAuth();

    return (
        <header className="bg-background border-b">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-xl font-bold">
                        Auth Test Dashboard
                    </Link>

                    <nav className="hidden md:flex gap-6">
                        {isAuthenticated ? (
                            <>
                                <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                                    Dashboard
                                </Link>
                                <Link href="/profile" className="text-sm font-medium transition-colors hover:text-primary">
                                    Profile
                                </Link>
                                {isAdmin && (
                                    <Link href="/admin" className="text-sm font-medium transition-colors hover:text-primary">
                                        Admin Panel
                                    </Link>
                                )}
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-medium transition-colors hover:text-primary">
                                    Login
                                </Link>
                                <Link href="/signup" className="text-sm font-medium transition-colors hover:text-primary">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </nav>
                </div>

                {isAuthenticated && (
                    <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              Hello, {currentUser?.name}
            </span>
                        <Button variant="outline" size="sm" onClick={logout}>
                            Logout
                        </Button>
                    </div>
                )}
            </div>
        </header>
    );
}
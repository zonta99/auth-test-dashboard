// app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Auth Test Dashboard',
    description: 'Test dashboard for Spring Boot OAuth2 authentication service',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <AuthProvider>
            <Navbar />
            <main className="min-h-screen p-4">
                {children}
            </main>
        </AuthProvider>
        </body>
        </html>
    );
}
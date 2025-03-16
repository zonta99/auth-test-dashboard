'use client'
import React, { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Trash2, UserCog, Users } from 'lucide-react';
import {TableHead, TableHeader, TableRow} from "@/components/ui/table";

// Mock API service (replace with your actual API calls)
const adminService = {
    getAllUsers: async (token) => {
        try {
            const response = await fetch('http://localhost:8080/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    updateUserRoles: async (token, userId, roles) => {
        try {
            const response = await fetch(`http://localhost:8080/admin/users/${userId}/roles`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(roles)
            });

            if (!response.ok) {
                throw new Error('Failed to update user roles');
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    deleteUser: async (token, userId) => {
        try {
            const response = await fetch(`http://localhost:8080/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// Mock auth context (replace with your actual auth context)
const useAuth = () => {
    return {
        token: localStorage.getItem('authToken'),
        isAdmin: true,
        currentUser: { name: 'Admin User', roles: ['ROLE_ADMIN'] }
    };
};

export default function AdminDashboard() {
    const { token, isAdmin } = useAuth();

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState(null);

    const [selectedUser, setSelectedUser] = useState(null);
    const [userRoles, setUserRoles] = useState({
        ROLE_USER: true,
        ROLE_ADMIN: false
    });

    // Stats
    const [stats, setStats] = useState({
        totalUsers: 0,
        admins: 0,
        googleUsers: 0,
        githubUsers: 0,
        localUsers: 0
    });

    useEffect(() => {
        if (!isAdmin) return;
        fetchUsers();
    }, [isAdmin, token]);

    useEffect(() => {
        if (users.length > 0) {
            const filtered = users.filter(user =>
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.id?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchTerm, users]);

    const calculateStats = (users) => {
        const stats = {
            totalUsers: users.length,
            admins: users.filter(user => user.roles?.includes('ROLE_ADMIN')).length,
            googleUsers: users.filter(user => user.provider === 'GOOGLE').length,
            githubUsers: users.filter(user => user.provider === 'GITHUB').length,
            localUsers: users.filter(user => user.provider === 'LOCAL' || !user.provider).length
        };
        setStats(stats);
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');

            const result = await adminService.getAllUsers(token);

            if (result.success) {
                setUsers(result.data);
                setFilteredUsers(result.data);
                calculateStats(result.data);
            } else {
                setError('Failed to fetch users');
            }
        } catch (error) {
            setError('Error loading users');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);

        // Reset roles checkboxes
        setUserRoles({
            ROLE_USER: user.roles?.includes('ROLE_USER'),
            ROLE_ADMIN: user.roles?.includes('ROLE_ADMIN')
        });
    };

    const handleRoleChange = (role) => {
        setUserRoles({
            ...userRoles,
            [role]: !userRoles[role]
        });
    };

    const handleUpdateRoles = async () => {
        if (!selectedUser) return;

        // Get selected roles
        const selectedRoles = Object.keys(userRoles).filter(role => userRoles[role]);

        if (selectedRoles.length === 0) {
            showNotification('error', 'User must have at least one role');
            return;
        }

        try {
            const result = await adminService.updateUserRoles(token, selectedUser.id, selectedRoles);

            if (result.success) {
                showNotification('success', 'User roles updated successfully');
                fetchUsers();
            } else {
                showNotification('error', result.error || 'Failed to update user roles');
            }
        } catch (error) {
            showNotification('error', 'Error updating user roles');
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        if (!window.confirm(`Are you sure you want to delete ${selectedUser.name}?`)) {
            return;
        }

        try {
            const result = await adminService.deleteUser(token, selectedUser.id);

            if (result.success) {
                showNotification('success', 'User deleted successfully');
                setSelectedUser(null);
                fetchUsers();
            } else {
                showNotification('error', result.error || 'Failed to delete user');
            }
        } catch (error) {
            showNotification('error', 'Error deleting user');
        }
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    };

    if (!isAdmin) {
        return (
            <div className="container mx-auto p-4">
                <Card className="border-destructive">
                    <CardHeader className="bg-destructive/10">
                        <CardTitle className="text-destructive flex items-center gap-2">
                            <AlertCircle size={18} />
                            Access Denied
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p>You do not have permission to access the admin panel.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage users and permissions</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={fetchUsers}
                        className="flex items-center gap-2"
                        disabled={loading}
                    >
                        <Users size={16} />
                        {loading ? 'Loading...' : 'Refresh Users'}
                    </Button>
                </div>
            </div>

            {error && (
                <Card className="mb-6 border-destructive">
                    <CardContent className="p-4 flex items-center gap-2 text-destructive">
                        <AlertCircle size={18} />
                        {error}
                    </CardContent>
                </Card>
            )}

            {notification && (
                <Card className={`mb-6 ${notification.type === 'error' ? 'border-destructive' : 'border-green-500'}`}>
                    <CardContent className={`p-4 flex items-center gap-2 ${notification.type === 'error' ? 'text-destructive' : 'text-green-600'}`}>
                        {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                        {notification.message}
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.totalUsers}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Admins</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.admins}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">OAuth Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Google</p>
                                <p className="text-2xl font-bold">{stats.googleUsers}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">GitHub</p>
                                <p className="text-2xl font-bold">{stats.githubUsers}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Local Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.localUsers}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>
                                View and manage all users in the system
                            </CardDescription>
                            <div className="mt-2">
                                <Input
                                    placeholder="Search by name, email, or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[500px] overflow-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-muted">
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Provider</TableHead>
                                            <TableHead>Roles</TableHead>
                                            <TableHead className="w-[100px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8">
                                                    Loading users...
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8">
                                                    No users found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <TableRow
                                                    key={user.id}
                                                    className={selectedUser?.id === user.id ? 'bg-muted/50' : ''}
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="w-8 h-8">
                                                                <AvatarImage src={user.imageUrl} />
                                                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="font-medium">{user.name}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {user.provider || 'LOCAL'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {user.roles?.map(role => (
                                                                <Badge
                                                                    key={role}
                                                                    variant={role === 'ROLE_ADMIN' ? 'default' : 'secondary'}
                                                                    className="text-xs"
                                                                >
                                                                    {role.replace('ROLE_', '')}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleSelectUser(user)}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <UserCog size={16} />
                                                            Edit
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 flex justify-between text-sm text-muted-foreground border-t">
                            <span>Showing {filteredUsers.length} of {users.length} users</span>
                        </CardFooter>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>User Details</CardTitle>
                            <CardDescription>
                                {selectedUser ? 'Edit user details and permissions' : 'Select a user to manage'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {selectedUser ? (
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center gap-4">
                                        <Avatar className="w-20 h-20">
                                            <AvatarImage src={selectedUser.imageUrl} />
                                            <AvatarFallback className="text-2xl">{getInitials(selectedUser.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="text-center">
                                            <h3 className="text-xl font-medium">{selectedUser.name}</h3>
                                            <p className="text-muted-foreground">{selectedUser.email}</p>
                                        </div>
                                    </div>

                                    <Tabs defaultValue="roles">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="roles">Roles</TabsTrigger>
                                            <TabsTrigger value="details">Details</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="roles" className="space-y-4 pt-4">
                                            <div>
                                                <div className="font-medium mb-2">User Permissions</div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="role-user"
                                                            checked={userRoles.ROLE_USER}
                                                            onCheckedChange={() => handleRoleChange('ROLE_USER')}
                                                        />
                                                        <Label htmlFor="role-user">User (Basic permissions)</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="role-admin"
                                                            checked={userRoles.ROLE_ADMIN}
                                                            onCheckedChange={() => handleRoleChange('ROLE_ADMIN')}
                                                        />
                                                        <Label htmlFor="role-admin">Admin (Full system access)</Label>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button onClick={handleUpdateRoles} className="w-full">
                                                Update Roles
                                            </Button>
                                        </TabsContent>

                                        <TabsContent value="details" className="space-y-4 pt-4">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <div className="text-sm font-medium">User ID</div>
                                                    <div className="text-sm truncate" title={selectedUser.id}>
                                                        {selectedUser.id}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium">Provider</div>
                                                    <div className="text-sm">
                                                        {selectedUser.provider || 'LOCAL'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium">Email Verified</div>
                                                    <div className="text-sm">
                                                        {selectedUser.emailVerified ? 'Yes' : 'No'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium">Created</div>
                                                    <div className="text-sm">
                                                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Unknown'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <Button
                                                    variant="destructive"
                                                    className="w-full flex items-center justify-center gap-2"
                                                    onClick={handleDeleteUser}
                                                >
                                                    <Trash2 size={16} />
                                                    Delete User
                                                </Button>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                    <UserCog size={48} className="mx-auto mb-4 text-muted-foreground/50" />
                                    <p>Select a user from the list to view and manage their details</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
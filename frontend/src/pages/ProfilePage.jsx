import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useTheme } from '../context/ThemeContext';

function ProfilePage({ userEmail, onNotification, onProfileUpdate }) {
    const { isDark } = useTheme();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        loadUserProfile();
    }, [userEmail]);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const normalizedEmail = userEmail.toLowerCase().trim();
            const response = await fetch(`${API_URL}/users?email=${encodeURIComponent(normalizedEmail)}`);
            const users = await response.json();

            if (users.length > 0) {
                const userData = users[0];
                setUser(userData);
                setFormData({ name: userData.name, email: userData.email, password: '' });
            }
        } catch (err) {
            onNotification('Error loading profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            onNotification('Name cannot be empty.');
            return;
        }

        if (!formData.email.trim() || !formData.email.includes('@')) {
            onNotification('Please enter a valid email.');
            return;
        }

        if (formData.password && formData.password !== confirmPassword) {
            onNotification('Passwords do not match.');
            return;
        }

        try {
            const updateData = {
                name: formData.name.trim(),
                email: formData.email.toLowerCase().trim()
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            await fetch(`${API_URL}/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            const updatedUser = { ...user, ...updateData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setEditing(false);
            setFormData({ ...formData, password: '' });
            setConfirmPassword('');
            onNotification('Profile updated successfully!');
            onProfileUpdate(updatedUser);
        } catch (err) {
            onNotification('Error updating profile.');
        }
    };

    if (loading) {
        return (
            <div className={`text-center py-20 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className="inline-block animate-spin text-6xl mb-4">⚙️</div>
                <p className="text-xl text-gray-400">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className={`max-w-2xl mx-auto ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    ⚙️ My Profile
                </h1>
                <p className="text-gray-400">Manage your account settings</p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                {/* Profile Avatar */}
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-5xl shadow-xl">
                        👤
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <p className="text-gray-400">{user.email}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Name</label>
                        {editing ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Your name"
                            />
                        ) : (
                            <p className="text-xl font-medium">{user.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                        {editing ? (
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="your.email@example.com"
                            />
                        ) : (
                            <p className="text-xl font-medium">{user.email}</p>
                        )}
                    </div>

                    {editing && (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    New Password (leave blank to keep current)
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter new password"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-8 flex gap-4">
                    {editing ? (
                        <>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl font-semibold shadow-lg transition-all"
                            >
                                💾 Save Changes
                            </button>
                            <button
                                onClick={() => {
                                    setEditing(false);
                                    setFormData({ name: user.name, email: user.email, password: '' });
                                    setConfirmPassword('');
                                }}
                                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold shadow-lg transition-all"
                        >
                            ✏️ Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;

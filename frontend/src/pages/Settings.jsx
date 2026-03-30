import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, User, Shield, Bell, Database } from 'lucide-react';

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'security', name: 'Security', icon: Shield },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'system', name: 'System Settings', icon: Database, isAdmin: true },
    ];

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-sm text-slate-500 mt-1">Manage your account and system preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Tabs Sidebar */}
                <div className="w-full lg:w-64 space-y-1">
                    {tabs
                        .filter(tab => !tab.isAdmin || user?.role === 'admin')
                        .map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200/50'
                                            : 'text-slate-600 hover:bg-white hover:text-blue-600'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.name}
                                </button>
                            );
                        })}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    {activeTab === 'profile' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Full Name</label>
                                    <input type="text" className="input-field" defaultValue={user?.name} />
                                </div>
                                <div>
                                    <label className="label">Email Address</label>
                                    <input type="email" className="input-field" defaultValue={user?.email} disabled />
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-400">Email cannot be changed. Contact admin for support.</p>
                                </div>
                            </div>
                            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                                Save Changes
                            </button>
                        </div>
                    )}
                    
                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-lg font-semibold text-slate-900">Password & Security</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="label">Current Password</label>
                                    <input type="password" placeholder="••••••••" className="input-field" />
                                </div>
                                <div>
                                    <label className="label">New Password</label>
                                    <input type="password" placeholder="••••••••" className="input-field" />
                                </div>
                            </div>
                            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                                Update Password
                            </button>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="p-12 text-center text-slate-400">
                             Notification settings coming soon...
                        </div>
                    )}

                    {activeTab === 'system' && user?.role === 'admin' && (
                        <div className="p-12 text-center text-slate-400">
                             Global system configurations coming soon...
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                .label { display: block; font-size: 0.75rem; font-weight: 500; color: #64748b; margin-bottom: 0.25rem; }
                .input-field { width: 100%; padding: 0.5rem 0.75rem; border: 1.5px solid #f1f5f9; border-radius: 0.75rem; font-size: 0.875rem; outline: none; transition: border-color 0.2s; background: #f8fafc; }
                .input-field:focus { border-color: #3b82f6; background: #fff; }
                .input-field:disabled { cursor: not-allowed; opacity: 0.6; }
            `}</style>
        </div>
    );
};

export default Settings;

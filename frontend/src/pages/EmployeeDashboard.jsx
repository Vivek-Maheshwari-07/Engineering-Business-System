import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Package, Clock } from 'lucide-react';

const EmployeeDashboard = () => {
    const { user } = useAuth();

    const tasks = [
        { id: 1, title: 'Check inventory for Project Alpha', status: 'Pending', time: '10:00 AM' },
        { id: 2, title: 'Update shipping logs', status: 'In Progress', time: '11:30 AM' },
        { id: 3, title: 'Review incoming parts delivery', status: 'Completed', time: '02:00 PM' },
    ];

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-slate-200">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Employee Workspace</h1>
                <p className="text-sm text-slate-500 mt-1">Hello {user?.name}, here is your daily overview.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg"><CheckSquare className="h-5 w-5 text-blue-600" /></div>
                        <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">12</p>
                    <p className="text-sm text-slate-500 mt-1">Assigned for today</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 rounded-lg"><Package className="h-5 w-5 text-purple-600" /></div>
                        <h2 className="text-lg font-semibold text-slate-900">Stock Alerts</h2>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">3</p>
                    <p className="text-sm text-slate-500 mt-1">Items need attention</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 rounded-lg"><Clock className="h-5 w-5 text-green-600" /></div>
                        <h2 className="text-lg font-semibold text-slate-900">Hours Logged</h2>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">32h</p>
                    <p className="text-sm text-slate-500 mt-1">This week</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-6">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-base font-semibold text-slate-900">Today's Assignments</h3>
                </div>
                <ul className="divide-y divide-slate-100">
                    {tasks.map((task) => (
                        <li key={task.id} className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{task.title}</p>
                                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {task.time}
                                    </p>
                                </div>
                                <div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                                        'bg-slate-100 text-slate-800'}
                                    `}>
                                        {task.status}
                                    </span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default EmployeeDashboard;

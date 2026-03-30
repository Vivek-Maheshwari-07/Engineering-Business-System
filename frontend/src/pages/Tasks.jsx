import React, { useState } from 'react';
import { FileText, CheckCircle2, Clock, AlertCircle, Search } from 'lucide-react';

const Tasks = () => {
    // Placeholder for now as we don't have a task model yet
    const [tasks] = useState([
        { id: 1, title: 'Verify Pipe Inventory', description: 'Count all 12mm steel pipes in warehouse A', status: 'pending', priority: 'high', due_date: '2026-03-30' },
        { id: 2, title: 'Generate Monthly Report', description: 'Summary of all inventory logs for March', status: 'in-progress', priority: 'medium', due_date: '2026-04-05' },
    ]);

    const statusStyle = {
        'pending': 'bg-amber-100 text-amber-700',
        'in-progress': 'bg-blue-100 text-blue-700',
        'completed': 'bg-green-100 text-green-700',
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900">Assigned Tasks</h1>
                <p className="text-sm text-slate-500 mt-1">Manage and track your daily engineering tasks.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {tasks.map(task => (
                    <div key={task.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle[task.status]}`}>
                                    {task.status}
                                </span>
                            </div>
                            <p className="text-slate-600 mt-2">{task.description}</p>
                            <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Due {task.due_date}</span>
                                <span className={`font-medium ${task.priority === 'high' ? 'text-red-500' : 'text-amber-500'}`}>
                                    {task.priority.toUpperCase()} PRIORITY
                                </span>
                            </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                            Update Status
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tasks;

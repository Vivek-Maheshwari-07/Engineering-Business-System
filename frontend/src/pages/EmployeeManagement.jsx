import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Plus, Pencil, Trash2, X, Search, ChevronDown } from 'lucide-react';

const DEPARTMENTS = ['Engineering', 'Sales', 'Accounts', 'HR', 'Operations', 'IT'];
const DESIGNATIONS = ['Engineer', 'Senior Engineer', 'Manager', 'Technician', 'Accountant', 'HR Executive'];

const emptyForm = { name: '', email: '', phone: '', department: '', designation: '', salary: '', join_date: '', status: 'active' };

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editEmployee, setEditEmployee] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employees');
            setEmployees(res.data);
        } catch {
            setError('Failed to load employees.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const openAdd = () => { setEditEmployee(null); setForm(emptyForm); setError(''); setShowModal(true); };
    const openEdit = (emp) => { setEditEmployee(emp); setForm({ ...emp, join_date: emp.join_date?.split('T')[0] || '' }); setError(''); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditEmployee(null); setForm(emptyForm); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            if (editEmployee) {
                await api.put(`/employees/${editEmployee.id}`, form);
            } else {
                await api.post('/employees', form);
            }
            await fetchEmployees();
            closeModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete employee "${name}"?`)) return;
        await api.delete(`/employees/${id}`);
        setEmployees(prev => prev.filter(e => e.id !== id));
    };

    const filtered = employees.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        (e.department || '').toLowerCase().includes(search.toLowerCase())
    );

    const statusColor = (s) => s === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Employee Management</h1>
                    <p className="text-sm text-slate-500 mt-1">{employees.length} total employees</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
                    <Plus className="h-4 w-4" /> Add Employee
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search employees..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-400">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">No employees found</p>
                        <p className="text-slate-400 text-sm mt-1">Click "Add Employee" to get started</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {['Name', 'Department', 'Designation', 'Phone', 'Salary', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(emp => (
                                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm uppercase shrink-0">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{emp.name}</p>
                                                    <p className="text-xs text-slate-400">{emp.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{emp.department || '—'}</td>
                                        <td className="px-6 py-4 text-slate-600">{emp.designation || '—'}</td>
                                        <td className="px-6 py-4 text-slate-600">{emp.phone || '—'}</td>
                                        <td className="px-6 py-4 text-slate-700 font-medium">₹{Number(emp.salary).toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColor(emp.status)}`}>{emp.status}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => openEdit(emp)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(emp.id, emp.name)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">{editEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{error}</div>}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                                    <input required className="input-field" placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                    <input required type="email" className="input-field" placeholder="john@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                    <input className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Salary (₹)</label>
                                    <input type="number" className="input-field" placeholder="50000" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                    <select className="input-field" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                                        <option value="">Select...</option>
                                        {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                                    <select className="input-field" value={form.designation} onChange={e => setForm({...form, designation: e.target.value})}>
                                        <option value="">Select...</option>
                                        {DESIGNATIONS.map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Join Date</label>
                                    <input type="date" className="input-field" value={form.join_date} onChange={e => setForm({...form, join_date: e.target.value})} />
                                </div>
                                {editEmployee && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                        <select className="input-field" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="flex-1 py-2.5 px-4 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
                                    {submitting ? 'Saving...' : editEmployee ? 'Update' : 'Add Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <style>{`.input-field { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 0.875rem; color: #1e293b; background: #f8fafc; outline: none; transition: box-shadow 0.15s; } .input-field:focus { box-shadow: 0 0 0 2px #3b82f6; border-color: #3b82f6; }`}</style>
        </div>
    );
};

export default EmployeeManagement;

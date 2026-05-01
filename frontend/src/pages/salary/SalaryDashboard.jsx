import { useState, useEffect } from 'react';
import { getEmployees, upsertProfile, generateSalary, getAllSalaryRecords } from '../../services/salaryService';
import { Loader2, Users, IndianRupee, PlusCircle, RefreshCw, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const s = {
    card: { backgroundColor:'#fff', borderRadius:'12px', border:'1px solid #e5e7eb', boxShadow:'0 1px 3px rgba(0,0,0,0.06)', overflow:'hidden', marginBottom:'1.5rem' },
    th: { padding:'0.75rem 1rem', backgroundColor:'#f9fafb', borderBottom:'1px solid #e5e7eb', fontSize:'0.72rem', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.05em', textAlign:'left' },
    td: { padding:'0.875rem 1rem', borderBottom:'1px solid #f3f4f6', fontSize:'0.875rem', color:'#374151', verticalAlign:'middle' },
    input: { width:'100%', padding:'0.6rem 0.75rem', border:'1px solid #d1d5db', borderRadius:'8px', fontSize:'0.875rem', color:'#111827', boxSizing:'border-box' },
    btnGreen: { padding:'0.65rem 1.25rem', backgroundColor:'#16a34a', color:'#fff', border:'none', borderRadius:'8px', fontWeight:'700', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'0.4rem', fontSize:'0.875rem' },
    label: { display:'block', marginBottom:'0.3rem', fontSize:'0.72rem', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.06em' },
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmt = (n) => Number(n||0).toLocaleString('en-IN', { minimumFractionDigits:2 });

const SalaryDashboard = () => {
    const [employees, setEmployees]   = useState([]);
    const [records, setRecords]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [tab, setTab]               = useState('records'); // 'records' | 'setup' | 'generate'

    // Profile form
    const [pfUserId, setPfUserId]         = useState('');
    const [pfBaseSalary, setPfBaseSalary] = useState('');
    const [pfJoinDate, setPfJoinDate]     = useState('');
    const [pfSaving, setPfSaving]         = useState(false);

    // Generate form
    const [genUserId, setGenUserId]       = useState('');
    const [genMonth, setGenMonth]         = useState(new Date().getMonth()+1);
    const [genYear, setGenYear]           = useState(new Date().getFullYear());
    const [genDeductions, setGenDeductions] = useState('');
    const [genNotes, setGenNotes]         = useState('');
    const [genSaving, setGenSaving]       = useState(false);

    const loadAll = async () => {
        try {
            setLoading(true);
            const [eRes, rRes] = await Promise.all([getEmployees(), getAllSalaryRecords()]);
            setEmployees(eRes.data.data || []);
            setRecords(rRes.data.data || []);
        } catch { toast.error('Failed to load salary data.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadAll(); }, []);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!pfUserId || !pfBaseSalary) { toast.error('Select employee and enter base salary.'); return; }
        setPfSaving(true);
        try {
            await upsertProfile({ user_id:Number(pfUserId), base_salary:parseFloat(pfBaseSalary), join_date:pfJoinDate||null });
            toast.success('Profile saved!');
            setPfUserId(''); setPfBaseSalary(''); setPfJoinDate('');
            loadAll();
        } catch (err) { toast.error(err?.response?.data?.message||'Failed to save profile.'); }
        finally { setPfSaving(false); }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!genUserId) { toast.error('Select an employee.'); return; }
        setGenSaving(true);
        try {
            const res = await generateSalary({ user_id:Number(genUserId), month:Number(genMonth), year:Number(genYear), deductions:parseFloat(genDeductions)||0, notes:genNotes });
            toast.success(res.data.message);
            setGenDeductions(''); setGenNotes('');
            setTab('records'); loadAll();
        } catch (err) { toast.error(err?.response?.data?.message||'Failed to generate salary.'); }
        finally { setGenSaving(false); }
    };

    if (loading) return (
        <div style={{display:'flex',height:'300px',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'0.75rem',color:'#16a34a'}}>
            <Loader2 size={40} style={{animation:'spin 1.2s linear infinite'}}/>
            <p style={{color:'#6b7280',margin:0}}>Loading payroll data…</p>
            <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
        </div>
    );

    const TAB_BTN = (key, label) => (
        <button onClick={()=>setTab(key)} style={{padding:'0.6rem 1.25rem',border:'1px solid',borderRadius:'8px',fontWeight:'600',cursor:'pointer',fontSize:'0.875rem',
            backgroundColor: tab===key?'#16a34a':'#fff',
            color: tab===key?'#fff':'#374151',
            borderColor: tab===key?'#16a34a':'#d1d5db'}}>
            {label}
        </button>
    );

    return (
        <div style={{maxWidth:'1000px',margin:'0 auto'}}>
            <div style={{marginBottom:'2rem'}}>
                <h1 style={{margin:'0 0 0.35rem 0',fontSize:'1.875rem',fontWeight:'800',color:'#111827'}}>Salary Management</h1>
                <p style={{margin:0,color:'#6b7280',fontSize:'0.9rem'}}>Manage employee profiles, generate monthly payroll, and view salary history.</p>
            </div>

            {/* Tabs */}
            <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.5rem'}}>
                {TAB_BTN('records','📋 Salary Records')}
                {TAB_BTN('setup','👤 Employee Profiles')}
                {TAB_BTN('generate','💰 Generate Salary')}
            </div>

            {/* ── TAB: Records ── */}
            {tab==='records'&&(
                <div style={s.card}>
                    <div style={{padding:'1rem 1.5rem',backgroundColor:'#f9fafb',borderBottom:'1px solid #e5e7eb',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <h3 style={{margin:0,fontWeight:'700',color:'#1f2937',display:'flex',alignItems:'center',gap:'0.5rem'}}><IndianRupee size={16} color="#16a34a"/>Payroll Records</h3>
                        <button onClick={loadAll} style={{...s.btnGreen,padding:'0.5rem 0.875rem',backgroundColor:'#f3f4f6',color:'#374151',border:'1px solid #e5e7eb'}}>
                            <RefreshCw size={13}/>Refresh
                        </button>
                    </div>
                    <div style={{overflowX:'auto'}}>
                        <table style={{width:'100%',borderCollapse:'collapse'}}>
                            <thead>
                                <tr>
                                    {['Employee','Month / Year','Base Salary','Deductions','Net Salary','Generated'].map(h=>(
                                        <th key={h} style={s.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {records.length===0?(
                                    <tr><td colSpan="6" style={{...s.td,textAlign:'center',color:'#9ca3af',padding:'2.5rem'}}>No salary records yet. Generate one from the "Generate Salary" tab.</td></tr>
                                ):records.map(r=>(
                                    <tr key={r.record_id} onMouseOver={e=>e.currentTarget.style.backgroundColor='#fafafa'} onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}>
                                        <td style={s.td}>
                                            <div style={{fontWeight:'600',color:'#111827'}}>{r.employee_name}</div>
                                            <div style={{fontSize:'0.75rem',color:'#9ca3af'}}>{r.employee_email}</div>
                                        </td>
                                        <td style={s.td}>{MONTHS[r.month-1]} {r.year}</td>
                                        <td style={s.td}>₹{fmt(r.base_salary)}</td>
                                        <td style={{...s.td,color:r.deductions>0?'#dc2626':'#6b7280'}}>₹{fmt(r.deductions)}</td>
                                        <td style={{...s.td,fontWeight:'800',color:'#166534'}}>₹{fmt(r.net_salary)}</td>
                                        <td style={{...s.td,color:'#9ca3af',fontSize:'0.78rem'}}>{new Date(r.generated_at).toLocaleDateString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── TAB: Setup Profiles ── */}
            {tab==='setup'&&(
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',alignItems:'start'}}>
                    {/* Form */}
                    <div style={s.card}>
                        <div style={{padding:'1rem 1.5rem',backgroundColor:'#f9fafb',borderBottom:'1px solid #e5e7eb'}}>
                            <h3 style={{margin:0,fontWeight:'700',color:'#1f2937',fontSize:'0.95rem'}}>Set / Update Base Salary</h3>
                        </div>
                        <form onSubmit={handleSaveProfile} style={{padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
                            <div>
                                <label style={s.label}>Employee</label>
                                <div style={{position:'relative'}}>
                                    <select value={pfUserId} onChange={e=>setPfUserId(e.target.value)} style={{...s.input,appearance:'none',paddingRight:'2rem'}} required>
                                        <option value="">Select employee…</option>
                                        {employees.map(e=>(
                                            <option key={e.id} value={e.id}>{e.name} — {e.email}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={13} style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',color:'#9ca3af',pointerEvents:'none'}}/>
                                </div>
                            </div>
                            <div>
                                <label style={s.label}>Base Monthly Salary (₹)</label>
                                <input type="number" min="1" step="0.01" placeholder="e.g. 25000"
                                    value={pfBaseSalary} onChange={e=>setPfBaseSalary(e.target.value)}
                                    style={s.input} required/>
                            </div>
                            <div>
                                <label style={s.label}>Join Date (optional)</label>
                                <input type="date" value={pfJoinDate} onChange={e=>setPfJoinDate(e.target.value)} style={s.input}/>
                            </div>
                            <button type="submit" disabled={pfSaving} style={{...s.btnGreen,width:'100%',justifyContent:'center',opacity:pfSaving?0.6:1}}>
                                {pfSaving?<Loader2 size={15} style={{animation:'spin 1s linear infinite'}}/>:<PlusCircle size={15}/>}
                                {pfSaving?'Saving…':'Save Profile'}
                            </button>
                        </form>
                    </div>
                    {/* Current profiles table */}
                    <div style={s.card}>
                        <div style={{padding:'1rem 1.5rem',backgroundColor:'#f9fafb',borderBottom:'1px solid #e5e7eb'}}>
                            <h3 style={{margin:0,fontWeight:'700',color:'#1f2937',fontSize:'0.95rem'}}>Current Profiles</h3>
                        </div>
                        <table style={{width:'100%',borderCollapse:'collapse'}}>
                            <thead><tr>
                                <th style={s.th}>Employee</th>
                                <th style={s.th}>Base Salary</th>
                            </tr></thead>
                            <tbody>
                                {employees.filter(e=>e.profile_id).length===0?(
                                    <tr><td colSpan="2" style={{...s.td,textAlign:'center',color:'#9ca3af',padding:'1.5rem'}}>No profiles set up yet.</td></tr>
                                ):employees.filter(e=>e.profile_id).map(e=>(
                                    <tr key={e.id}>
                                        <td style={s.td}><div style={{fontWeight:'600'}}>{e.name}</div><div style={{fontSize:'0.73rem',color:'#9ca3af'}}>{e.email}</div></td>
                                        <td style={{...s.td,fontWeight:'700',color:'#166534'}}>₹{fmt(e.base_salary)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── TAB: Generate ── */}
            {tab==='generate'&&(
                <div style={{...s.card,maxWidth:'480px'}}>
                    <div style={{padding:'1rem 1.5rem',backgroundColor:'#f9fafb',borderBottom:'1px solid #e5e7eb'}}>
                        <h3 style={{margin:0,fontWeight:'700',color:'#1f2937',fontSize:'0.95rem'}}>Generate Monthly Salary</h3>
                    </div>
                    <form onSubmit={handleGenerate} style={{padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
                        <div>
                            <label style={s.label}>Employee</label>
                            <div style={{position:'relative'}}>
                                <select value={genUserId} onChange={e=>setGenUserId(e.target.value)} style={{...s.input,appearance:'none',paddingRight:'2rem'}} required>
                                    <option value="">Select employee…</option>
                                    {employees.filter(e=>e.profile_id).map(e=>(
                                        <option key={e.id} value={e.id}>{e.name} (₹{fmt(e.base_salary)}/mo)</option>
                                    ))}
                                </select>
                                <ChevronDown size={13} style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',color:'#9ca3af',pointerEvents:'none'}}/>
                            </div>
                            {employees.filter(e=>e.profile_id).length===0&&(
                                <p style={{margin:'0.4rem 0 0',fontSize:'0.75rem',color:'#dc2626'}}>⚠ No employee profiles set up. Go to "Employee Profiles" tab first.</p>
                            )}
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
                            <div>
                                <label style={s.label}>Month</label>
                                <select value={genMonth} onChange={e=>setGenMonth(e.target.value)} style={s.input}>
                                    {MONTHS.map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={s.label}>Year</label>
                                <input type="number" min="2020" max="2099" value={genYear} onChange={e=>setGenYear(e.target.value)} style={s.input}/>
                            </div>
                        </div>
                        <div>
                            <label style={s.label}>Deductions (₹) — leave 0 if none</label>
                            <input type="number" min="0" step="0.01" placeholder="e.g. 500" value={genDeductions} onChange={e=>setGenDeductions(e.target.value)} style={s.input}/>
                        </div>
                        <div>
                            <label style={s.label}>Notes (optional)</label>
                            <input type="text" placeholder="e.g. 2 days absent" value={genNotes} onChange={e=>setGenNotes(e.target.value)} style={s.input}/>
                        </div>
                        <button type="submit" disabled={genSaving} style={{...s.btnGreen,width:'100%',justifyContent:'center',padding:'0.875rem',opacity:genSaving?0.6:1}}>
                            {genSaving?<Loader2 size={15} style={{animation:'spin 1s linear infinite'}}/>:<IndianRupee size={15}/>}
                            {genSaving?'Generating…':'Generate Salary'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SalaryDashboard;

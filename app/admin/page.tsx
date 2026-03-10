'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Request { id: number; name: string; email: string; specialty: string; date: string; status: 'pending'|'approved'|'rejected'; hospital: string; }

const MOCK: Request[] = [
  { id:1, name:'Dr. Sarah Al-Rashid',   email:'sarah@hospital.sa',    specialty:'Pathology',      date:'Mar 08, 2026', status:'pending',  hospital:'King Faisal Hospital'   },
  { id:2, name:'Dr. Omar Khalid',       email:'omar.k@clinic.sa',     specialty:'Radiology',      date:'Mar 07, 2026', status:'pending',  hospital:'National Guard Hospital' },
  { id:3, name:'Dr. Layla Mansour',     email:'layla.m@medical.sa',   specialty:'Endocrinology',  date:'Mar 06, 2026', status:'approved', hospital:'King Fahad Specialist'   },
  { id:4, name:'Dr. Ahmed Nasser',      email:'ahmed.n@research.sa',  specialty:'Oncology',       date:'Mar 05, 2026', status:'approved', hospital:'KFSH&RC'                 },
  { id:5, name:'Dr. Noor Al-Hassan',    email:'noor.h@university.sa', specialty:'Surgery',        date:'Mar 04, 2026', status:'rejected', hospital:'King Khalid University'  },
  { id:6, name:'Dr. Khalid Al-Ghamdi',  email:'khalid@clinic.sa',     specialty:'Pathology',      date:'Mar 03, 2026', status:'pending',  hospital:'Dallah Hospital'         },
];

const FILTERS = ['all','pending','approved','rejected'] as const;
type Filter = typeof FILTERS[number];

function getInitials(name: string) {
  return name.replace(/^Dr\.?\s*/i,'').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
}

export default function AdminDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>(MOCK);
  const [filter,   setFilter]   = useState<Filter>('all');
  const [loading,  setLoading]  = useState(true);
  const [anim,     setAnim]     = useState<number|null>(null);
  const [toast,    setToast]    = useState<{msg:string;type:'success'|'error'}|null>(null);

  const pending  = requests.filter(r=>r.status==='pending').length;
  const approved = requests.filter(r=>r.status==='approved').length;
  const rejected = requests.filter(r=>r.status==='rejected').length;

  useEffect(()=>{ setTimeout(()=>setLoading(false),900); },[]);

  const showToast = (msg: string, type: 'success'|'error'='success') => {
    setToast({msg,type});
    setTimeout(()=>setToast(null),3200);
  };

  const act = (id: number, action: 'approved'|'rejected') => {
    setAnim(id);
    setTimeout(()=>{
      setRequests(r=>r.map(req=>req.id===id?{...req,status:action}:req));
      setAnim(null);
      showToast(action==='approved'?'Doctor approved successfully.':'Request rejected.');
    },600);
  };

  const filtered = filter==='all' ? requests : requests.filter(r=>r.status===filter);

  const statusStyle = (s: string) => {
    if (s==='pending')  return {bg:'#FFFBEB',color:'#D97706',border:'#FDE68A',dot:'#F59E0B'};
    if (s==='approved') return {bg:'#F0FDFA',color:'#0D9488',border:'#99F6E4',dot:'#0D9488'};
    return                     {bg:'#FFF1F2',color:'#EF4444',border:'#FECDD3',dot:'#EF4444'};
  };

  if (loading) return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{background:#F0F4F8;font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased}body::before{content:'';position:fixed;inset:0;background-image:radial-gradient(circle,#CBD5E1 1px,transparent 1px);background-size:28px 28px;opacity:.45;pointer-events:none;z-index:0}.screen{min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;z-index:1}.card{background:white;border:1px solid #E2E8F0;border-radius:28px;padding:52px 64px;text-align:center;box-shadow:0 32px 80px rgba(15,23,42,.12);display:flex;flex-direction:column;align-items:center}.logo{width:52px;height:52px;background:linear-gradient(145deg,#1E40AF,#3B82F6);border-radius:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(30,64,175,.3);margin-bottom:24px}.spinner{width:36px;height:36px;border:3px solid #EFF6FF;border-top-color:#3B82F6;border-radius:50%;animation:spin .75s linear infinite;margin-bottom:20px}.t{font-family:'DM Serif Display',serif;font-size:22px;color:#0F172A;margin:0 0 6px}.s{font-size:13px;color:#64748B;margin:0}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div className="screen"><div className="card">
          <div className="logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white"/></svg></div>
          <div className="spinner"/>
          <p className="t">Loading Console</p>
          <p className="s">Preparing admin workspace...</p>
        </div></div>
      </>
  );

  return (
      <>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--blue:#1E40AF;--blue-mid:#3B82F6;--blue-light:#EFF6FF;--blue-ring:#BFDBFE;--teal:#0D9488;--bg:#F0F4F8;--surface:#fff;--surface2:#F8FAFC;--text:#0F172A;--text2:#334155;--muted:#64748B;--subtle:#94A3B8;--border:#E2E8F0;--grad:linear-gradient(135deg,#1E40AF,#3B82F6);--display:'DM Serif Display',serif;--body:'Plus Jakarta Sans',sans-serif;}
        body{background:var(--bg);color:var(--text);font-family:var(--body);-webkit-font-smoothing:antialiased}
        body::before{content:'';position:fixed;inset:0;background-image:radial-gradient(circle,#CBD5E1 1px,transparent 1px);background-size:28px 28px;opacity:.45;pointer-events:none;z-index:0}

        .page{position:relative;z-index:1;padding:36px 48px 80px;max-width:1360px;margin:0 auto}
        @media(max-width:1024px){.page{padding:28px 24px 64px}}
        @media(max-width:600px){.page{padding:20px 16px 56px}}

        /* PAGE HEADER */
        .ph{margin-bottom:32px}
        .ph-sec{font-size:10.5px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:var(--blue-mid);margin-bottom:8px;display:flex;align-items:center;gap:8px}
        .ph-sec::after{content:'';flex:1;height:1px;background:linear-gradient(to right,#BFDBFE,transparent)}
        .ph-h1{font-family:var(--display);font-size:clamp(28px,3.5vw,40px);color:var(--text);letter-spacing:-.5px;margin-bottom:6px}
        .ph-sub{font-size:14px;color:var(--muted)}

        /* STATS */
        .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:32px}
        @media(max-width:900px){.stats{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:480px){.stats{grid-template-columns:1fr}}
        .stat{background:white;border:1.5px solid var(--border);border-radius:18px;padding:22px 22px 18px;box-shadow:0 2px 8px rgba(15,23,42,.05);transition:all .25s;position:relative;overflow:hidden}
        .stat:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(15,23,42,.1)}
        .stat-bar{position:absolute;top:0;left:0;right:0;height:3px}
        .stat-ic{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:14px}
        .stat-val{font-family:var(--display);font-size:34px;letter-spacing:-2px;color:var(--text);line-height:1;margin-bottom:4px}
        .stat-lbl{font-size:12.5px;font-weight:600;color:var(--muted)}

        /* FILTER BAR */
        .filter-bar{background:white;border:1px solid var(--border);border-radius:18px;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px;box-shadow:0 2px 8px rgba(15,23,42,.05)}
        .filter-tabs{display:flex;gap:6px;flex-wrap:wrap}
        .ftab{padding:7px 18px;border-radius:10px;font-family:var(--body);font-size:13px;font-weight:600;border:1.5px solid var(--border);background:var(--surface2);color:var(--muted);cursor:pointer;transition:all .18s;text-transform:capitalize}
        .ftab:hover{border-color:#CBD5E1;color:var(--text2)}
        .ftab.active{background:var(--blue-light);border-color:var(--blue-ring);color:var(--blue)}
        .count-pill{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:6px 14px;font-size:12px;font-weight:700;color:var(--muted)}

        /* TABLE */
        .table-wrap{background:white;border:1px solid var(--border);border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(15,23,42,.05)}
        table{width:100%;border-collapse:collapse}
        thead tr{background:var(--surface2)}
        th{padding:13px 20px;text-align:left;font-size:10.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--border);white-space:nowrap}
        td{padding:15px 20px;border-bottom:1px solid #F1F5F9;vertical-align:middle;font-size:14px}
        tr:last-child td{border-bottom:none}
        tbody tr{transition:background .15s}
        tbody tr:hover{background:#FAFBFC}
        tbody tr.animating{opacity:.5;transform:scale(.99);transition:all .35s}

        .doc-info{display:flex;align-items:center;gap:12px}
        .doc-av{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:white;flex-shrink:0;background:linear-gradient(135deg,#1E40AF,#3B82F6)}
        .doc-name{font-weight:700;color:var(--text);font-size:14px;margin-bottom:2px}
        .doc-email{font-size:12px;color:var(--muted)}

        .spec-chip{display:inline-flex;align-items:center;background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:4px 10px;font-size:12px;font-weight:600;color:var(--text2)}
        .status-chip{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;padding:5px 12px;border-radius:20px}
        .status-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}

        .acts{display:flex;gap:8px;white-space:nowrap}
        .btn-ap{height:34px;padding:0 16px;border:none;border-radius:9px;background:linear-gradient(135deg,#0D9488,#0891B2);color:white;font-family:var(--body);font-size:12.5px;font-weight:700;cursor:pointer;transition:all .18s;box-shadow:0 3px 10px rgba(13,148,136,.28)}
        .btn-ap:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(13,148,136,.38)}
        .btn-rj{height:34px;padding:0 16px;border:1.5px solid #FECDD3;border-radius:9px;background:#FFF1F2;color:#EF4444;font-family:var(--body);font-size:12.5px;font-weight:700;cursor:pointer;transition:all .18s}
        .btn-rj:hover{background:#EF4444;color:white;border-color:#EF4444}

        .empty{padding:60px 20px;text-align:center}
        .empty-ico{width:56px;height:56px;border-radius:16px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:var(--subtle)}
        .empty-t{font-family:var(--display);font-size:20px;color:var(--text);margin-bottom:6px}
        .empty-s{font-size:13px;color:var(--muted)}

        /* TOAST */
        .toast{position:fixed;top:24px;right:24px;z-index:9999;display:flex;align-items:center;gap:10px;padding:13px 20px;border-radius:14px;font-family:var(--body);font-size:13.5px;font-weight:600;color:white;box-shadow:0 8px 32px rgba(0,0,0,.15);animation:tIn .3s cubic-bezier(.16,1,.3,1) both}
        .toast-s{background:var(--teal)}
        .toast-e{background:#EF4444}

        @keyframes tIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @media(max-width:900px){.table-wrap{overflow-x:auto}}
      `}</style>

        <Navbar variant="admin" pendingCount={pending}/>

        {toast && (
            <div className={`toast toast-${toast.type==='success'?'s':'e'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {toast.type==='success'?<polyline points="20 6 9 17 4 12"/>:<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}
              </svg>
              {toast.msg}
            </div>
        )}

        <main className="page">
          {/* Header */}
          <div className="ph">
            <div className="ph-sec">Admin Console</div>
            <h1 className="ph-h1">Doctor Requests</h1>
            <p className="ph-sub">Review and manage incoming doctor registration requests.</p>
          </div>

          {/* Stats */}
          <div className="stats">
            {[
              {val:requests.length, lbl:'Total Requests', bar:'linear-gradient(90deg,#1E40AF,#3B82F6)', ic:'#EFF6FF', bcol:'#BFDBFE', icol:'#3B82F6'},
              {val:pending,  lbl:'Pending Review', bar:'linear-gradient(90deg,#D97706,#F59E0B)', ic:'#FFFBEB', bcol:'#FDE68A', icol:'#F59E0B'},
              {val:approved, lbl:'Approved',        bar:'linear-gradient(90deg,#0D9488,#0891B2)', ic:'#F0FDFA', bcol:'#99F6E4', icol:'#0D9488'},
              {val:rejected, lbl:'Rejected',         bar:'linear-gradient(90deg,#DC2626,#EF4444)', ic:'#FFF1F2', bcol:'#FECDD3', icol:'#EF4444'},
            ].map(s=>(
                <div key={s.lbl} className="stat">
                  <div className="stat-bar" style={{background:s.bar}}/>
                  <div className="stat-ic" style={{background:s.ic,border:`1px solid ${s.bcol}`,color:s.icol}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-lbl">{s.lbl}</div>
                </div>
            ))}
          </div>

          {/* Filter bar */}
          <div className="filter-bar">
            <div className="filter-tabs">
              {FILTERS.map(f=>(
                  <button key={f} className={`ftab${filter===f?' active':''}`} onClick={()=>setFilter(f)}>
                    {f==='all'?'All Requests':f}
                  </button>
              ))}
            </div>
            <div className="count-pill">{filtered.length} result{filtered.length!==1?'s':''}</div>
          </div>

          {/* Table */}
          <div className="table-wrap">
            {filtered.length > 0 ? (
                <table>
                  <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialty</th>
                    <th>Hospital</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {filtered.map(req=>{
                    const s = statusStyle(req.status);
                    return (
                        <tr key={req.id} className={anim===req.id?'animating':''}>
                          <td>
                            <div className="doc-info">
                              <div className="doc-av">{getInitials(req.name)}</div>
                              <div>
                                <div className="doc-name">{req.name}</div>
                                <div className="doc-email">{req.email}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="spec-chip">{req.specialty}</span></td>
                          <td style={{fontSize:13.5,color:'var(--text2)'}}>{req.hospital}</td>
                          <td style={{fontSize:13,color:'var(--muted)'}}>{req.date}</td>
                          <td>
                        <span className="status-chip" style={{background:s.bg,color:s.color,border:`1px solid ${s.border}`}}>
                          <span className="status-dot" style={{background:s.dot}}/>
                          {req.status.charAt(0).toUpperCase()+req.status.slice(1)}
                        </span>
                          </td>
                          <td>
                            {req.status==='pending' ? (
                                <div className="acts">
                                  <button className="btn-ap" onClick={()=>act(req.id,'approved')}>Approve</button>
                                  <button className="btn-rj" onClick={()=>act(req.id,'rejected')}>Reject</button>
                                </div>
                            ) : (
                                <span style={{fontSize:12.5,color:'var(--subtle)',fontStyle:'italic'}}>No action needed</span>
                            )}
                          </td>
                        </tr>
                    );
                  })}
                  </tbody>
                </table>
            ) : (
                <div className="empty">
                  <div className="empty-ico">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div className="empty-t">No {filter === 'all' ? '' : filter} requests</div>
                  <div className="empty-s">Nothing to show for this filter right now.</div>
                </div>
            )}
          </div>
        </main>
      </>
  );
}
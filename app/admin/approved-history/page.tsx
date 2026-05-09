'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Search, Filter, ArrowLeft,
  CheckCircle2, Mail, Briefcase, CalendarDays, UserRound, ChevronDown,
} from 'lucide-react';

const AH_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}

.ah-wrap{min-height:100vh;background:#fff;background-image:radial-gradient(ellipse 80% 50% at 50% -10%,rgba(29,158,117,0.09) 0%,transparent 60%),radial-gradient(ellipse 50% 40% at 90% 90%,rgba(8,80,65,0.05) 0%,transparent 50%)}

/* NAV */
.ah-nav{height:64px;background:rgba(255,255,255,0.92);backdrop-filter:blur(14px);border-bottom:1px solid rgba(0,0,0,0.07);display:flex;align-items:center;padding:0 28px;gap:16px;position:sticky;top:0;z-index:200;box-shadow:0 1px 16px rgba(15,23,42,0.06)}
.ah-nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none;font-size:16px;font-weight:800;letter-spacing:-0.3px;color:#0F172A}
.ah-nav-logomark{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(13,148,136,0.3)}
.ah-nav-accent{color:#0D9488}
.ah-nav-right{margin-left:auto}
.ah-nav-back{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:#64748B;text-decoration:none;padding:7px 13px;border:1px solid rgba(0,0,0,0.08);border-radius:9px;background:#F8FAFC;transition:all .15s}
.ah-nav-back:hover{color:#0D9488;border-color:#CCFBF1;background:#F0FDFA}

/* HERO */
.ah-hero{background:linear-gradient(135deg,#0D1B17 0%,#0F3028 60%,#082018 100%);padding:52px 48px 48px;position:relative;overflow:hidden}
.ah-hero-dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,0.06) 1px,transparent 1px);background-size:20px 20px;pointer-events:none}
.ah-hero-blob{position:absolute;width:300px;height:300px;border-radius:50%;background:rgba(29,158,117,0.15);filter:blur(40px);top:-60px;right:80px;pointer-events:none}
.ah-hero-inner{position:relative;z-index:1;max-width:1100px;margin:0 auto;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap}
.ah-hero-label{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#1D9E75;margin-bottom:10px}
.ah-hero-title{font-family:'DM Serif Display',serif;font-size:36px;color:#fff;letter-spacing:-0.5px;line-height:1.1;margin-bottom:6px}
.ah-hero-sub{font-size:14px;color:rgba(255,255,255,0.5)}
.ah-hero-pills{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.ah-hero-pill{display:flex;align-items:center;gap:7px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:100px;padding:7px 14px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.75)}
.ah-hero-pill-dot{width:6px;height:6px;border-radius:50%;background:#1D9E75;flex-shrink:0}

/* BODY */
.ah-body{max-width:1100px;margin:0 auto;padding:40px 48px 80px}

/* CONTROLS */
.ah-controls{display:flex;gap:12px;margin-bottom:28px;flex-wrap:wrap}
.ah-search-wrap{flex:1;min-width:200px;position:relative}
.ah-search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#94A3B8;pointer-events:none}
.ah-search{width:100%;height:44px;background:white;border:1.5px solid rgba(0,0,0,0.08);border-radius:11px;padding:0 14px 0 40px;font-family:'DM Sans',sans-serif;font-size:14px;color:#0F172A;outline:none;transition:all .2s;box-shadow:0 1px 4px rgba(15,23,42,0.04)}
.ah-search::placeholder{color:#94A3B8}
.ah-search:focus{border-color:#0D9488;box-shadow:0 0 0 3px rgba(13,148,136,0.1)}
.ah-filter-wrap{display:flex;align-items:center;gap:8px;height:44px;background:white;border:1.5px solid rgba(0,0,0,0.08);border-radius:11px;padding:0 14px;color:#64748B}
.ah-select{font-family:'DM Sans',sans-serif;font-size:13.5px;color:#0F172A;border:none;outline:none;background:transparent;cursor:pointer}

/* RESULTS */
.ah-results-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.ah-results-count{font-size:13px;color:#64748B}

/* CARDS GRID */
.ah-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px}

.ah-card{background:white;border:1px solid rgba(0,0,0,0.07);border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(15,23,42,0.05);transition:all .2s}
.ah-card:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(15,23,42,0.1);border-color:rgba(13,148,136,0.15)}
.ah-card-top{display:flex;align-items:center;gap:14px;padding:20px 20px 16px}
.ah-avatar{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:white;flex-shrink:0;box-shadow:0 4px 12px rgba(13,148,136,0.25)}
.ah-card-name{font-size:14px;font-weight:700;color:#0F172A;margin-bottom:2px}
.ah-card-id{font-size:11.5px;color:#94A3B8;font-family:monospace}
.ah-badge-approved{display:inline-block;font-size:9px;font-weight:800;letter-spacing:1px;text-transform:uppercase;background:#F0FDFA;border:1px solid #99F6E4;color:#0D9488;padding:3px 8px;border-radius:100px;margin-left:8px;vertical-align:middle}

.ah-details{padding:0 20px 16px;display:flex;flex-direction:column;gap:8px;border-bottom:1px solid #F1F5F9}
.ah-detail{display:flex;align-items:center;gap:8px;font-size:13px;color:#64748B}
.ah-detail svg{color:#94A3B8;flex-shrink:0}

.ah-card-foot{display:flex;align-items:center;gap:8px;padding:14px 20px}
.ah-btn-ghost{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 14px;background:#F8FAFC;border:1px solid rgba(0,0,0,0.08);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:600;color:#64748B;cursor:pointer;transition:all .15s}
.ah-btn-ghost:hover{background:#F0FDFA;color:#0D9488;border-color:#CCFBF1}
.ah-btn-primary{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 16px;background:linear-gradient(135deg,#1D9E75,#0D9488);border:none;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:700;color:white;cursor:pointer;box-shadow:0 4px 12px rgba(13,148,136,0.25);transition:all .15s;margin-left:auto}
.ah-btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(13,148,136,0.35)}

/* SKELETON */
.ah-skeleton{display:flex;flex-direction:column;gap:16px}
.ah-skel-row{height:130px;background:linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%);background-size:200% 100%;animation:ahShimmer 1.6s ease-in-out infinite;border-radius:16px}
@keyframes ahShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}

/* EMPTY */
.ah-empty{text-align:center;padding:64px 24px}
.ah-empty-icon{width:56px;height:56px;border-radius:16px;background:#F0FDFA;border:1px solid #CCFBF1;display:flex;align-items:center;justify-content:center;color:#0D9488;margin:0 auto 16px}
.ah-empty-title{font-size:15px;font-weight:700;color:#0F172A;margin-bottom:4px}
.ah-empty-sub{font-size:13px;color:#94A3B8}

@media(max-width:768px){.ah-body{padding:32px 20px 60px}.ah-hero{padding:40px 24px 36px}.ah-grid{grid-template-columns:1fr}}
`;

type ApprovedDoctor = {
  id: string;
  name: string;
  email: string;
  specialty: string;
  approvedAt: string;
  approvedBy?: string;
};

const FALLBACK: ApprovedDoctor[] = [
  { id: 'A-1021', name: 'Dr. Sara Alqahtani', email: 'sara@mail.com', specialty: 'Endocrinology', approvedAt: new Date(Date.now() - 86400000 * 2).toISOString(), approvedBy: 'System Admin' },
  { id: 'A-1022', name: 'Dr. Ahmed Alharbi',  email: 'ahmed@mail.com', specialty: 'Radiology', approvedAt: new Date(Date.now() - 86400000 * 5).toISOString(), approvedBy: 'System Admin' },
];

export default function ApprovedHistoryPage() {
  const [data, setData] = useState<ApprovedDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [specialty, setSpecialty] = useState<'All' | string>('All');

  useEffect(() => {
    setTimeout(() => { setData(FALLBACK); setLoading(false); }, 500);
  }, []);

  const specialties = useMemo(() => {
    const set = new Set<string>();
    data.forEach(d => set.add(d.specialty));
    return ['All', ...Array.from(set)];
  }, [data]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return data
      .filter(d => specialty === 'All' ? true : d.specialty === specialty)
      .filter(d => !query || d.name.toLowerCase().includes(query) || d.email.toLowerCase().includes(query) || d.id.toLowerCase().includes(query))
      .sort((a, b) => new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime());
  }, [data, q, specialty]);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });

  function getInitials(name: string) {
    return name.replace('Dr. ', '').split(' ').map(p => p[0]).slice(0, 2).join('');
  }

  return (
    <>
      <style>{AH_STYLES}</style>
      <div className="ah-wrap">

        {/* NAV */}
        <nav className="ah-nav">
          <Link href="/admin" className="ah-nav-logo">
            <div className="ah-nav-logomark">
              <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
                <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"/>
                <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                <circle cx="20" cy="20" r="3.5" fill="white"/>
              </svg>
            </div>
            <span>Diagno<span className="ah-nav-accent">vate</span></span>
          </Link>
          <div className="ah-nav-right">
            <Link href="/admin" className="ah-nav-back">
              <ArrowLeft size={14} /> Admin Panel
            </Link>
          </div>
        </nav>

        {/* HERO */}
        <div className="ah-hero">
          <div className="ah-hero-dots" />
          <div className="ah-hero-blob" />
          <div className="ah-hero-inner">
            <div>
              <div className="ah-hero-label">Admin · Approved History</div>
              <h1 className="ah-hero-title">Approved Doctors</h1>
              <p className="ah-hero-sub">Review all approved doctor registrations with timestamps</p>
            </div>
            <div className="ah-hero-pills">
              <div className="ah-hero-pill">
                <span className="ah-hero-pill-dot" />
                {loading ? '—' : data.length} Total Approved
              </div>
              <div className="ah-hero-pill">Verified</div>
              <div className="ah-hero-pill">Timestamped</div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="ah-body">

          {/* CONTROLS */}
          <div className="ah-controls">
            <div className="ah-search-wrap">
              <Search size={16} className="ah-search-icon" />
              <input
                className="ah-search"
                placeholder="Search by name, email, or ID..."
                value={q}
                onChange={e => setQ(e.target.value)}
              />
            </div>
            <div className="ah-filter-wrap">
              <Filter size={15} />
              <select className="ah-select" value={specialty} onChange={e => setSpecialty(e.target.value)}>
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} />
            </div>
          </div>

          {/* RESULTS BAR */}
          <div className="ah-results-bar">
            <span className="ah-results-count">
              Showing <strong>{loading ? '—' : filtered.length}</strong> records
            </span>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="ah-skeleton">
              <div className="ah-skel-row" />
              <div className="ah-skel-row" />
              <div className="ah-skel-row" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="ah-empty">
              <div className="ah-empty-icon"><UserRound size={24} /></div>
              <div className="ah-empty-title">No approved records found</div>
              <div className="ah-empty-sub">Try changing the filter or search keyword.</div>
            </div>
          ) : (
            <div className="ah-grid">
              {filtered.map(d => (
                <div key={d.id} className="ah-card">
                  <div className="ah-card-top">
                    <div className="ah-avatar">{getInitials(d.name)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ah-card-name">
                        {d.name}
                        <span className="ah-badge-approved">APPROVED</span>
                      </div>
                      <div className="ah-card-id">ID: {d.id}</div>
                    </div>
                  </div>
                  <div className="ah-details">
                    <div className="ah-detail"><Mail size={13} />{d.email}</div>
                    <div className="ah-detail"><Briefcase size={13} />{d.specialty}</div>
                    <div className="ah-detail"><CalendarDays size={13} />{fmt(d.approvedAt)}</div>
                    {d.approvedBy && <div className="ah-detail"><UserRound size={13} />Approved by: {d.approvedBy}</div>}
                  </div>
                  <div className="ah-card-foot">
                    <button className="ah-btn-ghost" onClick={() => navigator.clipboard.writeText(d.email)}>
                      Copy Email
                    </button>
                    <button className="ah-btn-primary" onClick={() => alert(`(UI Only) Open profile for: ${d.name}`)}>
                      <ShieldCheck size={13} /> View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

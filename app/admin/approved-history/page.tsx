'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './styles.module.css';
import {
  ShieldCheck,
  Search,
  Filter,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Briefcase,
  CalendarDays,
  UserRound,
} from 'lucide-react';

type ApprovedDoctor = {
  id: string;
  name: string;
  email: string;
  specialty: string;
  approvedAt: string; // ISO string
  approvedBy?: string;
};

export default function ApprovedHistoryPage() {
  const [data, setData] = useState<ApprovedDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [specialty, setSpecialty] = useState<'All' | string>('All');


  const fallback: ApprovedDoctor[] = [
    {
      id: 'A-1021',
      name: 'Dr. Sara Alqahtani',
      email: 'sara@mail.com',
      specialty: 'Endocrinology',
      approvedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      approvedBy: 'System Admin',
    },
    {
      id: 'A-1022',
      name: 'Dr. Ahmed Alharbi',
      email: 'ahmed@mail.com',
      specialty: 'Radiology',
      approvedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      approvedBy: 'System Admin',
    },
  ];

  useEffect(() => {

    setTimeout(() => {
      setData(fallback);
      setLoading(false);
    }, 500);
  }, []);

  const specialties = useMemo(() => {
    const set = new Set<string>();
    data.forEach(d => set.add(d.specialty));
    return ['All', ...Array.from(set)];
  }, [data]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return data
      .filter(d => (specialty === 'All' ? true : d.specialty === specialty))
      .filter(d => {
        if (!query) return true;
        return (
          d.name.toLowerCase().includes(query) ||
          d.email.toLowerCase().includes(query) ||
          d.id.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime());
  }, [data, q, specialty]);

  const totalApproved = data.length;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className={styles.brandTitle}>DIAGNOVATE</div>
            <div className={styles.brandSub}>Admin • Approved History</div>
          </div>
        </div>

        <div className={styles.topbarRight}>
          <Link href="/admin" className={styles.backBtn}>
            <ArrowLeft size={16} />
            Back to Admin
          </Link>
        </div>
      </header>

      <main className={styles.container}>
        <div className={styles.hero}>
          <div>
            <h1 className={styles.title}>Approved Doctors History</h1>
            <p className={styles.subtitle}>
              Review all approved doctor registrations with timestamps and details.
            </p>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div className={styles.summaryLabel}>Total Approved</div>
              <div className={styles.summaryValue}>{loading ? '—' : totalApproved}</div>
            </div>
          </div>
        </div>

        <section className={styles.controls}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
className={styles.searchInput}
              placeholder="Search by name, email, or ID..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className={styles.filterBox}>
            <Filter size={16} />
            <select
              className={styles.select}
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            >
              {specialties.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </section>

        <section className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <div className={styles.tableTitle}>Approved List</div>
            <div className={styles.tableHint}>
              Showing <b>{loading ? '—' : filtered.length}</b> records
            </div>
          </div>

          {loading ? (
            <div className={styles.skeletonWrap}>
              <div className={styles.skeletonRow} />
              <div className={styles.skeletonRow} />
              <div className={styles.skeletonRow} />
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}><UserRound size={28} /></div>
              <div className={styles.emptyTitle}>No approved records found</div>
              <div className={styles.emptySub}>Try changing the filter or search keyword.</div>
            </div>
          ) : (
            <div className={styles.grid}>
              {filtered.map((d) => (
                <div key={d.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div className={styles.avatar}>
                      {d.name.replace('Dr. ', '').split(' ').map(p => p[0]).slice(0,2).join('')}
                    </div>
                    <div className={styles.cardMain}>
                      <div className={styles.nameRow}>
                        <div className={styles.name}>{d.name}</div>
                        <span className={styles.badgeApproved}>APPROVED</span>
                      </div>
                      <div className={styles.meta}>ID: <span className={styles.mono}>{d.id}</span></div>
                    </div>
                  </div>

                  <div className={styles.details}>
                    <div className={styles.detail}>
                      <Mail size={14} />
                      <span className={styles.detailText}>{d.email}</span>
                    </div>
                    <div className={styles.detail}>
                      <Briefcase size={14} />
                      <span className={styles.detailText}>{d.specialty}</span>
                    </div>
                    <div className={styles.detail}>
                      <CalendarDays size={14} />
                      <span className={styles.detailText}>{fmt(d.approvedAt)}</span>
                    </div>
                    {d.approvedBy && (
                      <div className={styles.detail}>
                        <UserRound size={14} />
                        <span className={styles.detailText}>Approved by: {d.approvedBy}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <button
                      className={styles.secondaryBtn}
                      onClick={() => navigator.clipboard.writeText(d.email)}
                      title="Copy email"
                    >
                      Copy Email
                    </button>

                    <button
                      className={styles.primaryBtn}
                      onClick={() => alert(`(UI Only) Open profile for: ${d.name}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

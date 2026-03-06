'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../dashboard/styles.module.css';
import {
  User,
  Bell,
  LogOut,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface Request {
  id: number;
  name: string;
  email: string;
  specialty: string;
  status: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);


  useEffect(() => {
    fetch('/api/requests')
      .then(res => res.json())
      .then(data => {
        setRequests(data);
        setTimeout(() => setLoading(false), 1500);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.clear();
      router.push('/log-in');
    }, 1500);
  };


  const updateStatus = async (id: number, status: string) => {
    await fetch('/api/requests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    const updated = await fetch('/api/requests').then(res => res.json());
    setRequests(updated);
  };

  const pending  = requests.filter(r => r.status === 'Pending').length;
  const approved = requests.filter(r => r.status === 'Approved').length;
  const rejected = requests.filter(r => r.status === 'Rejected').length;


  if (loading) {
    return (
        <div className={styles.logoutScreen}>
          <div className={styles.logoutCard}>
            <div className={styles.logoutSpinner} />
            <p className={styles.logoutText}>Loading dashboard...</p>
            <p className={styles.logoutSub}>Preparing your workspace, Admin</p>
          </div>
        </div>
    );
  }


  if (loggingOut) {
    return (
        <div className={styles.logoutScreen}>
          <div className={styles.logoutCard}>
            <div className={styles.logoutSpinner} />
            <p className={styles.logoutText}>Signing out...</p>
            <p className={styles.logoutSub}>See you next time, Admin</p>
          </div>
        </div>
    );
  }

  return (
      <div className={styles.container}>

        <header className={styles.header}>
          <div className={styles.logoArea}>
            <div className={styles.logo}>
              <User size={28} />
            </div>
            <div className={styles.logoTextArea}>
              <h1 className={styles.logoMain}>DIAGNOVATE</h1>
              <p className={styles.logoSub}>Admin Control Panel</p>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.profileCard}>
              <div className={styles.avatar}>
                <User size={24} />
              </div>
              <div className={styles.profileInfo}>
                <div className={styles.profileName}>
                  <span className={styles.doctorName}>System Admin</span>
                  <span className={styles.specialty}>Administrator</span>
                </div>
                <div className={styles.profileEmail}>admin@diagnovate.com</div>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.iconButton} aria-label="Notifications">
                <Bell size={20} />
              </button>
              <button onClick={handleLogout} className={styles.iconButton} aria-label="Logout">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.welcomeSection}>
            <div>
              <h2 className={styles.greeting}>Welcome back, Admin</h2>
              <p className={styles.
date}>Manage doctor registrations and access approvals</p>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                <Clock size={24} />
              </div>
              <div>
                <p className={styles.statLabel}>Pending</p>
                <p className={styles.statValue}>{pending}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <p className={styles.statLabel}>Approved</p>
                <p className={styles.statValue}>{approved}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                <XCircle size={24} />
              </div>
              <div>
                <p className={styles.statLabel}>Rejected</p>
                <p className={styles.statValue}>{rejected}</p>
              </div>
            </div>
          </div>

          <div className={styles.recentCasesSection}>
            <h3>Doctor Registration Requests</h3>
            <div className={styles.casesGrid}>
              {requests.map((req) => (
                  <div key={req.id} className={styles.caseCard}>
                    <div className={styles.caseHeader}>
                      <span className={styles.caseId}>Request #{req.id}</span>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: req.status === 'Approved' ? '#dcfce7' : req.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                        color: req.status === 'Approved' ? '#166534' : req.status === 'Rejected' ? '#991b1b' : '#92400e'
                      }}>
                        {req.status}
                      </span>
                    </div>

                    <div className={styles.caseBody}>
                      <p><strong>Name:</strong> {req.name}</p>
                      <p><strong>Email:</strong> {req.email}</p>
                      <p><strong>Specialty:</strong> {req.specialty}</p>

                      {req.status === 'Pending' && (
                          <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                            <button
                                style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                                onClick={() => updateStatus(req.id, 'Approved')}
                            >
                              Approve
                            </button>
                            <button
                                style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                                onClick={() => updateStatus(req.id, 'Rejected')}
                            >
                              Reject
                            </button>
                          </div>
                      )}
                    </div>
                  </div>
              ))}
            </div>
          </div>

        </main>
      </div>
  );
}

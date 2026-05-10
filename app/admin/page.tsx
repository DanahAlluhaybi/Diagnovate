'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Users, CheckCircle, XCircle, Clock, Shield,
    Search, ChevronDown, AlertCircle,
    UserCheck, UserX, LogOut, Bell, User,
} from 'lucide-react';
import { BASE } from '@/lib/api';

const API_BASE_URL = `${BASE}/api`;

interface AdminStats {
    total_users: number;
    pending_approvals: number;
    active_users: number;
    rejected_today: number;
}

interface PendingUser {
    id: number;
    full_name: string;
    email: string;
    mobile: string;
    institution: string;
    license_number: string;
    specialty: string;
    registered_at: string;
    email_verified: boolean;
    sms_verified: boolean;
}

interface ActiveUser {
    id: number;
    full_name: string;
    email: string;
    institution: string;
    specialty: string;
    status: 'active' | 'inactive';
    last_login: string;
    created_at: string;
}

interface AdminUser {
    id: number;
    name: string;
    email: string;
}

type TabType = 'pending' | 'active' | 'all';

const REJECTION_REASONS = [
    'The provided information is incorrect or incomplete.',
    'The license number is invalid or could not be verified.',
    'The stated specialty is not accepted on this platform.',
    'Other',
];

//  FIX 1: null-safe formatDate
const formatDate = (d: string) => {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

//  FIX 2: null-safe formatTime
const formatTime = (d: string) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const getInitials = (name: string) =>
    (name ?? '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

const AD_STYLES = `
    @keyframes ad-fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
    @keyframes ad-spin    { to{transform:rotate(360deg)} }
    @keyframes ad-pulse   { 0%,100%{opacity:1} 50%{opacity:0.5} }
    @keyframes ad-modal   { from{opacity:0;transform:scale(0.95) translateY(10px)} to{opacity:1;transform:none} }
    @keyframes ad-drop    { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
    @keyframes ad-toast   { from{opacity:0;transform:translateX(-50%) translateY(12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

    .ad-wrap { min-height:100vh; font-family:"DM Sans",sans-serif;
        background:radial-gradient(ellipse 80% 50% at 50% -10%, rgba(29,158,117,0.09) 0%, transparent 60%),
                   radial-gradient(ellipse 50% 40% at 90% 90%, rgba(8,80,65,0.05) 0%, transparent 50%), #FFFFFF; }

    /* Navbar */
    .ad-nav {
        position:fixed; top:0; left:0; right:0; z-index:200;
        height:64px; display:flex; align-items:center; padding:0 32px; gap:20px;
        background:rgba(255,255,255,0.92); backdrop-filter:blur(20px);
        border-bottom:1px solid rgba(0,0,0,0.06);
        box-shadow:0 1px 12px rgba(0,0,0,0.06);
    }
    .ad-nav-logo { display:flex; align-items:center; gap:10px; text-decoration:none; }
    .ad-nav-logo-mark {
        width:34px; height:34px; border-radius:9px; flex-shrink:0;
        background:linear-gradient(145deg,#1D9E75,#0D9488);
        display:flex; align-items:center; justify-content:center;
        box-shadow:0 4px 12px rgba(13,148,136,0.3);
    }
    .ad-nav-logo-name { font-family:"DM Serif Display",serif; font-size:19px; font-weight:400; letter-spacing:-0.3px; color:#111827; line-height:1.1; }
    .ad-nav-logo-accent { color:#0D9488; font-style:italic; }
    .ad-nav-logo-sub { font-size:9px; font-weight:700; letter-spacing:2px; color:#9CA3AF; text-transform:uppercase; margin-top:1px; }
    .ad-nav-links { display:flex; gap:4px; margin-left:24px; }
    .ad-nav-link { padding:6px 14px; border-radius:8px; font-size:13px; font-weight:600; color:#6B7280; text-decoration:none; transition:all .15s; }
    .ad-nav-link:hover { color:#0D9488; background:#F0FDFA; }
    .ad-nav-link-active { color:#0D9488; background:#F0FDFA; font-weight:700; }
    .ad-nav-right { display:flex; align-items:center; gap:10px; margin-left:auto; }
    .ad-nav-icon-btn { width:36px; height:36px; border-radius:9px; border:1.5px solid rgba(0,0,0,0.08);
        background:#F9FAFB; display:flex; align-items:center; justify-content:center;
        color:#6B7280; cursor:pointer; transition:all .15s; }
    .ad-nav-icon-btn:hover { background:#F0FDFA; color:#0D9488; border-color:rgba(13,148,136,0.2); }
    .ad-nav-divider { width:1px; height:24px; background:rgba(0,0,0,0.08); }
    .ad-nav-profile { display:flex; align-items:center; gap:8px; cursor:pointer; padding:5px 10px; border-radius:10px; transition:background .15s; }
    .ad-nav-profile:hover { background:#F9FAFB; }
    .ad-nav-avatar { width:32px; height:32px; border-radius:9px; background:linear-gradient(135deg,#1D9E75,#0D9488);
        display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; }
    .ad-nav-pname { font-size:13px; font-weight:700; color:#111827; }
    .ad-nav-prole { font-size:10.5px; color:#9CA3AF; margin-top:1px; }
    .ad-nav-dropdown {
        position:absolute; top:calc(100% + 10px); right:0; z-index:300;
        background:#fff; border:1px solid rgba(0,0,0,0.08); border-radius:16px;
        box-shadow:0 16px 48px rgba(15,23,42,0.12); width:220px; overflow:hidden;
        animation:ad-drop .18s cubic-bezier(.16,1,.3,1) both;
    }
    .ad-nav-prof-head { display:flex; align-items:center; gap:10px; padding:14px 16px; border-bottom:1px solid rgba(0,0,0,0.06); background:#F9FAFB; }
    .ad-nav-prof-av { width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,#1D9E75,#0D9488);
        display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; }
    .ad-nav-prof-name { font-size:13.5px; font-weight:700; color:#111827; }
    .ad-nav-prof-spec { font-size:11.5px; color:#9CA3AF; margin-top:1px; }
    .ad-nav-menu-item { display:flex; align-items:center; gap:10px; width:100%; padding:11px 16px;
        background:transparent; border:none; font-family:"DM Sans",sans-serif; font-size:13px;
        font-weight:600; color:#374151; cursor:pointer; transition:background .12s; text-decoration:none; }
    .ad-nav-menu-item:hover { background:#F9FAFB; }
    .ad-nav-menu-item-danger { color:#EF4444; }
    .ad-nav-menu-item-danger:hover { background:#FFF1F2; }
    .ad-nav-sep { height:1px; background:rgba(0,0,0,0.05); margin:2px 0; }
    .ad-notif-dropdown {
        position:absolute; top:calc(100% + 10px); right:0; z-index:300;
        background:#fff; border:1px solid rgba(0,0,0,0.08); border-radius:16px;
        box-shadow:0 16px 48px rgba(15,23,42,0.12); width:280px; overflow:hidden;
        animation:ad-drop .18s cubic-bezier(.16,1,.3,1) both;
    }
    .ad-notif-head { padding:14px 18px; border-bottom:1px solid rgba(0,0,0,0.06); font-size:11px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:#0D9488; display:flex; align-items:center; gap:8px; }
    .ad-notif-empty { padding:48px 24px; text-align:center; }

    /* Hero */
    .ad-hero {
        background:linear-gradient(135deg,#0D1B17 0%,#0F3028 60%,#082018 100%);
        padding:64px 52px 52px; position:relative; overflow:hidden;
        display:flex; align-items:center; justify-content:space-between; gap:32px;
        flex-wrap:wrap;
    }
    .ad-hero-dots { position:absolute; inset:0; pointer-events:none;
        background-image:radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px); background-size:20px 20px; }
    .ad-hero-blob { position:absolute; width:300px; height:300px; border-radius:50%;
        background:rgba(29,158,117,0.15); filter:blur(40px); right:-60px; top:-60px; pointer-events:none; }
    .ad-hero-left { position:relative; z-index:1; }
    .ad-hero-badge { display:inline-flex; align-items:center; gap:6px; padding:5px 12px; border-radius:100px;
        border:1px solid rgba(29,158,117,0.4); background:rgba(29,158,117,0.12);
        font-size:10px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:#6EE7B7; margin-bottom:14px; }
    .ad-hero-badge-dot { width:5px; height:5px; border-radius:50%; background:#1D9E75; animation:ad-pulse 2s ease-in-out infinite; }
    .ad-hero-h1 { font-family:"DM Serif Display",serif; font-size:clamp(28px,3.5vw,44px);
        color:#fff; letter-spacing:-0.8px; line-height:1.1; margin:0 0 12px; }
    .ad-hero-h1 em { font-style:italic; color:#6EE7B7; }
    .ad-hero-date { font-size:12.5px; color:rgba(255,255,255,0.5); font-weight:500; }
    .ad-hero-stats { display:flex; gap:10px; flex-wrap:wrap; position:relative; z-index:1; }
    .ad-hero-stat { display:flex; flex-direction:column; align-items:flex-start; padding:16px 20px;
        background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:12px; min-width:130px; }
    .ad-hstat-ic { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center;
        margin-bottom:10px; }
    .ad-hstat-val { font-size:26px; font-weight:900; color:#fff; letter-spacing:-0.5px; }
    .ad-hstat-lbl { font-size:11px; color:rgba(255,255,255,0.55); font-weight:600; margin-top:2px; }

    /* Main */
    .ad-main { max-width:1280px; margin:0 auto; padding:40px 52px 80px; }

    /* Section head */
    .ad-sec-head { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
    .ad-sec-label { font-size:10px; font-weight:800; letter-spacing:2.5px; text-transform:uppercase; color:#1D9E75; white-space:nowrap; }
    .ad-sec-line  { flex:1; height:1px; background:linear-gradient(to right,rgba(13,148,136,0.3),transparent); }

    /* Toolbar */
    .ad-toolbar { display:flex; align-items:center; gap:16px; flex-wrap:wrap; margin-bottom:20px; }
    .ad-tabs { display:flex; gap:4px; padding:5px; background:#F1F5F9; border-radius:12px;
        box-shadow:inset 0 1px 3px rgba(0,0,0,0.06); }
    .ad-tab { display:flex; align-items:center; gap:7px; padding:8px 16px; border:none; border-radius:9px;
        background:transparent; font-family:"DM Sans",sans-serif; font-size:13px; font-weight:600;
        color:#6B7280; cursor:pointer; transition:all .18s; white-space:nowrap; }
    .ad-tab:hover { color:#0D9488; background:rgba(13,148,136,0.06); }
    .ad-tab-active { background:#fff; color:#0D9488; font-weight:700;
        box-shadow:0 2px 8px rgba(0,0,0,0.1),0 1px 2px rgba(0,0,0,0.06); }
    .ad-tab-badge { display:inline-flex; align-items:center; justify-content:center;
        min-width:20px; height:20px; padding:0 5px; border-radius:10px;
        background:rgba(0,0,0,0.06); font-size:10.5px; font-weight:800; color:#6B7280; }
    .ad-tab-badge-active { background:rgba(13,148,136,0.12); color:#0D9488; }
    .ad-search-wrap { position:relative; flex:1; min-width:240px; }
    .ad-search-ic { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#9CA3AF; pointer-events:none; }
    .ad-search-input { width:100%; height:44px; padding:0 14px 0 42px; box-sizing:border-box;
        border:1.5px solid rgba(0,0,0,0.1); border-radius:10px;
        font-family:"DM Sans",sans-serif; font-size:13.5px; color:#111827; background:#F9FAFB; outline:none; transition:all .2s; }
    .ad-search-input::placeholder { color:#9CA3AF; }
    .ad-search-input:focus { border-color:#0D9488; background:#fff; box-shadow:0 0 0 4px rgba(13,148,136,0.08); }

    /* Table */
    .ad-table-wrap { background:#fff; border:1px solid rgba(0,0,0,0.07); border-radius:16px; overflow:hidden;
        box-shadow:0 1px 3px rgba(0,0,0,0.06),0 8px 24px rgba(0,0,0,0.04); animation:ad-fadeUp .5s cubic-bezier(.16,1,.3,1) both; }
    table.ad-table { width:100%; border-collapse:collapse; }
    table.ad-table th { padding:11px 16px; text-align:left; font-size:11px; font-weight:800; letter-spacing:.6px; text-transform:uppercase; color:#9CA3AF; border-bottom:1px solid rgba(0,0,0,0.06); background:#F9FAFB; }
    table.ad-table td { padding:14px 16px; border-bottom:1px solid rgba(0,0,0,0.04); font-size:13.5px; color:#111827; }
    .ad-table-row { transition:background .12s; }
    .ad-table-row:hover td { background:#F8FFFE; }
    .ad-table-row:last-child td { border-bottom:none; }
    .ad-user-cell { display:flex; align-items:center; gap:10px; }
    .ad-user-avatar { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center;
        font-size:13px; font-weight:800; color:#fff; flex-shrink:0; }
    .ad-user-name  { font-size:13.5px; font-weight:700; color:#111827; }
    .ad-user-email { font-size:11.5px; color:#9CA3AF; margin-top:1px; }
    .ad-user-spec  { font-size:11.5px; color:#6B7280; margin-top:2px; }
    .ad-license-tag { display:inline-block; padding:3px 10px; border-radius:8px; background:#F1F5F9;
        border:1px solid rgba(0,0,0,0.08); font-size:12px; font-weight:700; color:#374151; font-family:"DM Sans",monospace; }
    .ad-date-cell { display:flex; flex-direction:column; }
    .ad-time-label { font-size:11px; color:#9CA3AF; margin-top:1px; }
    .ad-action-btns { display:flex; gap:7px; }
    .ad-approve-btn { display:flex; align-items:center; gap:5px; height:32px; padding:0 14px;
        background:#F0FDFA; border:1.5px solid #99F6E4; border-radius:8px;
        font-family:"DM Sans",sans-serif; font-size:12.5px; font-weight:700; color:#0D9488; cursor:pointer; transition:all .15s; }
    .ad-approve-btn:hover { background:#0D9488; color:#fff; border-color:#0D9488; }
    .ad-reject-btn { display:flex; align-items:center; gap:5px; height:32px; padding:0 14px;
        background:#FFF1F2; border:1.5px solid #FECDD3; border-radius:8px;
        font-family:"DM Sans",sans-serif; font-size:12.5px; font-weight:700; color:#EF4444; cursor:pointer; transition:all .15s; }
    .ad-reject-btn:hover { background:#EF4444; color:#fff; border-color:#EF4444; }
    .ad-status-tag { display:inline-flex; align-items:center; gap:5px; padding:4px 11px; border-radius:20px;
        font-size:11.5px; font-weight:700; border:1px solid; }
    .ad-status-active   { background:#F0FDF4; color:#059669; border-color:#BBF7D0; }
    .ad-status-inactive { background:#F9FAFB; color:#9CA3AF; border-color:rgba(0,0,0,0.08); }
    .ad-status-dot { width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; }
    .ad-deactivate-btn { display:flex; align-items:center; gap:5px; height:32px; padding:0 14px;
        background:#FFF1F2; border:1.5px solid #FECDD3; border-radius:8px;
        font-family:"DM Sans",sans-serif; font-size:12.5px; font-weight:700; color:#EF4444; cursor:pointer; transition:all .15s; }
    .ad-deactivate-btn:hover { background:#EF4444; color:#fff; }
    .ad-activate-btn { display:flex; align-items:center; gap:5px; height:32px; padding:0 14px;
        background:#F0FDF4; border:1.5px solid #BBF7D0; border-radius:8px;
        font-family:"DM Sans",sans-serif; font-size:12.5px; font-weight:700; color:#059669; cursor:pointer; transition:all .15s; }
    .ad-activate-btn:hover { background:#059669; color:#fff; }

    /* Empty */
    .ad-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:60px 24px; }
    .ad-empty-ic { width:56px; height:56px; border-radius:16px; background:#F0FDFA; border:1px solid #CCFBF1;
        display:flex; align-items:center; justify-content:center; }
    .ad-empty-title { font-size:16px; font-weight:700; color:#111827; margin:0; }
    .ad-empty-sub   { font-size:13px; color:#9CA3AF; margin:0; }

    /* Modal */
    .ad-modal-overlay { position:fixed; inset:0; background:rgba(15,23,42,0.4); backdrop-filter:blur(8px); z-index:500;
        display:flex; align-items:center; justify-content:center; padding:24px; }
    .ad-modal { background:#fff; border-radius:20px; width:100%; max-width:480px;
        border:1px solid rgba(0,0,0,0.08); box-shadow:0 24px 80px rgba(15,23,42,0.18);
        animation:ad-modal .25s cubic-bezier(.16,1,.3,1) both; overflow:hidden; }
    .ad-modal-header { display:flex; align-items:center; gap:10px; padding:18px 24px;
        font-size:15px; font-weight:800; color:#fff; }
    .ad-modal-header-approve { background:linear-gradient(135deg,#1D9E75,#0D9488); }
    .ad-modal-header-reject  { background:linear-gradient(135deg,#EF4444,#DC2626); }
    .ad-modal-body { padding:24px; }
    .ad-modal-user-card { display:flex; align-items:center; gap:12px; padding:14px 16px;
        background:#F9FAFB; border:1px solid rgba(0,0,0,0.07); border-radius:12px; margin-bottom:16px; }
    .ad-modal-text { font-size:13.5px; color:#374151; line-height:1.6; margin-bottom:16px; }
    .ad-reason-group { display:flex; flex-direction:column; gap:8px; }
    .ad-reason-option { display:flex; align-items:flex-start; gap:10px; padding:11px 14px; border-radius:10px;
        border:1.5px solid rgba(0,0,0,0.08); background:#F9FAFB; cursor:pointer;
        font-size:13px; color:#374151; font-weight:500; transition:all .15s; }
    .ad-reason-option:hover { border-color:rgba(13,148,136,0.3); background:#F0FDFA; color:#0D9488; }
    .ad-reason-selected { border-color:#0D9488; background:#F0FDFA; color:#0D9488; font-weight:700; }
    .ad-reason-radio { accent-color:#0D9488; margin-top:2px; flex-shrink:0; }
    .ad-modal-footer { display:flex; justify-content:flex-end; gap:10px; padding:16px 24px;
        border-top:1px solid rgba(0,0,0,0.06); background:#F9FAFB; }
    .ad-modal-cancel { height:44px; padding:0 22px; border:1.5px solid rgba(0,0,0,0.1); border-radius:10px;
        background:#fff; font-family:"DM Sans",sans-serif; font-size:13.5px; font-weight:600; color:#6B7280; cursor:pointer; transition:all .15s; }
    .ad-modal-cancel:hover { background:#F1F5F9; }
    .ad-modal-cancel:disabled { opacity:.5; cursor:not-allowed; }
    .ad-modal-approve { display:flex; align-items:center; gap:7px; height:44px; padding:0 24px;
        background:linear-gradient(135deg,#1D9E75,#0D9488); color:#fff; border:none; border-radius:10px;
        font-family:"DM Sans",sans-serif; font-size:13.5px; font-weight:700; cursor:pointer; transition:all .2s;
        box-shadow:0 4px 16px rgba(29,158,117,.28); }
    .ad-modal-approve:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px rgba(13,148,136,.4); }
    .ad-modal-approve:disabled { opacity:.6; cursor:not-allowed; }
    .ad-modal-reject { display:flex; align-items:center; gap:7px; height:44px; padding:0 24px;
        background:linear-gradient(135deg,#EF4444,#DC2626); color:#fff; border:none; border-radius:10px;
        font-family:"DM Sans",sans-serif; font-size:13.5px; font-weight:700; cursor:pointer; transition:all .2s;
        box-shadow:0 4px 16px rgba(239,68,68,.28); }
    .ad-modal-reject:hover:not(:disabled) { transform:translateY(-1px); }
    .ad-modal-reject:disabled { opacity:.6; cursor:not-allowed; }
    .ad-spinner-sm { width:16px; height:16px; border:2.5px solid rgba(255,255,255,.3); border-top-color:#fff;
        border-radius:50%; animation:ad-spin .7s linear infinite; flex-shrink:0; }

    /* Toast */
    .ad-toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%);
        padding:12px 22px; border-radius:12px; font-size:13.5px; font-weight:700;
        font-family:"DM Sans",sans-serif; z-index:9999; white-space:nowrap;
        display:flex; align-items:center; gap:8px;
        animation:ad-toast .3s cubic-bezier(.16,1,.3,1) both;
        box-shadow:0 8px 32px rgba(0,0,0,0.15); }
    .ad-toast-ok  { background:#0D9488; color:#fff; }
    .ad-toast-err { background:#EF4444; color:#fff; }

    @media (max-width:1024px) {
        .ad-hero { padding:80px 28px 40px; flex-direction:column; align-items:flex-start; }
        .ad-main { padding:32px 28px 60px; }
    }
    @media (max-width:640px) {
        .ad-nav { padding:0 16px; }
        .ad-hero { padding:76px 16px 36px; }
        .ad-main { padding:24px 16px 60px; }
        .ad-toolbar { flex-direction:column; align-items:stretch; }
    }
`;

export default function AdminPage() {
    const router = useRouter();

    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<TabType>('pending');
    const [search, setSearch] = useState('');
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const [actionModal, setActionModal] = useState<{ user: PendingUser; type: 'approve' | 'reject' } | null>(null);
    const [rejectReason, setRejectReason] = useState(REJECTION_REASONS[0]);
    const [customReason, setCustomReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchAll();
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node))
                setProfileOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node))
                setNotifOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchWithToken = async (endpoint: string, options: RequestInit = {}) => {
        const token = localStorage.getItem('admin_token');
        if (!token) { router.push('/log-in?role=admin'); throw new Error('No token'); }
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers },
        });
        if (response.status === 401) {
            localStorage.removeItem('admin_token'); localStorage.removeItem('admin_user');
            router.push('/log-in?role=admin'); throw new Error('Unauthorized');
        }
        if (!response.ok) { const errorText = await response.text(); throw new Error(`HTTP error! status: ${response.status} — ${errorText}`); }
        return response.json();
    };

    const fetchAll = async () => {
        try {
            setLoading(true);
            const token   = localStorage.getItem('admin_token');
            const userStr = localStorage.getItem('admin_user');
            if (!token || !userStr) { router.push('/log-in?role=admin'); return; }
            const userData = JSON.parse(userStr) as AdminUser;
            setAdmin(userData);
            const [statsData, pendingData, activeData] = await Promise.all([
                fetchWithToken('/admin/stats'),
                fetchWithToken('/admin/pending-users'),
                fetchWithToken('/admin/active-users'),
            ]);
            setStats(statsData);
            setPendingUsers(pendingData);
            setActiveUsers(activeData);
        } catch (error) {
            console.error('FetchAll error:', error);
            showToast('Failed to load data', false);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg: string, ok: boolean) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3200);
    };

    const handleApprove = async () => {
        if (!actionModal) return;
        setActionLoading(true);
        try {
            await fetchWithToken(`/admin/approve/${actionModal.user.id}`, { method: 'POST' });
            setPendingUsers(p => p.filter(u => u.id !== actionModal.user.id));
            setStats(s => s ? { ...s, pending_approvals: s.pending_approvals - 1, active_users: s.active_users + 1 } : s);
            showToast(`${actionModal.user.full_name} approved successfully`, true);
        } catch { showToast('Failed to approve', false); }
        finally { setActionLoading(false); setActionModal(null); }
    };

    const handleReject = async () => {
        if (!actionModal) return;
        setActionLoading(true);
        const finalReason = rejectReason === 'Other' ? (customReason.trim() || 'No reason provided') : rejectReason;
        try {
            await fetchWithToken(`/admin/reject/${actionModal.user.id}`, {
                method: 'POST', body: JSON.stringify({ reason: finalReason }),
            });
            setPendingUsers(p => p.filter(u => u.id !== actionModal.user.id));
            setStats(s => s ? { ...s, pending_approvals: s.pending_approvals - 1, rejected_today: s.rejected_today + 1 } : s);
            showToast(`${actionModal.user.full_name} rejected`, false);
        } catch { showToast('Failed to reject', false); }
        finally { setActionLoading(false); setActionModal(null); setCustomReason(''); }
    };

    const handleToggleStatus = async (user: ActiveUser) => {
        try {
            const action = user.status === 'active' ? 'deactivate' : 'activate';
            await fetchWithToken(`/admin/${action}/${user.id}`, { method: 'POST' });
            setActiveUsers(u => u.map(x => x.id === user.id ? { ...x, status: action === 'activate' ? 'active' : 'inactive' } : x));
            showToast(`${user.full_name} ${action}d`, action === 'activate');
        } catch { showToast('Network error.', false); }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token'); localStorage.removeItem('admin_user');
        router.push('/log-in?role=admin');
    };

    // ✅ FIX 3: null-safe search filters using ?? ''
    const filteredPending = pendingUsers.filter(u =>
        (u.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (u.institution ?? '').toLowerCase().includes(search.toLowerCase())
    );

    // ✅ FIX 4: null-safe search filters for active users
    const filteredActive = activeUsers.filter(u =>
        (u.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (u.institution ?? '').toLowerCase().includes(search.toLowerCase())
    );

    const hour = new Date().getHours();
    const greeting = hour >= 5 && hour < 12 ? 'Good morning' : hour >= 12 && hour < 17 ? 'Good afternoon' : hour >= 17 && hour < 21 ? 'Good evening' : 'Good night';

    if (loading) return (
        <>
            <style>{AD_STYLES}{`
            @keyframes ad-spin-l { to{transform:rotate(360deg)} }
            .ad-loading { min-height:100vh; display:flex; align-items:center; justify-content:center;
                background:radial-gradient(ellipse 80% 50% at 50% -10%, rgba(29,158,117,0.09) 0%, transparent 60%), #fff; }
            .ad-loading-card { background:#fff; border:1px solid rgba(0,0,0,0.07); border-radius:24px; padding:48px 64px;
                text-align:center; box-shadow:0 32px 80px rgba(15,23,42,.1); display:flex; flex-direction:column; align-items:center; }
            .ad-loading-logo { width:52px; height:52px; background:linear-gradient(145deg,#1D9E75,#0D9488); border-radius:16px;
                display:flex; align-items:center; justify-content:center;
                box-shadow:0 8px 24px rgba(13,148,136,.35); margin-bottom:24px; }
            .ad-loading-spinner { width:36px; height:36px; border:3px solid rgba(13,148,136,0.15); border-top-color:#0D9488;
                border-radius:50%; animation:ad-spin-l .75s linear infinite; margin-bottom:20px; }
            .ad-loading-title { font-family:"DM Serif Display",serif; font-size:22px; color:#111827; margin:0 0 6px; }
            .ad-loading-sub   { font-size:13px; color:#9CA3AF; margin:0; }
        `}</style>
            <div className="ad-loading">
                <div className="ad-loading-card">
                    <div className="ad-loading-logo">
                        <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                            <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5"/>
                            <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                            <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                            <circle cx="20" cy="20" r="3.5" fill="white"/>
                        </svg>
                    </div>
                    <div className="ad-loading-spinner" />
                    <p className="ad-loading-title">{greeting}, Admin</p>
                    <p className="ad-loading-sub">Preparing your workspace…</p>
                </div>
            </div>
        </>
    );

    return (
        <>
            <style>{AD_STYLES}</style>
            <div className="ad-wrap">
                {/* NAVBAR */}
                <nav className="ad-nav">
                    <Link href="/admin" className="ad-nav-logo">
                        <div className="ad-nav-logo-mark">
                            <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
                                <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5"/>
                                <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                                <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                                <circle cx="20" cy="20" r="3" fill="white"/>
                            </svg>
                        </div>
                        <div>
                            <div className="ad-nav-logo-name">Diagno<span className="ad-nav-logo-accent">vate</span></div>
                            <div className="ad-nav-logo-sub">Admin Console</div>
                        </div>
                    </Link>

                    <div className="ad-nav-links">
                        <Link href="/admin" className="ad-nav-link ad-nav-link-active">Admin Panel</Link>
                    </div>

                    <div className="ad-nav-right">
                        <div style={{ position:'relative' }} ref={notifRef}>
                            <button className="ad-nav-icon-btn" onClick={() => setNotifOpen(p => !p)} title="Notifications">
                                <Bell size={15} />
                            </button>
                            {notifOpen && (
                                <div className="ad-notif-dropdown">
                                    <div className="ad-notif-head"><Bell size={13} /> Notifications</div>
                                    <div className="ad-notif-empty">
                                        <Bell size={28} color="#CBD5E1" style={{ margin:'0 auto 12px', display:'block' }} />
                                        <p style={{ fontSize:14, fontWeight:700, color:'#111827', margin:'0 0 4px' }}>All clear</p>
                                        <p style={{ fontSize:12, color:'#9CA3AF', margin:0 }}>No new notifications</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="ad-nav-divider" />
                        <div style={{ position:'relative' }} ref={profileRef}>
                            <div className="ad-nav-profile" onClick={() => setProfileOpen(p => !p)}>
                                <div className="ad-nav-avatar"><Shield size={13} /></div>
                                <div>
                                    <div className="ad-nav-pname">{admin?.name ?? 'Admin'}</div>
                                    <div className="ad-nav-prole">System Administrator</div>
                                </div>
                                <ChevronDown size={12} color="#9CA3AF" />
                            </div>
                            {profileOpen && (
                                <div className="ad-nav-dropdown">
                                    <div className="ad-nav-prof-head">
                                        <div className="ad-nav-prof-av"><Shield size={18} /></div>
                                        <div>
                                            <div className="ad-nav-prof-name">{admin?.name ?? 'Admin'}</div>
                                            <div className="ad-nav-prof-spec">{admin?.email ?? ''}</div>
                                        </div>
                                    </div>
                                    <div style={{ padding:'6px 0' }}>
                                        <Link href="/admin/profile" className="ad-nav-menu-item">
                                            <User size={14} /> My Profile
                                        </Link>
                                        <div className="ad-nav-sep" />
                                        <button className="ad-nav-menu-item ad-nav-menu-item-danger" onClick={handleLogout}>
                                            <LogOut size={14} /> Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>

                {/* HERO */}
                <div className="ad-hero">
                    <div className="ad-hero-dots" />
                    <div className="ad-hero-blob" />
                    <div className="ad-hero-left">
                        <div className="ad-hero-badge">
                            <span className="ad-hero-badge-dot" /> Admin Control Panel
                        </div>
                        <h1 className="ad-hero-h1">User<br /><em>Management</em></h1>
                        <p className="ad-hero-date">
                            {new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
                        </p>
                    </div>
                    <div className="ad-hero-stats">
                        {[
                            { icon:<Clock size={17}/>,     label:'Pending Approval', val:stats?.pending_approvals ?? 0, hc:'#F59E0B', hbg:'rgba(245,158,11,0.12)' },
                            { icon:<UserCheck size={17}/>, label:'Active Users',     val:stats?.active_users ?? 0,      hc:'#1D9E75', hbg:'rgba(29,158,117,0.12)' },
                            { icon:<Users size={17}/>,     label:'Total Users',      val:stats?.total_users ?? 0,       hc:'#7C3AED', hbg:'rgba(124,58,237,0.12)'  },
                            { icon:<UserX size={17}/>,     label:'Rejected Today',   val:stats?.rejected_today ?? 0,    hc:'#E11D48', hbg:'rgba(225,29,72,0.12)'   },
                        ].map((st, i) => (
                            <div key={i} className="ad-hero-stat">
                                <div className="ad-hstat-ic" style={{ background:st.hbg }}>
                                    <span style={{ color:st.hc }}>{st.icon}</span>
                                </div>
                                <div className="ad-hstat-val">{st.val}</div>
                                <div className="ad-hstat-lbl">{st.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <main className="ad-main">
                    <div className="ad-sec-head">
                        <span className="ad-sec-label">User Accounts</span>
                        <div className="ad-sec-line" />
                    </div>

                    <div className="ad-toolbar">
                        <div className="ad-tabs">
                            {([
                                { key:'pending', label:'Pending',  count:pendingUsers.length },
                                { key:'active',  label:'Active',   count:activeUsers.filter(u => u.status === 'active').length },
                                { key:'all',     label:'All Users', count:activeUsers.length },
                            ] as { key:TabType; label:string; count:number }[]).map(t => (
                                <button key={t.key}
                                        className={`ad-tab${tab === t.key ? ' ad-tab-active' : ''}`}
                                        onClick={() => { setTab(t.key); setSearch(''); }}>
                                    {t.label}
                                    <span className={`ad-tab-badge${tab === t.key ? ' ad-tab-badge-active' : ''}`}>
                                    {t.count}
                                </span>
                                </button>
                            ))}
                        </div>
                        <div className="ad-search-wrap">
                            <Search size={14} className="ad-search-ic" />
                            <input
                                className="ad-search-input"
                                placeholder="Search by name, email, institution…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* PENDING TAB */}
                    {tab === 'pending' && (
                        <div className="ad-table-wrap">
                            {filteredPending.length === 0 ? (
                                <div className="ad-empty">
                                    <div className="ad-empty-ic"><CheckCircle size={26} color="#0D9488" /></div>
                                    <p className="ad-empty-title">All caught up!</p>
                                    <p className="ad-empty-sub">No pending registration requests at this time.</p>
                                </div>
                            ) : (
                                <table className="ad-table">
                                    <thead>
                                    <tr>
                                        <th>Clinician</th><th>Specialty</th><th>Mobile</th><th>Registered</th><th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredPending.map(u => (
                                        <tr key={u.id} className="ad-table-row">
                                            <td>
                                                <div className="ad-user-cell">
                                                    <div className="ad-user-avatar" style={{ background:'linear-gradient(135deg,#0D9488,#0891B2)' }}>
                                                        {getInitials(u.full_name)}
                                                    </div>
                                                    <div>
                                                        <div className="ad-user-name">{u.full_name}</div>
                                                        <div className="ad-user-email">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ fontSize:13, color:'#374151' }}>{u.specialty || '—'}</td>
                                            <td><span className="ad-license-tag">{u.mobile || '—'}</span></td>
                                            <td>
                                                <div className="ad-date-cell">
                                                    <span>{formatDate(u.registered_at)}</span>
                                                    <span className="ad-time-label">{formatTime(u.registered_at)}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="ad-action-btns">
                                                    <button className="ad-approve-btn" onClick={() => setActionModal({ user:u, type:'approve' })}>
                                                        <CheckCircle size={13} /> Approve
                                                    </button>
                                                    <button className="ad-reject-btn" onClick={() => { setRejectReason(REJECTION_REASONS[0]); setCustomReason(''); setActionModal({ user:u, type:'reject' }); }}>
                                                        <XCircle size={13} /> Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* ACTIVE / ALL TABS */}
                    {(tab === 'active' || tab === 'all') && (
                        <div className="ad-table-wrap">
                            {filteredActive.length === 0 ? (
                                <div className="ad-empty">
                                    <div className="ad-empty-ic"><Users size={26} color="#94A3B8" /></div>
                                    <p className="ad-empty-title">No users found</p>
                                    <p className="ad-empty-sub">Try adjusting your search.</p>
                                </div>
                            ) : (
                                <table className="ad-table">
                                    <thead>
                                    <tr>
                                        <th>Clinician</th><th>Specialty</th><th>Status</th><th>Last Login</th><th>Joined</th><th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {(tab === 'active' ? filteredActive.filter(u => u.status === 'active') : filteredActive).map(u => (
                                        <tr key={u.id} className="ad-table-row">
                                            <td>
                                                <div className="ad-user-cell">
                                                    <div className="ad-user-avatar" style={{
                                                        background: u.status === 'active'
                                                            ? 'linear-gradient(135deg,#10B981,#059669)'
                                                            : 'linear-gradient(135deg,#94A3B8,#CBD5E1)'
                                                    }}>
                                                        {getInitials(u.full_name)}
                                                    </div>
                                                    <div>
                                                        <div className="ad-user-name">{u.full_name}</div>
                                                        <div className="ad-user-email">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ fontSize:13, color:'#374151' }}>{u.specialty || '—'}</td>
                                            <td>
                                            <span className={`ad-status-tag ${u.status === 'active' ? 'ad-status-active' : 'ad-status-inactive'}`}>
                                                <span className="ad-status-dot" />
                                                {u.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                            </td>
                                            <td>
                                                <div className="ad-date-cell">
                                                    <span>{formatDate(u.last_login)}</span>
                                                    <span className="ad-time-label">{formatTime(u.last_login)}</span>
                                                </div>
                                            </td>
                                            <td>{formatDate(u.created_at)}</td>
                                            <td>
                                                <button
                                                    className={u.status === 'active' ? 'ad-deactivate-btn' : 'ad-activate-btn'}
                                                    onClick={() => handleToggleStatus(u)}
                                                >
                                                    {u.status === 'active' ? <><UserX size={13}/> Deactivate</> : <><UserCheck size={13}/> Activate</>}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </main>

                {/* ACTION MODAL */}
                {actionModal && (
                    <div className="ad-modal-overlay" onClick={() => !actionLoading && setActionModal(null)}>
                        <div className="ad-modal" onClick={e => e.stopPropagation()}>
                            <div className={`ad-modal-header ${actionModal.type === 'approve' ? 'ad-modal-header-approve' : 'ad-modal-header-reject'}`}>
                                {actionModal.type === 'approve'
                                    ? <><CheckCircle size={20}/> Approve Registration</>
                                    : <><XCircle size={20}/> Reject Registration</>
                                }
                            </div>
                            <div className="ad-modal-body">
                                <div className="ad-modal-user-card">
                                    <div className="ad-user-avatar" style={{ width:44, height:44, fontSize:16, background:'linear-gradient(135deg,#0D9488,#0891B2)', flexShrink:0 }}>
                                        {getInitials(actionModal.user.full_name)}
                                    </div>
                                    <div>
                                        <div className="ad-user-name" style={{ fontSize:14 }}>{actionModal.user.full_name}</div>
                                        <div className="ad-user-email">{actionModal.user.email}</div>
                                        <div className="ad-user-spec">{actionModal.user.institution}</div>
                                    </div>
                                </div>

                                {actionModal.type === 'approve' ? (
                                    <p className="ad-modal-text">
                                        Approving this account will grant <strong>{actionModal.user.full_name}</strong> full access to the Diagnovate platform.
                                    </p>
                                ) : (
                                    <>
                                        <p className="ad-modal-text">Select a reason for rejecting this registration request.</p>
                                        <div className="ad-reason-group">
                                            {REJECTION_REASONS.map(r => (
                                                <label key={r} className={`ad-reason-option${rejectReason === r ? ' ad-reason-selected' : ''}`}>
                                                    <input type="radio" name="reason" value={r} checked={rejectReason === r}
                                                           onChange={() => setRejectReason(r)} className="ad-reason-radio" />
                                                    {r}
                                                </label>
                                            ))}
                                        </div>
                                        {rejectReason === 'Other' && (
                                            <textarea placeholder="Write the reason here…" value={customReason}
                                                      onChange={e => setCustomReason(e.target.value)} rows={3}
                                                      style={{ width:'100%', marginTop:8, padding:'10px 12px', borderRadius:10,
                                                          border:'1.5px solid rgba(0,0,0,0.1)', fontSize:13, fontFamily:'inherit',
                                                          resize:'vertical', outline:'none', color:'#374151', boxSizing:'border-box' }} />
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="ad-modal-footer">
                                <button className="ad-modal-cancel" onClick={() => setActionModal(null)} disabled={actionLoading}>Cancel</button>
                                {actionModal.type === 'approve' ? (
                                    <button className="ad-modal-approve" onClick={handleApprove} disabled={actionLoading}>
                                        {actionLoading ? <span className="ad-spinner-sm"/> : <CheckCircle size={14}/>}
                                        {actionLoading ? 'Approving…' : 'Confirm Approval'}
                                    </button>
                                ) : (
                                    <button className="ad-modal-reject" onClick={handleReject} disabled={actionLoading}>
                                        {actionLoading ? <span className="ad-spinner-sm"/> : <XCircle size={14}/>}
                                        {actionLoading ? 'Rejecting…' : 'Confirm Rejection'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* TOAST */}
                {toast && (
                    <div className={`ad-toast ${toast.ok ? 'ad-toast-ok' : 'ad-toast-err'}`}>
                        {toast.ok ? <CheckCircle size={15}/> : <AlertCircle size={15}/>}
                        {toast.msg}
                    </div>
                )}
            </div>
        </>
    );
}
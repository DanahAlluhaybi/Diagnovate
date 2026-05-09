'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, ArrowLeft, Search, UserPlus, Scan, Trash2, Brain, CheckCircle2, AlertTriangle, Minus, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { BASE } from '@/lib/api';

type Gender   = 'Male' | 'Female';
type Status   = 'Active' | 'Inactive';
type View     = 'list' | 'detail';
type Tab      = 'info' | 'images' | 'diagnosis' | 'reports';
type ScanType = 'Ultrasound';

const SCAN_TYPE_STYLES: Record<string, { color: string; bg: string; border: string }> = {
    'Ultrasound': { color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4' },
};

const SEVERITY_META = {
    Low:      { color: '#059669', bg: '#F0FDF4', border: '#BBF7D0', icon: '●' },
    Moderate: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: '◆' },
    High:     { color: '#DC2626', bg: '#FFF1F2', border: '#FECDD3', icon: '▲' },
} as const;

const MODE_LABELS: Record<string, string> = {
    image: 'Image Only',
    lab:   'Lab Only',
    both:  'Multi-Modal',
};

interface MedicalImage {
    id: string; date: string; type: ScanType; label: string;
    enhanced: boolean; enhancedSrc?: string; originalSrc?: string;
}

interface DiagnosisRecord {
    id             : string;
    date           : string;
    mode           : 'image' | 'lab' | 'both';
    modelName      : string;
    votingResult   : string;
    confidence     : number;
    severity       : 'Low' | 'Moderate' | 'High';
    malignancyScore: number;
    recommendation : string;
    findings       : string[];
    topModels      : { name: string; result: string; confidence: number; available: boolean }[];
}

interface Patient {
    id: string; mrn: string; firstName: string; lastName: string;
    age: number; gender: Gender; phone: string; email: string;
    lastVisit: string; status: Status; condition: string; images?: MedicalImage[];
}

const EMPTY_FORM = {
    firstName:'', lastName:'', mrn:'', age:'',
    gender:'Male' as Gender, phone:'', email:'',
    condition:'', status:'Active' as Status,
};

import { loadImages, deleteImage } from '@/lib/imageStorage';
import { loadDiagnoses, deleteDiagnosis } from '@/lib/diagnosisStorage';

async function loadImagesForPatient(patient: { id: string; mrn: string }): Promise<MedicalImage[]> {
    try {
        const raw = await loadImages(patient.mrn, patient.id);
        return raw.map((img: any): MedicalImage => ({
            id: img.id, date: img.date, type: 'Ultrasound' as ScanType,
            label: img.label, enhanced: img.isEnhanced ?? true,
            enhancedSrc: img.enhancedSrc, originalSrc: img.originalSrc,
        }));
    } catch { return []; }
}

async function loadDiagnosesForPatient(patient: { id: string; mrn: string }): Promise<DiagnosisRecord[]> {
    try {
        return await loadDiagnoses(patient.mrn, patient.id);
    } catch { return []; }
}

async function deleteImageFromStorage(patient: { id: string; mrn: string }, imageId: string) {
    await deleteImage(patient.mrn, patient.id, imageId);
}

const getAgeGroup  = (age: number) => age <= 18 ? '0-18' : age <= 40 ? '19-40' : '40+';
const formatDate   = (d: string)   => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const formatTime   = (d: string)   => d ? new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';
const getInitials  = (f: string, l: string) => `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase();

const PM_STYLES = `
    @keyframes pm-fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
    @keyframes pm-spin   { to{transform:rotate(360deg)} }
    @keyframes pm-pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
    @keyframes pm-modal  { from{opacity:0;transform:scale(0.95) translateY(10px)} to{opacity:1;transform:none} }

    .pm-wrap { min-height:100vh; font-family:"DM Sans",sans-serif;
        background:radial-gradient(ellipse 80% 50% at 50% -10%, rgba(29,158,117,0.09) 0%, transparent 60%),
                   radial-gradient(ellipse 50% 40% at 90% 90%, rgba(8,80,65,0.05) 0%, transparent 50%), #FFFFFF; }

    /* Hero */
    .pm-hero { background:linear-gradient(135deg,#0D1B17 0%,#0F3028 60%,#082018 100%);
        padding:52px 52px 48px; position:relative; overflow:hidden; }
    .pm-hero-dots { position:absolute; inset:0; pointer-events:none;
        background-image:radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px); background-size:20px 20px; }
    .pm-hero-blob { position:absolute; width:300px; height:300px; border-radius:50%;
        background:rgba(29,158,117,0.15); filter:blur(40px); right:-60px; top:-60px; pointer-events:none; }
    .pm-hero-inner { position:relative; z-index:1; max-width:1280px; margin:0 auto; }
    .pm-hero-back { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:8px;
        border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.06);
        color:rgba(255,255,255,0.7); font-size:12.5px; font-weight:500; cursor:pointer;
        margin-bottom:22px; transition:all .18s; font-family:"DM Sans",sans-serif; border:none; }
    .pm-hero-back:hover { background:rgba(255,255,255,0.1); color:#fff; }
    .pm-hero-row { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:18px; }
    .pm-hero-badge { display:inline-flex; align-items:center; gap:6px; padding:5px 12px; border-radius:100px;
        border:1px solid rgba(29,158,117,0.4); background:rgba(29,158,117,0.12);
        font-size:10px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:#6EE7B7; margin-bottom:14px; }
    .pm-badge-dot { width:5px; height:5px; border-radius:50%; background:#1D9E75; animation:pm-pulse 2s ease-in-out infinite; }
    .pm-hero-title { font-family:"DM Serif Display",serif; font-size:clamp(28px,3.5vw,44px);
        color:#fff; letter-spacing:-0.8px; line-height:1.1; margin:0; }
    .pm-hero-title em { font-style:italic; color:#6EE7B7; }
    .pm-add-btn { display:flex; align-items:center; gap:7px; height:44px; padding:0 22px;
        background:linear-gradient(135deg,#1D9E75,#0D9488); color:#fff; border:none; border-radius:10px;
        font-family:"DM Sans",sans-serif; font-size:13.5px; font-weight:700; cursor:pointer; transition:all .2s;
        box-shadow:0 4px 16px rgba(29,158,117,.3); flex-shrink:0; }
    .pm-add-btn:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(13,148,136,.4); }
    .pm-hero-pills { display:flex; gap:10px; flex-wrap:wrap; margin-top:8px; }
    .pm-hero-pill { display:flex; align-items:center; gap:8px; padding:8px 16px; border-radius:10px;
        background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); }
    .pm-pill-val { font-size:15px; font-weight:800; color:#fff; }
    .pm-pill-lbl { font-size:11px; color:rgba(255,255,255,0.55); font-weight:500; }

    /* Main */
    .pm-main { max-width:1280px; margin:0 auto; padding:36px 52px 80px; }

    /* Search card */
    .pm-search-card { background:#fff; border:1px solid rgba(0,0,0,0.07); border-radius:16px;
        padding:20px 24px; margin-bottom:20px;
        box-shadow:0 1px 3px rgba(0,0,0,0.06),0 8px 24px rgba(0,0,0,0.04); animation:pm-fadeUp .4s cubic-bezier(.16,1,.3,1) both; }
    .pm-search-wrap { position:relative; margin-bottom:14px; }
    .pm-search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#9CA3AF; }
    .pm-search-input { width:100%; height:46px; padding:0 14px 0 42px; box-sizing:border-box;
        border:1.5px solid rgba(0,0,0,0.1); border-radius:10px;
        font-family:"DM Sans",sans-serif; font-size:13.5px; color:#111827; background:#F9FAFB; outline:none; transition:all .2s; }
    .pm-search-input::placeholder { color:#9CA3AF; }
    .pm-search-input:focus { border-color:#0D9488; background:#fff; box-shadow:0 0 0 4px rgba(13,148,136,0.08); }
    .pm-filter-row { display:flex; gap:6px; flex-wrap:wrap; }
    .pm-filter-btn { height:32px; padding:0 14px; border:1.5px solid rgba(0,0,0,0.1); border-radius:8px;
        background:#F9FAFB; font-family:"DM Sans",sans-serif; font-size:12.5px; font-weight:600; color:#6B7280;
        cursor:pointer; transition:all .15s; }
    .pm-filter-btn:hover { border-color:rgba(13,148,136,0.3); color:#0D9488; background:#F0FDFA; }
    .pm-filter-active { border-color:#0D9488; color:#0D9488; background:#F0FDFA; font-weight:700; }

    /* Table card */
    .pm-table-card { background:#fff; border:1px solid rgba(0,0,0,0.07); border-radius:16px; overflow:hidden;
        box-shadow:0 1px 3px rgba(0,0,0,0.06),0 8px 24px rgba(0,0,0,0.04); animation:pm-fadeUp .5s cubic-bezier(.16,1,.3,1) .05s both; }
    .pm-table-head { display:flex; align-items:center; padding:16px 24px; border-bottom:1px solid rgba(0,0,0,0.06); background:#F9FAFB; }
    .pm-table-count { font-size:12px; font-weight:700; color:#6B7280; letter-spacing:.5px; }
    .pm-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:60px 24px; color:#9CA3AF; font-size:14px; }
    .pm-empty-sub { font-size:12.5px; color:#CBD5E1; }
    table.pm-table { width:100%; border-collapse:collapse; }
    table.pm-table th { padding:11px 16px; text-align:left; font-size:11px; font-weight:800; letter-spacing:.6px; text-transform:uppercase; color:#9CA3AF; border-bottom:1px solid rgba(0,0,0,0.06); background:#F9FAFB; }
    table.pm-table td { padding:14px 16px; border-bottom:1px solid rgba(0,0,0,0.04); font-size:13.5px; color:#111827; }
    .pm-table-row { cursor:pointer; transition:background .12s; }
    .pm-table-row:hover td { background:#F8FFFE; }
    .pm-table-row:last-child td { border-bottom:none; }
    .pm-patient-cell { display:flex; align-items:center; gap:10px; }
    .pm-avatar-sm { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center;
        font-size:12px; font-weight:800; color:#fff; flex-shrink:0; }
    .pm-avatar-m { background:linear-gradient(135deg,#1D9E75,#0D9488); }
    .pm-avatar-f { background:linear-gradient(135deg,#9333EA,#A855F7); }
    .pm-p-name { font-weight:700; color:#111827; font-size:13.5px; }
    .pm-p-id   { font-size:11.5px; color:#9CA3AF; margin-top:1px; }
    .pm-muted  { color:#6B7280; }
    .pm-badge-active   { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; background:#F0FDF4; color:#059669; border:1px solid #BBF7D0; }
    .pm-badge-inactive { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; background:#FFF1F2; color:#DC2626; border:1px solid #FECDD3; }
    .pm-view-btn { display:inline-flex; align-items:center; height:30px; padding:0 14px; border:1.5px solid rgba(13,148,136,0.3); border-radius:8px;
        background:#F0FDFA; color:#0D9488; font-family:"DM Sans",sans-serif; font-size:12.5px; font-weight:700; cursor:pointer; transition:all .15s; }
    .pm-view-btn:hover { background:#0D9488; color:#fff; }
    .pm-table-footer { padding:12px 24px; background:#F9FAFB; border-top:1px solid rgba(0,0,0,0.05); font-size:12px; color:#9CA3AF; font-weight:500; }

    /* Detail hero */
    .pm-detail-hero { background:linear-gradient(135deg,#0D1B17 0%,#0F3028 60%,#082018 100%);
        padding:52px 52px 48px; position:relative; overflow:hidden; }

    /* Profile strip */
    .pm-profile-strip { display:flex; align-items:center; gap:20px; background:#fff;
        border:1px solid rgba(0,0,0,0.07); border-radius:16px; padding:24px 28px; margin-bottom:20px;
        box-shadow:0 1px 3px rgba(0,0,0,0.06),0 8px 24px rgba(0,0,0,0.04); animation:pm-fadeUp .4s cubic-bezier(.16,1,.3,1) both; }
    .pm-avatar-lg { width:60px; height:60px; border-radius:16px; display:flex; align-items:center; justify-content:center;
        font-size:20px; font-weight:800; color:#fff; flex-shrink:0; }
    .pm-profile-info { flex:1; min-width:0; }
    .pm-detail-name { font-size:20px; font-weight:800; color:#111827; letter-spacing:-0.3px; margin:0 0 3px; }
    .pm-detail-mrn  { font-size:12.5px; color:#9CA3AF; margin:0 0 8px; }
    .pm-profile-meta { display:flex; gap:10px; flex-wrap:wrap; margin-left:auto; }
    .pm-meta-chip { display:flex; flex-direction:column; align-items:center; padding:10px 16px;
        background:#F9FAFB; border:1px solid rgba(0,0,0,0.07); border-radius:10px; min-width:70px; }
    .pm-meta-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:#9CA3AF; margin-bottom:3px; }
    .pm-meta-val   { font-size:16px; font-weight:800; color:#111827; }

    /* Tab bar */
    .pm-tabs { display:flex; gap:4px; padding:6px; background:#F1F5F9; border-radius:14px; margin-bottom:20px;
        overflow-x:auto; box-shadow:inset 0 1px 3px rgba(0,0,0,0.06); animation:pm-fadeUp .45s cubic-bezier(.16,1,.3,1) .05s both; }
    .pm-tab { display:flex; align-items:center; gap:6px; padding:9px 18px; border:none; border-radius:10px;
        background:transparent; font-family:"DM Sans",sans-serif; font-size:13px; font-weight:600;
        color:#6B7280; cursor:pointer; transition:all .18s; white-space:nowrap; }
    .pm-tab:hover { color:#0D9488; background:rgba(13,148,136,0.06); }
    .pm-tab-active { background:#fff; color:#0D9488; font-weight:700;
        box-shadow:0 2px 8px rgba(0,0,0,0.1),0 1px 2px rgba(0,0,0,0.06); }
    .pm-tab-count { display:inline-flex; align-items:center; justify-content:center;
        width:18px; height:18px; border-radius:50%; background:#0D9488; color:#fff; font-size:10px; font-weight:800; }

    /* Info card */
    .pm-detail-card { background:#fff; border:1px solid rgba(0,0,0,0.07); border-radius:16px; overflow:hidden;
        box-shadow:0 1px 3px rgba(0,0,0,0.06),0 8px 24px rgba(0,0,0,0.04); animation:pm-fadeUp .5s cubic-bezier(.16,1,.3,1) .1s both; }
    .pm-detail-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0; }
    .pm-detail-item { padding:20px 24px; border-bottom:1px solid rgba(0,0,0,0.05); border-right:1px solid rgba(0,0,0,0.05); }
    .pm-detail-item:nth-child(3n) { border-right:none; }
    .pm-detail-item:nth-last-child(-n+3) { border-bottom:none; }
    .pm-detail-label { font-size:10px; font-weight:800; letter-spacing:.6px; text-transform:uppercase; color:#9CA3AF; margin-bottom:5px; }
    .pm-detail-value { font-size:14px; font-weight:600; color:#111827; }
    .pm-status-edit-row { display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
    .pm-status-opt { height:30px; padding:0 14px; border:1.5px solid rgba(0,0,0,0.1); border-radius:8px;
        background:#F9FAFB; font-family:"DM Sans",sans-serif; font-size:12.5px; font-weight:600; color:#6B7280; cursor:pointer; transition:all .15s; }
    .pm-status-cancel { height:30px; padding:0 12px; border:none; border-radius:8px; background:transparent;
        font-family:"DM Sans",sans-serif; font-size:12px; font-weight:600; color:#9CA3AF; cursor:pointer; }
    .pm-status-view-row { display:flex; align-items:center; gap:8px; }
    .pm-status-edit-btn { height:28px; padding:0 12px; border:1.5px solid rgba(0,0,0,0.1); border-radius:7px;
        background:#F9FAFB; font-family:"DM Sans",sans-serif; font-size:12px; font-weight:600; color:#6B7280; cursor:pointer; transition:all .15s; }
    .pm-status-edit-btn:hover { border-color:rgba(13,148,136,0.3); color:#0D9488; background:#F0FDFA; }

    /* Empty tab */
    .pm-empty-tab { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px;
        padding:60px 24px; background:#fff; border:1px solid rgba(0,0,0,0.07); border-radius:16px;
        box-shadow:0 1px 3px rgba(0,0,0,0.06),0 8px 24px rgba(0,0,0,0.04); color:#CBD5E1; font-size:15px; font-weight:600; }
    .pm-empty-tab p { color:#6B7280; font-weight:700; margin:0; }
    .pm-go-dx-btn { display:flex; align-items:center; gap:7px; height:40px; padding:0 20px;
        background:linear-gradient(135deg,#1D9E75,#0D9488); color:#fff; border:none; border-radius:10px;
        font-family:"DM Sans",sans-serif; font-size:13px; font-weight:700; cursor:pointer; margin-top:6px; transition:all .2s; }
    .pm-go-dx-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(13,148,136,.35); }

    /* Images */
    .pm-images-section { animation:pm-fadeUp .5s cubic-bezier(.16,1,.3,1) .1s both; }
    .pm-type-group-head { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
    .pm-type-badge { font-size:11px; font-weight:800; padding:3px 11px; border-radius:20px; border:1px solid; }
    .pm-type-count { font-size:12px; color:#9CA3AF; font-weight:600; }
    .pm-type-line  { flex:1; height:1px; }
    .pm-images-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:14px; }
    .pm-img-card { background:#fff; border:1px solid rgba(0,0,0,0.07); border-radius:14px; overflow:hidden;
        transition:all .2s; box-shadow:0 1px 3px rgba(0,0,0,0.06); }
    .pm-img-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.1); }
    .pm-img-wrap { position:relative; aspect-ratio:4/3; background:#F1F5F9; overflow:hidden; }
    .pm-img-real { width:100%; height:100%; object-fit:cover; }
    .pm-img-noise { width:100%; height:100%; background:linear-gradient(135deg,#E2E8F0,#CBD5E1); }
    .pm-enhanced-badge { position:absolute; bottom:8px; right:8px; background:rgba(13,148,136,0.9); color:#fff;
        font-size:9px; font-weight:800; letter-spacing:.5px; padding:3px 8px; border-radius:5px; }
    .pm-img-meta { padding:12px; }
    .pm-img-type-tag { font-size:10px; font-weight:800; padding:2px 8px; border-radius:20px; border:1px solid; display:inline-block; margin-bottom:6px; }
    .pm-img-desc { font-size:12.5px; font-weight:600; color:#111827; margin-bottom:8px; }
    .pm-img-footer { display:flex; align-items:center; justify-content:space-between; }
    .pm-img-date { font-size:11px; color:#9CA3AF; }
    .pm-delete-confirm { display:flex; align-items:center; gap:6px; }
    .pm-delete-confirm-text { font-size:11.5px; color:#6B7280; font-weight:600; }
    .pm-delete-confirm-btns { display:flex; gap:4px; }
    .pm-del-yes { height:26px; padding:0 10px; background:#EF4444; color:#fff; border:none; border-radius:6px;
        font-size:11.5px; font-weight:700; cursor:pointer; font-family:"DM Sans",sans-serif; }
    .pm-del-no  { height:26px; padding:0 10px; background:#F9FAFB; color:#6B7280; border:1.5px solid rgba(0,0,0,0.1); border-radius:6px;
        font-size:11.5px; font-weight:700; cursor:pointer; font-family:"DM Sans",sans-serif; }
    .pm-del-img-btn { display:flex; align-items:center; gap:4px; height:26px; padding:0 10px; border:1.5px solid #FECDD3;
        border-radius:6px; background:#FFF1F2; color:#EF4444; font-family:"DM Sans",sans-serif; font-size:11.5px; font-weight:700; cursor:pointer; transition:all .15s; }
    .pm-del-img-btn:hover { background:#EF4444; color:#fff; }

    /* Diagnosis cards */
    .pm-dx-section { animation:pm-fadeUp .5s cubic-bezier(.16,1,.3,1) .1s both; }
    .pm-dx-list { display:flex; flex-direction:column; gap:16px; }
    .pm-dx-card { background:#fff; border:1px solid rgba(0,0,0,0.07); border-radius:16px; overflow:hidden;
        box-shadow:0 1px 3px rgba(0,0,0,0.06),0 8px 24px rgba(0,0,0,0.04); }
    .pm-dx-card-head { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid rgba(0,0,0,0.06); }
    .pm-dx-head-left  { display:flex; align-items:center; gap:12px; }
    .pm-dx-sev-icon   { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .pm-dx-voting { font-size:15px; font-weight:800; color:#111827; margin-bottom:1px; }
    .pm-dx-date   { font-size:11.5px; color:#9CA3AF; }
    .pm-dx-head-right { display:flex; align-items:center; gap:12px; }
    .pm-dx-sev-badge  { font-size:11px; font-weight:800; padding:4px 11px; border-radius:20px; border:1px solid; }
    .pm-dx-score      { font-size:22px; font-weight:900; letter-spacing:-0.5px; }
    .pm-dx-card-body  { padding:16px 20px; display:flex; flex-direction:column; gap:12px; }
    .pm-dx-meta-row   { display:flex; gap:0; border:1px solid rgba(0,0,0,0.06); border-radius:10px; overflow:hidden; }
    .pm-dx-meta       { flex:1; padding:10px 14px; border-right:1px solid rgba(0,0,0,0.06); }
    .pm-dx-meta:last-child { border-right:none; }
    .pm-dx-meta-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:#9CA3AF; margin-bottom:3px; }
    .pm-dx-meta-val   { font-size:13px; font-weight:700; color:#111827; }
    .pm-dx-score-bar  { display:flex; flex-direction:column; gap:4px; }
    .pm-dx-score-track { height:6px; background:#F1F5F9; border-radius:3px; overflow:hidden; }
    .pm-dx-score-fill  { height:100%; border-radius:3px; transition:width .6s cubic-bezier(.16,1,.3,1); }
    .pm-dx-score-label { font-size:10.5px; color:#9CA3AF; font-weight:600; }
    .pm-dx-models-row  { display:flex; gap:8px; flex-wrap:wrap; }
    .pm-dx-model-chip  { padding:8px 12px; background:#F9FAFB; border:1px solid rgba(0,0,0,0.07); border-radius:10px; flex:1; min-width:120px; }
    .pm-dx-model-name  { font-size:11px; font-weight:700; color:#6B7280; margin-bottom:3px; }
    .pm-dx-model-result { font-size:12.5px; font-weight:700; }
    .pm-dx-findings    { background:#F9FAFB; border:1px solid rgba(0,0,0,0.06); border-radius:10px; padding:12px 14px; }
    .pm-dx-findings-label { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.6px; color:#9CA3AF; margin-bottom:8px; }
    .pm-dx-finding-item   { display:flex; align-items:flex-start; gap:7px; margin-bottom:5px; font-size:12.5px; color:#374151; }
    .pm-dx-finding-dot    { width:5px; height:5px; border-radius:50%; flex-shrink:0; margin-top:5px; }
    .pm-dx-rec { display:flex; align-items:flex-start; gap:8px; padding:11px 14px; border-radius:10px; border:1px solid; font-size:12.5px; color:#374151; font-weight:500; line-height:1.55; }
    .pm-dx-actions { display:flex; justify-content:flex-end; }

    /* Modal */
    .pm-overlay { position:fixed; inset:0; background:rgba(15,23,42,0.4); backdrop-filter:blur(8px); z-index:500;
        display:flex; align-items:center; justify-content:center; padding:24px; }
    .pm-modal { background:#fff; border-radius:20px; width:100%; max-width:580px;
        border:1px solid rgba(0,0,0,0.08); box-shadow:0 24px 80px rgba(15,23,42,0.18);
        animation:pm-modal .25s cubic-bezier(.16,1,.3,1) both; overflow:hidden; max-height:90vh; overflow-y:auto; }
    .pm-modal-head { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 16px;
        border-bottom:1px solid rgba(0,0,0,0.06); position:sticky; top:0; background:#fff; z-index:1; }
    .pm-modal-title { display:flex; align-items:center; gap:10px; font-size:16px; font-weight:800; color:#111827; }
    .pm-modal-title-ic { width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,#1D9E75,#0D9488);
        display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; }
    .pm-modal-close { width:32px; height:32px; border-radius:8px; border:1.5px solid rgba(0,0,0,0.1);
        background:#F9FAFB; color:#6B7280; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; }
    .pm-modal-close:hover { background:#FFF1F2; color:#EF4444; border-color:#FECDD3; }
    .pm-modal-body { padding:24px; }
    .pm-form-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
    .pm-form-field { display:flex; flex-direction:column; gap:6px; }
    .pm-form-label { font-size:11px; font-weight:800; letter-spacing:.6px; text-transform:uppercase; color:#6B7280; }
    .pm-form-input,.pm-form-select { height:46px; padding:0 14px; box-sizing:border-box;
        border:1.5px solid rgba(0,0,0,0.1); border-radius:10px; font-family:"DM Sans",sans-serif;
        font-size:13.5px; color:#111827; background:#F9FAFB; outline:none; transition:all .2s; width:100%; }
    .pm-form-input::placeholder { color:#9CA3AF; }
    .pm-form-input:focus,.pm-form-select:focus { border-color:#0D9488; background:#fff; box-shadow:0 0 0 4px rgba(13,148,136,0.08); }
    .pm-form-error { font-size:13px; color:#EF4444; font-weight:600; margin-top:12px; }
    .pm-modal-foot { display:flex; justify-content:flex-end; gap:10px; padding:16px 24px;
        border-top:1px solid rgba(0,0,0,0.06); background:#F9FAFB; }
    .pm-cancel-btn { height:44px; padding:0 22px; border:1.5px solid rgba(0,0,0,0.1); border-radius:10px;
        background:#fff; font-family:"DM Sans",sans-serif; font-size:13.5px; font-weight:600; color:#6B7280; cursor:pointer; transition:all .15s; }
    .pm-cancel-btn:hover { background:#F1F5F9; }
    .pm-submit-btn { height:44px; padding:0 28px; background:linear-gradient(135deg,#1D9E75,#0D9488,#0F6E56);
        color:#fff; border:none; border-radius:10px; font-family:"DM Sans",sans-serif;
        font-size:13.5px; font-weight:700; cursor:pointer; transition:all .2s;
        box-shadow:0 4px 16px rgba(29,158,117,.28); }
    .pm-submit-btn:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(13,148,136,.4); }

    @media (max-width:1024px) {
        .pm-hero,.pm-detail-hero { padding:40px 28px 36px; }
        .pm-main { padding:28px 28px 80px; }
        .pm-detail-grid { grid-template-columns:repeat(2,1fr); }
    }
    @media (max-width:640px) {
        .pm-hero,.pm-detail-hero { padding:28px 16px 24px; }
        .pm-main { padding:20px 16px 60px; }
        .pm-profile-strip { flex-direction:column; align-items:flex-start; }
        .pm-profile-meta { margin-left:0; }
        .pm-detail-grid { grid-template-columns:1fr; }
        .pm-form-grid { grid-template-columns:1fr; }
    }
`;

// ── Inner component ──────────────────────────────────────────────────────────
function PatientManagementPage() {
    const router       = useRouter();
    const searchParams = useSearchParams();

    const [patients,        setPatients]        = useState<Patient[]>([]);
    const [loading,         setLoading]         = useState(true);
    const [currentView,     setCurrentView]     = useState<View>('list');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [activeTab,       setActiveTab]       = useState<Tab>('info');
    const [searchQuery,     setSearchQuery]     = useState('');
    const [activeFilter,    setActiveFilter]    = useState('all');
    const [showModal,       setShowModal]       = useState(false);
    const [form,            setForm]            = useState(EMPTY_FORM);
    const [formError,       setFormError]       = useState('');
    const [localImages,     setLocalImages]     = useState<MedicalImage[]>([]);
    const [localDiagnoses,  setLocalDiagnoses]  = useState<DiagnosisRecord[]>([]);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [editingStatus,   setEditingStatus]   = useState(false);
    const [confirmDxDelete, setConfirmDxDelete] = useState<string | null>(null);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('token');
            const res   = await fetch(`${BASE}/api/patients`, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            const result = await res.json();
            if (result.success) setPatients(result.data);
        } catch (e) { console.error('Network error:', e); }
        finally { setLoading(false); }
    };

    const addPatientToAPI = async (data: any) => {
        try {
            const token = localStorage.getItem('token');
            const res   = await fetch(`${BASE}/api/patients`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return await res.json();
        } catch { return { success: false, error: 'Network error' }; }
    };

    useEffect(() => {
        if (!localStorage.getItem('token')) { router.push('/log-in'); return; }
        fetchPatients();
    }, []);

    useEffect(() => {
        if (selectedPatient) {
            loadImagesForPatient(selectedPatient).then(setLocalImages);
            loadDiagnosesForPatient(selectedPatient).then(setLocalDiagnoses);
        } else {
            setLocalImages([]);
            setLocalDiagnoses([]);
        }
    }, [selectedPatient]);

    useEffect(() => {
        const patientId = searchParams.get('patientId');
        const tab       = (searchParams.get('tab') as Tab) || 'info';
        if (patientId && patients.length > 0) {
            const match = patients.find(p => p.id === patientId || p.mrn === patientId);
            if (match) { setSelectedPatient(match); setCurrentView('detail'); setActiveTab(tab); }
        }
    }, [searchParams, patients]);

    const filters = [
        { id: 'all',    label: 'All'    },
        { id: 'male',   label: 'Male'   },
        { id: 'female', label: 'Female' },
        { id: '0-18',   label: '0–18'   },
        { id: '19-40',  label: '19–40'  },
        { id: '40+',    label: '40+'    },
    ];

    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return patients.filter(p => {
            const matchSearch = !q ||
                `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
                p.mrn.toLowerCase().includes(q) || p.phone.includes(q);
            const matchFilter =
                activeFilter === 'all' ||
                (activeFilter === 'male'   && p.gender === 'Male')   ||
                (activeFilter === 'female' && p.gender === 'Female') ||
                getAgeGroup(p.age) === activeFilter;
            return matchSearch && matchFilter;
        });
    }, [patients, searchQuery, activeFilter]);

    async function handleAddPatient() {
        if (!form.firstName || !form.lastName || !form.mrn || !form.age || !form.phone) {
            setFormError('Please fill in all required fields.'); return;
        }
        const result = await addPatientToAPI(form);
        if (result.success) {
            setPatients(prev => [result.data, ...prev]);
            setShowModal(false); setSelectedPatient(result.data);
            setCurrentView('detail'); setActiveTab('info'); setFormError('');
        } else { setFormError(result.error || 'Failed to add patient'); }
    }

    const updatePatientStatus = async (patientId: string, newStatus: Status) => {
        setPatients(prev => prev.map(p => p.id === patientId ? { ...p, status: newStatus } : p));
        setSelectedPatient(prev => prev ? { ...prev, status: newStatus } : prev);
        setEditingStatus(false);
        try {
            const token = localStorage.getItem('token');
            await fetch(`${BASE}/api/patients/${patientId}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (e) { console.error('Failed to update status:', e); }
    };

    const handleDeleteImage = async (imageId: string) => {
        if (!selectedPatient) return;
        await deleteImageFromStorage(selectedPatient, imageId);
        setLocalImages(prev => prev.filter(i => i.id !== imageId));
        setConfirmDeleteId(null);
    };

    const handleDeleteDiagnosis = async (diagId: string) => {
        if (!selectedPatient) return;
        await deleteDiagnosis(selectedPatient.mrn, selectedPatient.id, diagId);
        setLocalDiagnoses(prev => prev.filter(d => d.id !== diagId));
        setConfirmDxDelete(null);
    };

    const openPatient = (p: Patient, tab: Tab = 'info') => {
        setSelectedPatient(p); setCurrentView('detail'); setActiveTab(tab);
    };
    const goBack = () => {
        setCurrentView('list'); setSelectedPatient(null);
        setActiveTab('info'); setConfirmDeleteId(null); setConfirmDxDelete(null);
    };

    /* ── DETAIL VIEW ── */
    if (currentView === 'detail' && selectedPatient) {
        const images = localImages;
        return (
            <>
            <style>{PM_STYLES}</style>
            <div className="pm-wrap">
                <Navbar />
                {/* Detail hero */}
                <div className="pm-detail-hero">
                    <div className="pm-hero-dots" />
                    <div className="pm-hero-blob" />
                    <div className="pm-hero-inner">
                        <button className="pm-hero-back" onClick={goBack}>
                            <ArrowLeft size={13} /> Patients
                        </button>
                        <div className="pm-hero-badge"><span className="pm-badge-dot" />Patient Records</div>
                        <h2 className="pm-hero-title">Patient <em>Details</em></h2>
                    </div>
                </div>
                <div className="pm-main">
                    <div className="pm-profile-strip">
                        <div className={`pm-avatar-lg ${selectedPatient.gender === 'Female' ? 'pm-avatar-f' : 'pm-avatar-m'}`}>
                            {getInitials(selectedPatient.firstName, selectedPatient.lastName)}
                        </div>
                        <div className="pm-profile-info">
                            <h2 className="pm-detail-name">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                            <p className="pm-detail-mrn">{selectedPatient.mrn} · {selectedPatient.id}</p>
                            <span className={selectedPatient.status === 'Active' ? 'pm-badge-active' : 'pm-badge-inactive'}>
                                {selectedPatient.status}
                            </span>
                        </div>
                        <div className="pm-profile-meta">
                            {[
                                { label: 'Age',       val: `${selectedPatient.age}` },
                                { label: 'Gender',    val: selectedPatient.gender   },
                                { label: 'Scans',     val: String(images.length)    },
                                { label: 'Diagnoses', val: String(localDiagnoses.length) },
                            ].map(m => (
                                <div key={m.label} className="pm-meta-chip">
                                    <span className="pm-meta-label">{m.label}</span>
                                    <span className="pm-meta-val">{m.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pm-tabs">
                        {([
                            { id: 'info',      label: 'Personal Info'  },
                            { id: 'images',    label: 'Medical Images' },
                            { id: 'diagnosis', label: 'AI Diagnoses'   },
                            { id: 'reports',   label: 'Reports'        },
                        ] as { id: Tab; label: string }[]).map(t => (
                            <button key={t.id}
                                    className={`pm-tab${activeTab === t.id ? ' pm-tab-active' : ''}`}
                                    onClick={() => setActiveTab(t.id)}>
                                {t.label}
                                {t.id === 'diagnosis' && localDiagnoses.length > 0 && (
                                    <span className="pm-tab-count">{localDiagnoses.length}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* INFO TAB */}
                    {activeTab === 'info' && (
                        <div className="pm-detail-card">
                            <div className="pm-detail-grid">
                                {[
                                    { label: 'Age',        value: `${selectedPatient.age} years`        },
                                    { label: 'Gender',     value: selectedPatient.gender                },
                                    { label: 'Phone',      value: selectedPatient.phone                 },
                                    { label: 'Email',      value: selectedPatient.email     || '—'      },
                                    { label: 'Condition',  value: selectedPatient.condition || '—'      },
                                    { label: 'Last Visit', value: formatDate(selectedPatient.lastVisit) },
                                ].map(item => (
                                    <div key={item.label} className="pm-detail-item">
                                        <div className="pm-detail-label">{item.label}</div>
                                        <div className="pm-detail-value">{item.value}</div>
                                    </div>
                                ))}
                                <div className="pm-detail-item">
                                    <div className="pm-detail-label">Status</div>
                                    {editingStatus ? (
                                        <div className="pm-status-edit-row">
                                            {(['Active', 'Inactive'] as Status[]).map(s => (
                                                <button key={s} className="pm-status-opt"
                                                        style={selectedPatient.status === s ? (s === 'Active'
                                                            ? { background:'#F0FDF4', borderColor:'#86EFAC', color:'#15803D' }
                                                            : { background:'#FFF1F2', borderColor:'#FECDD3', color:'#DC2626' }) : {}}
                                                        onClick={() => updatePatientStatus(selectedPatient.id, s)}>
                                                    {s}
                                                </button>
                                            ))}
                                            <button className="pm-status-cancel" onClick={() => setEditingStatus(false)}>Cancel</button>
                                        </div>
                                    ) : (
                                        <div className="pm-status-view-row">
                                            <span className={selectedPatient.status === 'Active' ? 'pm-badge-active' : 'pm-badge-inactive'}>
                                                {selectedPatient.status}
                                            </span>
                                            <button className="pm-status-edit-btn" onClick={() => setEditingStatus(true)}>Change</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* IMAGES TAB */}
                    {activeTab === 'images' && (
                        <div className="pm-images-section">
                            {images.length === 0 ? (
                                <div className="pm-empty-tab">
                                    <Scan size={32} color="#CBD5E1" />
                                    <p>No ultrasound images yet</p>
                                    <span style={{ fontSize:13, color:'#94a3b8' }}>
                                        Go to Image Enhancement to upload and enhance ultrasound scans
                                    </span>
                                </div>
                            ) : (() => {
                                const st = SCAN_TYPE_STYLES['Ultrasound'];
                                return (
                                    <div>
                                        <div className="pm-type-group-head">
                                            <span className="pm-type-badge" style={{ background:st.bg, color:st.color, borderColor:st.border }}>Ultrasound</span>
                                            <span className="pm-type-count">{images.length} scan{images.length > 1 ? 's' : ''}</span>
                                            <div className="pm-type-line" style={{ flex:1, height:1, background:st.border }} />
                                        </div>
                                        <div className="pm-images-grid">
                                            {images.map(img => (
                                                <div key={img.id} className="pm-img-card">
                                                    <div className="pm-img-wrap">
                                                        {img.enhancedSrc || img.originalSrc ? (
                                                            <img src={img.enhancedSrc || img.originalSrc} className="pm-img-real" alt={img.label} />
                                                        ) : (
                                                            <div className="pm-img-noise" />
                                                        )}
                                                        {img.enhanced && <div className="pm-enhanced-badge">Enhanced</div>}
                                                    </div>
                                                    <div className="pm-img-meta">
                                                        <span className="pm-img-type-tag" style={{ background:st.bg, color:st.color, borderColor:st.border }}>Ultrasound</span>
                                                        <div className="pm-img-desc">{img.label}</div>
                                                        <div className="pm-img-footer">
                                                            <span className="pm-img-date">{formatDate(img.date)}</span>
                                                            {confirmDeleteId === img.id ? (
                                                                <div className="pm-delete-confirm">
                                                                    <span className="pm-delete-confirm-text">Delete?</span>
                                                                    <div className="pm-delete-confirm-btns">
                                                                        <button className="pm-del-yes" onClick={() => handleDeleteImage(img.id)}>Yes</button>
                                                                        <button className="pm-del-no" onClick={() => setConfirmDeleteId(null)}>No</button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button className="pm-del-img-btn" onClick={() => setConfirmDeleteId(img.id)}>
                                                                    <Trash2 size={13} /> Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* DIAGNOSIS TAB */}
                    {activeTab === 'diagnosis' && (
                        <div className="pm-dx-section">
                            {localDiagnoses.length === 0 ? (
                                <div className="pm-empty-tab">
                                    <Brain size={32} color="#CBD5E1" />
                                    <p>No AI diagnoses yet</p>
                                    <span style={{ fontSize:13, color:'#94a3b8' }}>
                                        Run a diagnosis from the AI Diagnosis page and select this patient
                                    </span>
                                    <button className="pm-go-dx-btn" onClick={() => router.push('/ai-diagnosis')}>
                                        <Brain size={14} /> Go to AI Diagnosis
                                    </button>
                                </div>
                            ) : (
                                <div className="pm-dx-list">
                                    {localDiagnoses.map((dx) => {
                                        const sev = SEVERITY_META[dx.severity] ?? SEVERITY_META.Moderate;
                                        const SevIcon = dx.severity === 'High' ? AlertTriangle : dx.severity === 'Moderate' ? Minus : CheckCircle2;
                                        return (
                                            <div key={dx.id} className="pm-dx-card">
                                                <div className="pm-dx-card-head" style={{ borderBottomColor:sev.border, background:sev.bg }}>
                                                    <div className="pm-dx-head-left">
                                                        <div className="pm-dx-sev-icon" style={{ background:sev.color+'18', border:`1px solid ${sev.border}` }}>
                                                            <SevIcon size={14} color={sev.color} />
                                                        </div>
                                                        <div>
                                                            <div className="pm-dx-voting" style={{ color:sev.color }}>{dx.votingResult}</div>
                                                            <div className="pm-dx-date">{formatDate(dx.date)} · {formatTime(dx.date)}</div>
                                                        </div>
                                                    </div>
                                                    <div className="pm-dx-head-right">
                                                        <span className="pm-dx-sev-badge" style={{ background:sev.color+'18', color:sev.color, borderColor:sev.border }}>
                                                            {sev.icon} {dx.severity} Risk
                                                        </span>
                                                        <div className="pm-dx-score" style={{ color:sev.color }}>
                                                            {dx.malignancyScore}<span style={{ fontSize:12, fontWeight:500, color:'#94a3b8' }}>/100</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="pm-dx-card-body">
                                                    <div className="pm-dx-meta-row">
                                                        <div className="pm-dx-meta"><div className="pm-dx-meta-label">Mode</div><div className="pm-dx-meta-val">{MODE_LABELS[dx.mode] ?? dx.mode}</div></div>
                                                        <div className="pm-dx-meta"><div className="pm-dx-meta-label">Model</div><div className="pm-dx-meta-val">{dx.modelName}</div></div>
                                                        <div className="pm-dx-meta"><div className="pm-dx-meta-label">Confidence</div><div className="pm-dx-meta-val" style={{ color:sev.color }}>{dx.confidence}%</div></div>
                                                    </div>
                                                    <div className="pm-dx-score-bar">
                                                        <div className="pm-dx-score-track">
                                                            <div className="pm-dx-score-fill" style={{ width:`${dx.malignancyScore}%`, background:sev.color }} />
                                                        </div>
                                                        <span className="pm-dx-score-label">Malignancy Score</span>
                                                    </div>
                                                    <div className="pm-dx-models-row">
                                                        {dx.topModels.map((m, i) => (
                                                            <div key={i} className="pm-dx-model-chip" style={{ opacity:m.available ? 1 : 0.45 }}>
                                                                <div className="pm-dx-model-name">{m.name}</div>
                                                                <div className="pm-dx-model-result" style={{ color:m.available ? sev.color : '#94a3b8' }}>
                                                                    {m.available ? `${m.result} · ${m.confidence}%` : 'N/A'}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="pm-dx-findings">
                                                        <div className="pm-dx-findings-label">Key Findings</div>
                                                        {dx.findings.slice(0, 4).map((f, i) => (
                                                            <div key={i} className="pm-dx-finding-item">
                                                                <div className="pm-dx-finding-dot" style={{ background:sev.color }} />
                                                                <span>{f}</span>
                                                            </div>
                                                        ))}
                                                        {dx.findings.length > 4 && (
                                                            <div className="pm-dx-finding-item" style={{ color:'#94a3b8' }}>+{dx.findings.length - 4} more findings</div>
                                                        )}
                                                    </div>
                                                    <div className="pm-dx-rec" style={{ borderColor:sev.border, background:sev.bg }}>
                                                        <CheckCircle2 size={13} color={sev.color} style={{ flexShrink:0, marginTop:2 }} />
                                                        <span>{dx.recommendation}</span>
                                                    </div>
                                                    <div className="pm-dx-actions">
                                                        {confirmDxDelete === dx.id ? (
                                                            <div className="pm-delete-confirm">
                                                                <span className="pm-delete-confirm-text">Delete this diagnosis?</span>
                                                                <div className="pm-delete-confirm-btns">
                                                                    <button className="pm-del-yes" onClick={() => handleDeleteDiagnosis(dx.id)}>Yes, delete</button>
                                                                    <button className="pm-del-no" onClick={() => setConfirmDxDelete(null)}>Cancel</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button className="pm-del-img-btn" onClick={() => setConfirmDxDelete(dx.id)}>
                                                                <Trash2 size={13} /> Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div className="pm-empty-tab">
                            <FileText size={32} color="#CBD5E1" />
                            <p>No reports yet</p>
                            <span style={{ fontSize:13, color:'#94a3b8' }}>
                                Reports will appear here after AI diagnosis is complete
                            </span>
                        </div>
                    )}
                </div>
            </div>
            </>
        );
    }

    /* ── LIST VIEW ── */
    return (
        <>
        <style>{PM_STYLES}</style>
        <div className="pm-wrap">
            <Navbar />
            {/* Hero */}
            <div className="pm-hero">
                <div className="pm-hero-dots" />
                <div className="pm-hero-blob" />
                <div className="pm-hero-inner">
                    <div className="pm-hero-badge"><span className="pm-badge-dot" />Patient Records</div>
                    <div className="pm-hero-row">
                        <h1 className="pm-hero-title">Patient <em>Management</em></h1>
                        <button className="pm-add-btn" onClick={() => { setForm(EMPTY_FORM); setShowModal(true); setFormError(''); }}>
                            <UserPlus size={15} /> Add Patient
                        </button>
                    </div>
                    <div className="pm-hero-pills">
                        {[
                            { val: String(patients.length), lbl:'Total Patients' },
                            { val: 'Real-time',             lbl:'Data Sync'      },
                            { val: 'AI Tracked',            lbl:'Diagnostics'    },
                        ].map(p => (
                            <div key={p.lbl} className="pm-hero-pill">
                                <span className="pm-pill-val">{p.val}</span>
                                <span className="pm-pill-lbl">{p.lbl}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pm-main">
                <div className="pm-search-card">
                    <div className="pm-search-wrap">
                        <Search size={15} className="pm-search-icon" />
                        <input className="pm-search-input" placeholder="Search by name, MRN, or phone..."
                               value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="pm-filter-row">
                        {filters.map(f => (
                            <button key={f.id}
                                    className={`pm-filter-btn${activeFilter === f.id ? ' pm-filter-active' : ''}`}
                                    onClick={() => setActiveFilter(f.id)}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pm-table-card">
                    <div className="pm-table-head">
                        <span className="pm-table-count">{filtered.length} patient{filtered.length !== 1 ? 's' : ''}</span>
                    </div>
                    {loading ? (
                        <div className="pm-empty"><p>Loading patients...</p></div>
                    ) : filtered.length === 0 ? (
                        <div className="pm-empty">
                            <p>No patients found</p>
                            <p className="pm-empty-sub">Try a different search or add a new patient</p>
                        </div>
                    ) : (
                        <table className="pm-table">
                            <thead>
                            <tr>
                                <th>Patient</th><th>MRN</th><th>Age</th><th>Gender</th>
                                <th>Condition</th><th>Status</th><th>Last Visit</th><th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.map(p => (
                                <tr key={p.id} className="pm-table-row" onClick={() => openPatient(p)}>
                                    <td>
                                        <div className="pm-patient-cell">
                                            <div className={`pm-avatar-sm ${p.gender === 'Female' ? 'pm-avatar-f' : 'pm-avatar-m'}`}>
                                                {getInitials(p.firstName, p.lastName)}
                                            </div>
                                            <div>
                                                <div className="pm-p-name">{p.firstName} {p.lastName}</div>
                                                <div className="pm-p-id">{p.mrn}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="pm-muted">{p.mrn}</td>
                                    <td className="pm-muted">{p.age}</td>
                                    <td className="pm-muted">{p.gender}</td>
                                    <td className="pm-muted">{p.condition || '—'}</td>
                                    <td>
                                        <span className={p.status === 'Active' ? 'pm-badge-active' : 'pm-badge-inactive'}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="pm-muted">{p.lastVisit ? formatDate(p.lastVisit) : '—'}</td>
                                    <td>
                                        <button className="pm-view-btn" onClick={e => { e.stopPropagation(); openPatient(p); }}>
                                            View →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                    <div className="pm-table-footer">
                        Showing {filtered.length} of {patients.length} patients
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="pm-overlay" onClick={() => setShowModal(false)}>
                    <div className="pm-modal" onClick={e => e.stopPropagation()}>
                        <div className="pm-modal-head">
                            <div className="pm-modal-title">
                                <div className="pm-modal-title-ic"><UserPlus size={18} /></div>
                                Add New Patient
                            </div>
                            <button className="pm-modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <div className="pm-modal-body">
                            <div className="pm-form-grid">
                                {([
                                    { k: 'firstName', label: 'First Name', placeholder: 'John',         type: 'text'   },
                                    { k: 'lastName',  label: 'Last Name',  placeholder: 'Doe',          type: 'text'   },
                                    { k: 'mrn',       label: 'MRN',        placeholder: 'MRN-001',      type: 'text'   },
                                    { k: 'age',       label: 'Age',        placeholder: '35',           type: 'number' },
                                    { k: 'phone',     label: 'Phone',      placeholder: '+966 5xx xxx', type: 'text'   },
                                    { k: 'email',     label: 'Email',      placeholder: 'optional',     type: 'email'  },
                                ] as const).map(f => (
                                    <div key={f.k} className="pm-form-field">
                                        <label className="pm-form-label">{f.label}</label>
                                        <input className="pm-form-input" type={f.type} placeholder={f.placeholder}
                                               value={(form as any)[f.k]}
                                               onChange={e => setForm(prev => ({ ...prev, [f.k]: e.target.value }))} />
                                    </div>
                                ))}
                                <div className="pm-form-field">
                                    <label className="pm-form-label">Gender</label>
                                    <select className="pm-form-select" value={form.gender}
                                            onChange={e => setForm(prev => ({ ...prev, gender: e.target.value as Gender }))}>
                                        <option>Male</option><option>Female</option>
                                    </select>
                                </div>
                                <div className="pm-form-field">
                                    <label className="pm-form-label">Condition</label>
                                    <input className="pm-form-input" type="text" placeholder="e.g. Thyroid Nodule"
                                           value={form.condition}
                                           onChange={e => setForm(prev => ({ ...prev, condition: e.target.value }))} />
                                </div>
                            </div>
                            {formError && <p className="pm-form-error">{formError}</p>}
                        </div>
                        <div className="pm-modal-foot">
                            <button className="pm-cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="pm-submit-btn" onClick={handleAddPatient}>Add Patient</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
}

// ── Wrapper with Suspense (required for useSearchParams in Next.js) ──────────
export default function Page() {
    return (
        <Suspense fallback={<div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>Loading...</div>}>
            <PatientManagementPage />
        </Suspense>
    );
}

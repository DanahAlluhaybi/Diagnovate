"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";
import { X } from "lucide-react";
import Navbar from "@/components/Navbar";

type Gender = "Male" | "Female";
type Status = "Active" | "Inactive";
type View = "list" | "detail";

interface Patient {
    id: string;
    mrn: string;
    firstName: string;
    lastName: string;
    age: number;
    gender: Gender;
    phone: string;
    email: string;
    lastVisit: string;
    status: Status;
    condition: string;
}

const EMPTY_FORM = {
    firstName: "", lastName: "", mrn: "", age: "",
    gender: "Male" as Gender, phone: "", email: "",
    condition: "", status: "Active" as Status,
};

function getAgeGroup(age: number) {
    if (age <= 18) return "0-18";
    if (age <= 40) return "19-40";
    return "40+";
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric"
    });
}

function getInitials(first: string, last: string) {
    return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

interface ModalProps {
    form: typeof EMPTY_FORM;
    formError: string;
    onChange: (field: string, value: string) => void;
    onSave: () => void;
    onClose: () => void;
}

function AddPatientModal({ form, formError, onChange, onSave, onClose }: ModalProps) {
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Add New Patient</h3>
                    <button className={styles.modalClose} onClick={onClose}><X size={20} /></button>
                </div>

                {formError && <div className={styles.formError}>{formError}</div>}

                <div className={styles.formGrid}>
                    {[
                        { field: "firstName", label: "First Name *", placeholder: "First name",          type: "text"   },
                        { field: "lastName",  label: "Last Name *",  placeholder: "Last name",           type: "text"   },
                        { field: "mrn",       label: "MRN *",        placeholder: "e.g. MRN-10027",      type: "text"   },
                        { field: "age",       label: "Age *",        placeholder: "Age",                 type: "number" },
                        { field: "phone",     label: "Phone *",      placeholder: "+966 50 000 0000",    type: "text"   },
                        { field: "email",     label: "Email",        placeholder: "patient@email.com",   type: "email"  },
                        { field: "condition", label: "Condition",    placeholder: "e.g. Hypothyroidism", type: "text"   },
                    ].map((item) => (
                        <div key={item.field} className={styles.formGroup}>
                            <label className={styles.formLabel}>{item.label}</label>
                            <input
                                className={styles.formInput}
                                type={item.type}
                                placeholder={item.placeholder}
                                value={(form as any)[item.field]}
                                onChange={(e) => onChange(item.field, e.target.value)}
                            />
                        </div>
                    ))}

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Gender</label>
                        <select className={styles.formInput} value={form.gender} onChange={(e) => onChange("gender", e.target.value)}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Status</label>
                        <select className={styles.formInput} value={form.status} onChange={(e) => onChange("status", e.target.value)}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className={styles.modalActions}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button className={styles.addButton} onClick={onSave}>
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                            <path d="M10 4V16M4 10H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Save Patient
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PatientManagementPage() {
    const router = useRouter();
    const [patients,         setPatients]         = useState<Patient[]>([]);
    const [searchQuery,      setSearchQuery]       = useState("");
    const [activeFilter,     setActiveFilter]      = useState("all");
    const [currentView,      setCurrentView]       = useState<View>("list");
    const [selectedPatient,  setSelectedPatient]   = useState<Patient | null>(null);
    const [form,             setForm]              = useState(EMPTY_FORM);
    const [formError,        setFormError]         = useState("");
    const [showModal,        setShowModal]         = useState(false);
    const [loading,          setLoading]           = useState(false);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch('http://localhost:5000/api/patients', {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            const result = await response.json();
            if (result.success) setPatients(result.data);
        } catch (error) {
            console.error('Network error:', error);
        } finally {
            setLoading(false);
        }
    };

    const addPatientToAPI = async (patientData: any) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch('http://localhost:5000/api/patients', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(patientData)
            });
            return await response.json();
        } catch { return { success: false, error: 'Network error' }; }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/log-in"); return; }
        fetchPatients();
    }, []);

    const handleFormChange = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

    const filters = [
        { id: "all",    label: "All"    },
        { id: "male",   label: "Male"   },
        { id: "female", label: "Female" },
        { id: "0-18",   label: "0-18"   },
        { id: "19-40",  label: "19-40"  },
        { id: "40+",    label: "40+"    },
    ];

    const filteredPatients = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return patients.filter((p) => {
            const matchSearch = !q ||
                `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
                p.mrn.toLowerCase().includes(q) ||
                p.phone.includes(q);
            const matchFilter =
                activeFilter === "all" ||
                (activeFilter === "male"   && p.gender === "Male")   ||
                (activeFilter === "female" && p.gender === "Female") ||
                getAgeGroup(p.age) === activeFilter;
            return matchSearch && matchFilter;
        });
    }, [patients, searchQuery, activeFilter]);

    async function handleAddPatient() {
        if (!form.firstName || !form.lastName || !form.mrn || !form.age || !form.phone) {
            setFormError("Please fill in all required fields.");
            return;
        }
        const result = await addPatientToAPI(form);
        if (result.success) {
            setPatients(prev => [result.data, ...prev]);
            setShowModal(false);
            setSelectedPatient(result.data);
            setCurrentView("detail");
            setFormError("");
        } else {
            setFormError(result.error || 'Failed to add patient');
        }
    }

    // ── Detail View ──
    if (currentView === "detail" && selectedPatient) {
        return (
            <div className={styles.container}>
                <Navbar />
                <div className={styles.pageContent}>
                    <div className={styles.pageTopBar}>
                        <button className={styles.backIconButton} onClick={() => { setCurrentView("list"); setSelectedPatient(null); }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M15 10H5M5 10L9 6M5 10L9 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        <h2 className={styles.pageTitle}>Patient Information</h2>
                    </div>
                    <div className={styles.detailCard}>
                        <div className={styles.detailProfile}>
                            <div className={`${styles.avatarLarge} ${selectedPatient.gender === "Female" ? styles.avatarFemale : styles.avatarMale}`}>
                                {getInitials(selectedPatient.firstName, selectedPatient.lastName)}
                            </div>
                            <div className={styles.detailProfileInfo}>
                                <h2 className={styles.detailName}>{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                                <p className={styles.detailMrn}>{selectedPatient.mrn} · {selectedPatient.id}</p>
                                <span className={`${styles.statusBadge} ${selectedPatient.status === "Active" ? styles.statusActive : styles.statusInactive}`}>
                                    {selectedPatient.status}
                                </span>
                            </div>
                        </div>
                        <div className={styles.detailGrid}>
                            {[
                                { label: "Age",        value: `${selectedPatient.age} years`     },
                                { label: "Gender",     value: selectedPatient.gender              },
                                { label: "Phone",      value: selectedPatient.phone               },
                                { label: "Email",      value: selectedPatient.email || "—"        },
                                { label: "Condition",  value: selectedPatient.condition || "—"    },
                                { label: "Last Visit", value: formatDate(selectedPatient.lastVisit) },
                            ].map((item) => (
                                <div key={item.label} className={styles.detailItem}>
                                    <span className={styles.detailLabel}>{item.label}</span>
                                    <span className={styles.detailValue}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                        <button className={styles.backBtn} onClick={() => { setCurrentView("list"); setSelectedPatient(null); }}>
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M11 4L5 9L11 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Back to Patients List
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── List View ──
    return (
        <div className={styles.container}>
            <Navbar />

            {showModal && (
                <AddPatientModal
                    form={form}
                    formError={formError}
                    onChange={handleFormChange}
                    onSave={handleAddPatient}
                    onClose={() => { setShowModal(false); setFormError(""); }}
                />
            )}

            <div className={styles.pageContent}>
                <div className={styles.pageTopBar}>
                    <a href="/dashboard" className={styles.backBtn}>← Back to Dashboard</a>
                    <h2 className={styles.pageTitle}>Patient Management</h2>
                </div>

                <div className={styles.searchSection}>
                    <div className={styles.searchWrapper}>
                        <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19 19L15 15" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name, MRN, or phone..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className={styles.clearSearch} onClick={() => setSearchQuery("")}>✕</button>
                        )}
                    </div>
                    <div className={styles.filters}>
                        {filters.map((filter) => (
                            <button
                                key={filter.id}
                                className={`${styles.filterBtn} ${activeFilter === filter.id ? styles.active : ""}`}
                                onClick={() => setActiveFilter(filter.id)}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.addSection}>
                    <button className={styles.addButton} onClick={() => { setForm(EMPTY_FORM); setFormError(""); setShowModal(true); }}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 4V16M4 10H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Add New Patient
                    </button>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>Patient</th><th>MRN</th><th>Age / Gender</th>
                            <th>Contact</th><th>Last Visit</th><th>Status</th><th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={7}><div className={styles.emptyState}><p>Loading patients...</p></div></td></tr>
                        ) : filteredPatients.length > 0 ? (
                            filteredPatients.map((patient) => (
                                <tr key={patient.id} className={styles.patientRow} onClick={() => { setSelectedPatient(patient); setCurrentView("detail"); }}>
                                    <td>
                                        <div className={styles.patientCell}>
                                            <div className={`${styles.avatar} ${patient.gender === "Female" ? styles.avatarFemale : styles.avatarMale}`}>
                                                {getInitials(patient.firstName, patient.lastName)}
                                            </div>
                                            <div>
                                                <div className={styles.patientName}>{patient.firstName} {patient.lastName}</div>
                                                <div className={styles.patientId}>{patient.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.mrnText}>{patient.mrn}</td>
                                    <td className={styles.infoText}>{patient.age} / {patient.gender}</td>
                                    <td className={styles.infoText}>{patient.phone}</td>
                                    <td className={styles.infoText}>{formatDate(patient.lastVisit)}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${patient.status === "Active" ? styles.statusActive : styles.statusInactive}`}>
                                            {patient.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className={styles.viewIconBtn} onClick={(e) => { e.stopPropagation(); setSelectedPatient(patient); setCurrentView("detail"); }}>
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                                <path d="M2 9C2 9 4 3 9 3C14 3 16 9 16 9C16 9 14 15 9 15C4 15 2 9 2 9Z" stroke="#0099cc" strokeWidth="1.5"/>
                                                <circle cx="9" cy="9" r="3" stroke="#0099cc" strokeWidth="1.5"/>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7}>
                                    <div className={styles.emptyState}>
                                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                            <circle cx="24" cy="24" r="20" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4"/>
                                            <path d="M24 16V24M24 32H24.02" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                        <p>{searchQuery ? `No patients found for "${searchQuery}"` : "No patients yet"}</p>
                                        <p className={styles.emptyStateSub}>Add a new patient to get started</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                    {filteredPatients.length > 0 && (
                        <div className={styles.tableFooter}>
                            Showing {filteredPatients.length} of {patients.length} patients
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
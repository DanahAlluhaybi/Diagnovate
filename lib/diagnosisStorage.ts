// lib/diagnosisStorage.ts
// يحفظ نتائج التشخيص في IndexedDB بنفس pattern الصور

const DB_NAME    = 'diagnovate_images';   // نفس الـ DB عشان نفتح connection واحد
const DB_VERSION = 2;                     // رفعنا الـ version عشان نضيف store جديد
const STORE      = 'patient_diagnoses';

export interface DiagnosisRecord {
    id          : string;   // uuid
    date        : string;   // ISO string
    mode        : 'image' | 'lab' | 'both';
    modelName   : string;
    votingResult: string;
    confidence  : number;
    severity    : 'Low' | 'Moderate' | 'High';
    malignancyScore: number;
    recommendation : string;
    findings    : string[];
    topModels   : { name: string; result: string; confidence: number; available: boolean }[];
}

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
            const db = req.result;
            // نفس الـ store القديم — لا تمسحه
            if (!db.objectStoreNames.contains('patient_images')) {
                db.createObjectStore('patient_images');
            }
            // الـ store الجديد للتشخيصات
            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE);
            }
        };

        req.onsuccess = () => resolve(req.result);
        req.onerror   = () => reject(req.error);
    });
}

/** يحفظ تشخيص جديد للمريض (by mrn) */
export async function saveDiagnosis(mrn: string, record: DiagnosisRecord): Promise<void> {
    const db  = await openDB();
    const tx  = db.transaction(STORE, 'readwrite');
    const st  = tx.objectStore(STORE);

    const existing: DiagnosisRecord[] = await new Promise((res, rej) => {
        const r = st.get(mrn);
        r.onsuccess = () => res(r.result || []);
        r.onerror   = () => rej(r.error);
    });

    // أحدث التشخيصات فوق
    const updated = [record, ...existing];

    await new Promise<void>((res, rej) => {
        const r = st.put(updated, mrn);
        r.onsuccess = () => res();
        r.onerror   = () => rej(r.error);
    });

    db.close();
}

/** يجيب كل تشخيصات المريض */
export async function loadDiagnoses(mrn: string, patientId?: string): Promise<DiagnosisRecord[]> {
    const db = await openDB();
    const tx = db.transaction(STORE, 'readonly');
    const st = tx.objectStore(STORE);

    const fromMrn: DiagnosisRecord[] = await new Promise((res, rej) => {
        const r = st.get(mrn);
        r.onsuccess = () => res(r.result || []);
        r.onerror   = () => rej(r.error);
    });

    let fromId: DiagnosisRecord[] = [];
    if (patientId && patientId !== mrn) {
        fromId = await new Promise((res, rej) => {
            const r = st.get(patientId);
            r.onsuccess = () => res(r.result || []);
            r.onerror   = () => rej(r.error);
        });
    }

    db.close();

    // Deduplicate by id
    const merged = [...fromMrn, ...fromId];
    return merged.filter((d, idx, arr) => arr.findIndex(x => x.id === d.id) === idx);
}

/** يحذف تشخيص معين */
export async function deleteDiagnosis(mrn: string, patientId: string, diagId: string): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(STORE, 'readwrite');
    const st = tx.objectStore(STORE);

    for (const key of [mrn, patientId]) {
        if (!key) continue;
        const existing: DiagnosisRecord[] = await new Promise((res, rej) => {
            const r = st.get(key);
            r.onsuccess = () => res(r.result || []);
            r.onerror   = () => rej(r.error);
        });
        const filtered = existing.filter(d => d.id !== diagId);
        await new Promise<void>((res, rej) => {
            const r = st.put(filtered, key);
            r.onsuccess = () => res();
            r.onerror   = () => rej(r.error);
        });
    }

    db.close();
}
/** Persists AI diagnosis records to IndexedDB, keyed by patient MRN. */

const DB_NAME    = 'diagnovate_images';
const DB_VERSION = 2;
const STORE      = 'patient_diagnoses';

export interface DiagnosisRecord {
    id          : string;
    date        : string;
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

        req.onupgradeneeded = () => {
            const db = req.result;
            // Preserve the existing image store from DB version 1.
            if (!db.objectStoreNames.contains('patient_images')) {
                db.createObjectStore('patient_images');
            }
            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE);
            }
        };

        req.onsuccess = () => resolve(req.result);
        req.onerror   = () => reject(req.error);
    });
}

/** Prepends a new diagnosis record for the patient, keyed by MRN. */
export async function saveDiagnosis(mrn: string, record: DiagnosisRecord): Promise<void> {
    const db  = await openDB();
    const tx  = db.transaction(STORE, 'readwrite');
    const st  = tx.objectStore(STORE);

    const existing: DiagnosisRecord[] = await new Promise((res, rej) => {
        const r = st.get(mrn);
        r.onsuccess = () => res(r.result || []);
        r.onerror   = () => rej(r.error);
    });

    const updated = [record, ...existing];

    await new Promise<void>((res, rej) => {
        const r = st.put(updated, mrn);
        r.onsuccess = () => res();
        r.onerror   = () => rej(r.error);
    });

    db.close();
}

/** Loads all diagnosis records for a patient, merging MRN and ID keys and deduplicating by record ID. */
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

    const merged = [...fromMrn, ...fromId];
    return merged.filter((d, idx, arr) => arr.findIndex(x => x.id === d.id) === idx);
}

/** Removes a specific diagnosis record from all storage keys associated with the patient. */
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

// lib/imageStorage.ts
// استخدم IndexedDB بدل localStorage عشان الصور الكبيرة

const DB_NAME    = 'diagnovate_images';
const DB_VERSION = 1;
const STORE      = 'patient_images';

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE)) {
                // key = mrn, value = array of images
                db.createObjectStore(STORE);
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror   = () => reject(req.error);
    });
}

export async function saveImage(mrn: string, image: object): Promise<void> {
    const db  = await openDB();
    const tx  = db.transaction(STORE, 'readwrite');
    const st  = tx.objectStore(STORE);

    // Load existing images for this mrn
    const existing: any[] = await new Promise((res, rej) => {
        const r = st.get(mrn);
        r.onsuccess = () => res(r.result || []);
        r.onerror   = () => rej(r.error);
    });

    const updated = [image, ...existing];
    await new Promise<void>((res, rej) => {
        const r = st.put(updated, mrn);
        r.onsuccess = () => res();
        r.onerror   = () => rej(r.error);
    });
    db.close();
}

export async function loadImages(mrn: string, patientId?: string): Promise<any[]> {
    const db = await openDB();
    const tx = db.transaction(STORE, 'readonly');
    const st = tx.objectStore(STORE);

    const fromMrn: any[] = await new Promise((res, rej) => {
        const r = st.get(mrn);
        r.onsuccess = () => res(r.result || []);
        r.onerror   = () => rej(r.error);
    });

    let fromId: any[] = [];
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
    return merged.filter((img, idx, arr) => arr.findIndex(x => x.id === img.id) === idx);
}

export async function deleteImage(mrn: string, patientId: string, imageId: string): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(STORE, 'readwrite');
    const st = tx.objectStore(STORE);

    for (const key of [mrn, patientId]) {
        if (!key) continue;
        const existing: any[] = await new Promise((res, rej) => {
            const r = st.get(key);
            r.onsuccess = () => res(r.result || []);
            r.onerror   = () => rej(r.error);
        });
        const filtered = existing.filter(i => i.id !== imageId);
        await new Promise<void>((res, rej) => {
            const r = st.put(filtered, key);
            r.onsuccess = () => res();
            r.onerror   = () => rej(r.error);
        });
    }
    db.close();
}
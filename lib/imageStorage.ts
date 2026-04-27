// Image storage utilities — loads and deletes patient scan images from localStorage, merging with backend case records.
import { BASE } from './api';

const STORAGE_KEY = 'patient_images';

function readStorage(): Record<string, any[]> {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
}

function writeStorage(data: Record<string, any[]>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function loadImages(mrn: string, id: string): Promise<any[]> {
    const all = readStorage();

    const seen = new Set<string>();
    const local: any[] = [];
    for (const key of [mrn, id]) {
        for (const img of (all[key] ?? [])) {
            if (!seen.has(img.id)) { seen.add(img.id); local.push(img); }
        }
    }

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE}/api/cases?patient_id=${encodeURIComponent(id)}`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (res.ok) {
            const data = await res.json();
            const cases: any[] = Array.isArray(data) ? data : (data?.cases ?? [data]);

            const localPaths = new Set(local.map((img: any) => img.enhancedSrc).filter(Boolean));

            for (const c of cases) {
                const path: string | undefined = c.enhanced_image_path;
                if (path && !localPaths.has(path)) {
                    local.push({
                        id:          `CASE-${c.id}`,
                        patientId:   mrn,
                        type:        c.scan_type   || 'Ultrasound',
                        date:        c.updated_at  || c.created_at || new Date().toISOString(),
                        label:       c.label       || c.scan_label || 'Enhanced scan',
                        isEnhanced:  true,
                        enhancedSrc: path,
                        originalSrc: c.original_image_path || '',
                    });
                }
            }
        }
    } catch {
    }

    return local.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function deleteImage(mrn: string, id: string, imageId: string): Promise<void> {
    const all = readStorage();
    for (const key of [mrn, id]) {
        if (all[key]) all[key] = all[key].filter((img: any) => img.id !== imageId);
    }
    writeStorage(all);
}

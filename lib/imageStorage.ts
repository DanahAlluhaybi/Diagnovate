import { BASE } from './api';

const STORAGE_KEY = 'patient_images';

function readStorage(): Record<string, any[]> {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
}

function writeStorage(data: Record<string, any[]>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Returns all images for a patient by checking both mrn and id keys in
 * localStorage, then merging any enhanced_image_path entries from the
 * backend cases API that aren't already represented locally.
 */
export async function loadImages(mrn: string, id: string): Promise<any[]> {
    const all = readStorage();

    // Collect from both mrn and id keys, deduplicate by image id
    const seen = new Set<string>();
    const local: any[] = [];
    for (const key of [mrn, id]) {
        for (const img of (all[key] ?? [])) {
            if (!seen.has(img.id)) { seen.add(img.id); local.push(img); }
        }
    }

    // Fetch backend cases and merge any enhanced_image_path not already in local
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE}/api/cases?patient_id=${encodeURIComponent(id)}`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (res.ok) {
            const data = await res.json();
            const cases: any[] = Array.isArray(data) ? data : (data?.cases ?? [data]);

            // Index local images by their enhancedSrc to avoid duplicates
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
        // Backend unavailable — localStorage images are shown as-is
    }

    return local.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Removes an image by id from both the mrn and id keys in localStorage.
 * Backend-only images (id prefixed "CASE-") exist only in the backend
 * and are not stored locally, so nothing to delete here for those.
 */
export async function deleteImage(mrn: string, id: string, imageId: string): Promise<void> {
    const all = readStorage();
    for (const key of [mrn, id]) {
        if (all[key]) all[key] = all[key].filter((img: any) => img.id !== imageId);
    }
    writeStorage(all);
}

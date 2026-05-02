// lib/imageStorage.ts
import { BASE } from './api';

const CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME    ?? '';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '';
const STORAGE_KEY   = 'patient_images_v2';

interface StoredImage {
    id          : string;
    patientId   : string;
    type        : string;
    date        : string;
    label       : string;
    isEnhanced  : boolean;
    originalSrc : string;
    enhancedSrc : string;
    publicId?   : string;
}

function readStorage(): Record<string, StoredImage[]> {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
}

function writeStorage(data: Record<string, StoredImage[]>) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch {}
}

export async function uploadToCloudinary(
    file: File | Blob,
    folder = 'diagnovate/scans',
): Promise<{ url: string; publicId: string }> {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        return { url: URL.createObjectURL(file), publicId: '' };
    }
    const fd = new FormData();
    fd.append('file',          file);
    fd.append('upload_preset', UPLOAD_PRESET);
    fd.append('folder',        folder);
    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: fd },
    );
    if (!res.ok) throw new Error(`Cloudinary upload failed: ${await res.text()}`);
    const data = await res.json();
    return { url: data.secure_url as string, publicId: data.public_id as string };
}

export function saveImageRecord(mrn: string, image: StoredImage): void {
    const all = readStorage();
    all[mrn]  = [image, ...(all[mrn] ?? []).filter(i => i.id !== image.id)];
    writeStorage(all);
}

export async function loadImages(mrn: string, id: string): Promise<StoredImage[]> {
    const all  = readStorage();
    const seen = new Set<string>();
    const local: StoredImage[] = [];
    for (const key of [mrn, id]) {
        for (const img of (all[key] ?? [])) {
            if (!seen.has(img.id)) { seen.add(img.id); local.push(img); }
        }
    }
    try {
        const token = localStorage.getItem('token');
        const res   = await fetch(`${BASE}/api/cases?patient_id=${encodeURIComponent(id)}`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (res.ok) {
            const data     = await res.json();
            const cases: any[] = Array.isArray(data) ? data : (data?.cases ?? [data]);
            const localPaths   = new Set(local.map(img => img.enhancedSrc).filter(Boolean));
            for (const c of cases) {
                const path: string | undefined = c.enhanced_image_path;
                if (path && !localPaths.has(path)) {
                    local.push({
                        id: `CASE-${c.id}`, patientId: mrn,
                        type: c.scan_type || 'Ultrasound',
                        date: c.updated_at || c.created_at || new Date().toISOString(),
                        label: c.label || c.scan_label || 'Enhanced scan',
                        isEnhanced: true, enhancedSrc: path,
                        originalSrc: c.original_image_path || '',
                    });
                }
            }
        }
    } catch {}
    return local.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function deleteImage(mrn: string, id: string, imageId: string): Promise<void> {
    const all = readStorage();
    for (const key of [mrn, id]) {
        if (all[key]) all[key] = all[key].filter(img => img.id !== imageId);
    }
    writeStorage(all);
}

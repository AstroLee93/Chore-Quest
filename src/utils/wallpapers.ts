/** Kiosk wallpapers: built-in gradient scenes plus parent-uploaded photos. */

export interface WallpaperPreset {
  id: string;
  name: string;
  css: string; // CSS background value
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'aurora', name: 'Aurora',
    css: 'radial-gradient(60% 50% at 20% 25%, rgba(56,214,170,0.55) 0%, transparent 70%), radial-gradient(50% 45% at 75% 20%, rgba(91,140,255,0.55) 0%, transparent 70%), radial-gradient(70% 60% at 60% 85%, rgba(167,139,250,0.45) 0%, transparent 70%), linear-gradient(160deg, #06121c 0%, #0b0e1f 100%)',
  },
  {
    id: 'sunset', name: 'Sunset',
    css: 'radial-gradient(80% 55% at 50% 100%, rgba(255,140,66,0.75) 0%, transparent 70%), radial-gradient(60% 50% at 15% 70%, rgba(232,67,122,0.55) 0%, transparent 70%), linear-gradient(180deg, #1a1033 0%, #3b1a45 55%, #6b2a3c 100%)',
  },
  {
    id: 'ocean', name: 'Ocean',
    css: 'radial-gradient(70% 55% at 80% 15%, rgba(64,200,224,0.5) 0%, transparent 70%), radial-gradient(60% 50% at 10% 90%, rgba(15,124,126,0.6) 0%, transparent 70%), linear-gradient(170deg, #031a2b 0%, #04263a 50%, #062f3a 100%)',
  },
  {
    id: 'meadow', name: 'Meadow',
    css: 'radial-gradient(70% 50% at 25% 20%, rgba(255,214,102,0.4) 0%, transparent 70%), radial-gradient(80% 60% at 70% 90%, rgba(80,170,100,0.6) 0%, transparent 70%), linear-gradient(170deg, #0f1f17 0%, #14301f 60%, #1d3a1e 100%)',
  },
  {
    id: 'cosmos', name: 'Cosmos',
    css: 'radial-gradient(1.5px 1.5px at 12% 18%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 32% 62%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 58% 28%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 78% 72%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 88% 14%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 44% 88%, #fff 50%, transparent 51%), radial-gradient(55% 45% at 70% 35%, rgba(167,139,250,0.45) 0%, transparent 70%), radial-gradient(50% 40% at 25% 75%, rgba(232,67,122,0.3) 0%, transparent 70%), #07061a',
  },
  {
    id: 'citrus', name: 'Citrus',
    css: 'radial-gradient(60% 50% at 20% 20%, rgba(255,181,71,0.8) 0%, transparent 70%), radial-gradient(60% 55% at 85% 80%, rgba(255,111,165,0.7) 0%, transparent 70%), radial-gradient(50% 45% at 80% 15%, rgba(127,166,255,0.6) 0%, transparent 70%), linear-gradient(135deg, #2a1640 0%, #3d1f3a 100%)',
  },
];

export const presetById = (id: string) => WALLPAPER_PRESETS.find((p) => p.id === id);

export async function listWallpapers(): Promise<string[]> {
  try {
    const r = await fetch('/api/wallpapers');
    const j = await r.json();
    return Array.isArray(j.wallpapers) ? j.wallpapers : [];
  } catch {
    return [];
  }
}

/** Downscale to ≤2560px wide JPEG so Pi kiosks load it quickly, then upload. */
export async function uploadWallpaper(file: File, pin: string): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 2560 / bmp.width, 1600 / bmp.height);
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  const dataUrl = c.toDataURL('image/jpeg', 0.86);
  const r = await fetch('/api/wallpapers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl, pin }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Upload failed');
  return j.url as string;
}

export async function deleteWallpaper(url: string, pin: string): Promise<void> {
  await fetch(url, { method: 'DELETE', headers: { 'x-parent-pin': pin } });
}

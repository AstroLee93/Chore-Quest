/**
 * Parent setting: choose the kiosk wall background — plain, a built-in scene,
 * your own photos from the camera roll, or a slideshow of those photos.
 */
import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Check, Trash2, Shuffle, Loader2 } from 'lucide-react';
import { WALLPAPER_PRESETS, listWallpapers, uploadWallpaper, deleteWallpaper } from '../utils/wallpapers';

interface Props {
  value?: string;
  dim?: number;
  slideshowMins?: number;
  parentPin: string;
  onChange: (patch: { kioskWallpaper?: string; kioskWallpaperDim?: number; kioskWallpaperSlideshowMins?: number }) => void;
}

export const KioskWallpaperPicker: React.FC<Props> = ({ value = '', dim = 45, slideshowMins = 10, parentPin, onChange }) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { listWallpapers().then(setPhotos); }, []);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError('');
    let last = '';
    try {
      for (const f of Array.from(files)) last = await uploadWallpaper(f, parentPin);
      const list = await listWallpapers();
      setPhotos(list);
      // One photo → use it; several → turn on the slideshow.
      onChange({ kioskWallpaper: files.length > 1 ? 'slideshow' : last });
    } catch (e: any) {
      setError(e?.message === 'Parent PIN required' ? 'Save your PIN change first, then try again.' : (e?.message || 'Upload failed'));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remove = async (url: string) => {
    await deleteWallpaper(url, parentPin);
    setPhotos((p) => p.filter((x) => x !== url));
    if (value === url) onChange({ kioskWallpaper: '' });
  };

  const tile = 'relative aspect-[16/10] rounded-xl overflow-hidden border-2 cursor-pointer transition-transform active:scale-95';
  const sel = (on: boolean) => (on ? 'border-indigo-500 ring-2 ring-indigo-500/40' : 'border-slate-200');
  const tick = <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center"><Check className="w-3 h-3" strokeWidth={3} /></span>;

  return (
    <div className="space-y-3">
      <label className="block text-[11px] sm:text-xs font-black text-slate-700 uppercase tracking-wider">Kiosk wallpaper</label>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        <button type="button" onClick={() => onChange({ kioskWallpaper: '' })} className={`${tile} ${sel(!value)} bg-[#0C0E13] text-[11px] font-bold text-slate-300`}>
          Plain{!value && tick}
        </button>
        {WALLPAPER_PRESETS.map((p) => (
          <button key={p.id} type="button" onClick={() => onChange({ kioskWallpaper: `preset:${p.id}` })}
            className={`${tile} ${sel(value === `preset:${p.id}`)}`} style={{ background: p.css }} aria-label={p.name}>
            <span className="absolute bottom-1 left-1.5 text-[11px] font-bold text-white drop-shadow">{p.name}</span>
            {value === `preset:${p.id}` && tick}
          </button>
        ))}
        {photos.map((url) => (
          <div key={url} className={`${tile} ${sel(value === url)}`}>
            <button type="button" onClick={() => onChange({ kioskWallpaper: url })} className="absolute inset-0" aria-label="Use this photo">
              <img src={url} alt="" loading="lazy" className="w-full h-full object-cover" />
            </button>
            {value === url && tick}
            <button type="button" onClick={() => remove(url)} aria-label="Delete photo"
              className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button type="button" disabled={busy} onClick={() => fileRef.current?.click()}
          className={`${tile} border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-slate-500`}>
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
          {busy ? 'Uploading…' : 'Add photos'}
        </button>
      </div>
      {/* No `capture` attribute: phones open the photo library / camera roll. */}
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      {error && <p className="text-xs font-bold text-red-500">{error}</p>}

      {photos.length > 1 && (
        <button type="button" onClick={() => onChange({ kioskWallpaper: 'slideshow' })}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-black ${value === 'slideshow' ? 'border-indigo-500 text-indigo-600' : 'border-slate-200 text-slate-600'}`}>
          <Shuffle className="w-4 h-4" /> {value === 'slideshow' ? 'Slideshow on' : `Slideshow of all ${photos.length} photos`}
        </button>
      )}
      {value === 'slideshow' && (
        <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
          Change photo every
          <select value={slideshowMins} onChange={(e) => onChange({ kioskWallpaperSlideshowMins: Number(e.target.value) })}
            className="px-2 py-1 rounded-lg border border-slate-200 bg-yellow-50/50">
            {[1, 5, 10, 30, 60].map((m) => <option key={m} value={m}>{m} min</option>)}
          </select>
        </label>
      )}

      {value && (
        <label className="block text-xs font-bold text-slate-600">
          Darken for readability: {dim}%
          <input type="range" min={0} max={80} step={5} value={dim} onChange={(e) => onChange({ kioskWallpaperDim: Number(e.target.value) })}
            className="w-full mt-1 accent-indigo-500" />
        </label>
      )}
      <p className="text-[10px] text-slate-400 font-bold">Shows on the kiosk wall with any 2026 theme. Cards turn to frosted glass over the picture.</p>
    </div>
  );
};

export default KioskWallpaperPicker;

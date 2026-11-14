/** Full-bleed background behind the 2026 kiosk wall (preset scene, photo or slideshow). */
import React, { useEffect, useState } from 'react';
import { presetById, listWallpapers } from '../utils/wallpapers';

interface Props { value: string; dim: number; slideshowMins: number }

export const KioskWallpaper: React.FC<Props> = ({ value, dim, slideshowMins }) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (value !== 'slideshow') return;
    listWallpapers().then((l) => { setPhotos(l); setIdx(Math.floor(Math.random() * Math.max(1, l.length))); });
  }, [value]);

  useEffect(() => {
    if (value !== 'slideshow' || photos.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % photos.length), Math.max(1, slideshowMins) * 60_000);
    return () => clearInterval(t);
  }, [value, photos.length, slideshowMins]);

  const preset = value.startsWith('preset:') ? presetById(value.slice(7)) : undefined;
  const photo = value === 'slideshow' ? photos[idx] : !preset ? value : undefined;

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-black">
      {preset && <div className="absolute inset-0" style={{ background: preset.css }} />}
      {value === 'slideshow'
        ? photos.map((p, i) => (
            <img key={p} src={p} alt="" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms]"
              style={{ opacity: i === idx ? 1 : 0 }} loading={i === idx ? 'eager' : 'lazy'} />
          ))
        : photo && <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      {/* Scrim: overall dim plus a stronger fade on the left where the clock sits. */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(90deg, rgba(0,0,0,${Math.min(0.9, dim / 100 + 0.2)}) 0%, rgba(0,0,0,${dim / 100}) 45%, rgba(0,0,0,${dim / 100}) 100%)`,
      }} />
    </div>
  );
};

export default KioskWallpaper;

import { useState } from 'react';
import { motion } from 'motion/react';
import type { StampCategory, StampItem, StampPocket } from '../types/stamp';
import { Reicon } from './Reicon';

interface StampStudioModalProps {
  isOpen: boolean;
  pockets: StampPocket[];
  stamps: StampItem[];
  initialPocketId?: string | null;
  initialEditStamp?: StampItem | null;
  onClose: () => void;
  onSaveNewStamp: (stamp: StampItem) => void;
  onUpdateStampArt: (stampId: string, newImageUrl: string) => void;
}

type StudioMode = 'create' | 'edit';

const STYLE_PRESETS = ['Vintage Risograph', 'Warm Gouache', 'Mediterranean Poster', 'Minimalist Woodcut'];

function buildProceduralStampArt(title: string, color: string): string {
  const safeTitle = title.replace(/[<>&"']/g, '').slice(0, 18) || 'Travel';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#D9EEF5"/>
        <stop offset="100%" stop-color="${color}"/>
      </linearGradient>
    </defs>
    <rect width="300" height="400" fill="url(#g)"/>
    <circle cx="215" cy="96" r="36" fill="#F27830"/>
    <path d="M0 300 Q75 240 150 280 T300 265 L300 400 L0 400 Z" fill="#1F3A3D" opacity="0.9"/>
    <path d="M0 335 Q90 310 180 335 T300 325 L300 400 L0 400 Z" fill="#132629"/>
    <text x="150" y="366" text-anchor="middle" fill="#FFFFFF" font-family="'Zilla Slab', 'Arvo', serif" font-size="14" font-weight="700" opacity="0.72">${safeTitle.toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function StampStudioModal({
  isOpen,
  pockets,
  stamps,
  initialPocketId,
  initialEditStamp,
  onClose,
  onSaveNewStamp,
  onUpdateStampArt,
}: StampStudioModalProps) {
  const [mode, setMode] = useState<StudioMode>(initialEditStamp ? 'edit' : 'create');
  const [title, setTitle] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState<StampCategory>('city');
  const [pocketId, setPocketId] = useState(initialPocketId || pockets[0]?.id || 'cities');
  const [stylePreset, setStylePreset] = useState(STYLE_PRESETS[0]);
  const [prompt, setPrompt] = useState('');
  const [editTargetId, setEditTargetId] = useState(initialEditStamp?.id || stamps[0]?.id || '');
  const [previewUrl, setPreviewUrl] = useState<string>(initialEditStamp?.imageUrl || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [noticeMsg, setNoticeMsg] = useState('');

  if (!isOpen) return null;

  const targetEditStamp = stamps.find((s) => s.id === editTargetId) ?? stamps[0];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setNoticeMsg('');

    if (!prompt.trim()) {
      setErrorMsg('Please describe the scene or artwork edit you want to generate.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'create') {
        const res = await fetch('/api/stamps/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt.trim(),
            destination: title.trim() || country.trim(),
            style: stylePreset,
          }),
        });
        const data = (await res.json()) as { imageUrl?: string; error?: string; code?: string };
        if (!res.ok) {
          setErrorMsg(data.error || 'Could not generate stamp with Gemini.');
          return;
        }
        if (data.imageUrl) {
          setPreviewUrl(data.imageUrl);
          setNoticeMsg('Artwork created with gemini-nano-banana-2.1.');
        }
      } else {
        const sourceUrl = previewUrl || targetEditStamp?.imageUrl || '';
        if (!sourceUrl.startsWith('data:')) {
          // Convert static asset image URL to base64 via canvas for server-side Gemini editing
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Failed to load stamp artwork for editing.'));
            img.src = sourceUrl;
          });
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 600;
          canvas.height = img.naturalHeight || 800;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          await sendEditRequest(dataUrl, 'image/jpeg');
        } else {
          const mimeMatch = sourceUrl.match(/^data:([^;]+);/);
          await sendEditRequest(sourceUrl, mimeMatch?.[1] || 'image/png');
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to reach Stamp Studio service.');
    } finally {
      setLoading(false);
    }
  };

  const sendEditRequest = async (base64DataUrl: string, mimeType: string) => {
    const res = await fetch('/api/stamps/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt.trim(),
        imageBase64: base64DataUrl,
        mimeType,
      }),
    });
    const data = (await res.json()) as { imageUrl?: string; error?: string };
    if (!res.ok) {
      setErrorMsg(data.error || 'Could not edit stamp artwork.');
      return;
    }
    if (data.imageUrl) {
      setPreviewUrl(data.imageUrl);
      setNoticeMsg('Artwork updated with gemini-nano-banana-2.1.');
    }
  };

  const handleUseVectorPreview = () => {
    setErrorMsg('');
    const art = buildProceduralStampArt(title || targetEditStamp?.title || 'Custom', '#F4B886');
    setPreviewUrl(art);
    setNoticeMsg('Applied crisp studio vector preview.');
  };

  const handleSave = () => {
    if (mode === 'create') {
      if (!title.trim()) {
        setErrorMsg('Please enter a destination title for your stamp.');
        return;
      }
      const art = previewUrl || buildProceduralStampArt(title.trim(), '#98D4DC');
      const newStamp: StampItem = {
        id: `custom-${Date.now()}`,
        title: title.trim(),
        country: country.trim() || 'Custom Atlas',
        city: title.trim(),
        category,
        rarity: 'rare',
        collectedCount: 1,
        totalInSet: 10,
        isFavorite: true,
        isUnlocked: true,
        coordinates: { lat: 35.6762, lng: 139.6503 },
        imageUrl: art,
        accentColor: '#F4A28C',
        bannerColor: '#D64527',
        pocketId,
        description: prompt.trim() || `Custom collector stamp for ${title.trim()}.`,
        unlockedAt: 'Nov 2026',
        isCustomGenerated: true,
        isDemoSeed: false,
      };
      onSaveNewStamp(newStamp);
      onClose();
    } else if (targetEditStamp && previewUrl) {
      onUpdateStampArt(targetEditStamp.id, previewUrl);
      onClose();
    } else {
      setErrorMsg('Generate or select an updated artwork before saving.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Stamp Studio"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-xs sm:items-center sm:p-6"
    >
      <motion.div
        initial={{ y: 32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] bg-[#F7F7F9] p-6 sm:rounded-[28px]"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-neutral-500">Gemini Nano Banana 2.1</p>
            <h2 className="font-display text-xl font-bold text-[#0A0A0A]">Stamp Studio</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Stamp Studio"
            className="liquid-glass-btn flex h-11 w-11 items-center justify-center rounded-full text-[#0A0A0A]"
          >
            <Reicon name="close" size={20} />
          </button>
        </div>

        {/* Create vs Edit Segmented Toggle */}
        <div className="liquid-glass-btn-soft mt-4 flex gap-1.5 rounded-full p-1">
          <button
            type="button"
            onClick={() => {
              setMode('create');
              setErrorMsg('');
            }}
            className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-full text-xs font-semibold transition-colors ${
              mode === 'create' ? 'bg-[#0A0A0A] text-white' : 'liquid-glass-btn text-[#0A0A0A]'
            }`}
          >
            <Reicon name="image-sparkle" size={16} />
            <span>Create New Stamp</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('edit');
              setErrorMsg('');
              if (targetEditStamp && !previewUrl) setPreviewUrl(targetEditStamp.imageUrl);
            }}
            className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-full text-xs font-semibold transition-colors ${
              mode === 'edit' ? 'bg-[#0A0A0A] text-white' : 'liquid-glass-btn text-[#0A0A0A]'
            }`}
          >
            <Reicon name="wand" size={16} />
            <span>Edit Existing Art</span>
          </button>
        </div>

        <form onSubmit={handleGenerate} className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-12">
          {/* Left Form Controls */}
          <div className="space-y-3.5 sm:col-span-7">
            {mode === 'create' ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="studio-title" className="block text-xs font-medium text-neutral-600">
                      Destination Title
                    </label>
                    <input
                      id="studio-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Lisbon"
                      className="mt-1 h-11 w-full rounded-xl bg-white px-3 text-sm text-[#0A0A0A] focus:outline-2 focus:outline-[#0A0A0A]"
                    />
                  </div>
                  <div>
                    <label htmlFor="studio-country" className="block text-xs font-medium text-neutral-600">
                      Country
                    </label>
                    <input
                      id="studio-country"
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g., Portugal"
                      className="mt-1 h-11 w-full rounded-xl bg-white px-3 text-sm text-[#0A0A0A] focus:outline-2 focus:outline-[#0A0A0A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="studio-pocket" className="block text-xs font-medium text-neutral-600">
                      Library Pocket
                    </label>
                    <select
                      id="studio-pocket"
                      value={pocketId}
                      onChange={(e) => setPocketId(e.target.value)}
                      className="mt-1 h-11 w-full rounded-xl bg-white px-3 text-sm text-[#0A0A0A]"
                    >
                      {pockets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="studio-category" className="block text-xs font-medium text-neutral-600">
                      Stamp Type
                    </label>
                    <select
                      id="studio-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as StampCategory)}
                      className="mt-1 h-11 w-full rounded-xl bg-white px-3 text-sm text-[#0A0A0A]"
                    >
                      <option value="city">City</option>
                      <option value="country">Country</option>
                      <option value="landmark">Landmark</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="studio-style" className="block text-xs font-medium text-neutral-600">
                    Illustration Style
                  </label>
                  <select
                    id="studio-style"
                    value={stylePreset}
                    onChange={(e) => setStylePreset(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl bg-white px-3 text-sm text-[#0A0A0A]"
                  >
                    {STYLE_PRESETS.map((preset) => (
                      <option key={preset} value={preset}>
                        {preset}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div>
                <label htmlFor="studio-edit-select" className="block text-xs font-medium text-neutral-600">
                  Select Stamp to Remix
                </label>
                <select
                  id="studio-edit-select"
                  value={editTargetId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setEditTargetId(nextId);
                    const found = stamps.find((s) => s.id === nextId);
                    if (found) setPreviewUrl(found.imageUrl);
                  }}
                  className="mt-1 h-11 w-full rounded-xl bg-white px-3 text-sm text-[#0A0A0A]"
                >
                  {stamps.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.country})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="studio-prompt" className="block text-xs font-medium text-neutral-600">
                {mode === 'create' ? 'Artwork Prompt' : 'Edit Prompt'}
              </label>
              <textarea
                id="studio-prompt"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === 'create'
                    ? 'Terracotta rooftops, yellow tram climbing a sunlit hill, coastal bay...'
                    : 'Add warm golden hour sky and autumn trees around the monument...'
                }
                className="mt-1 w-full rounded-2xl bg-white p-3 text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-2 focus:outline-[#0A0A0A]"
              />
            </div>

            {errorMsg && (
              <div className="rounded-2xl bg-amber-50 p-3 text-xs text-amber-900">
                <p className="font-medium">{errorMsg}</p>
                <button
                  type="button"
                  onClick={handleUseVectorPreview}
                  className="mt-2 font-semibold underline"
                >
                  Generate crisp vector stamp preview instead
                </button>
              </div>
            )}

            {noticeMsg && <p className="text-xs font-medium text-emerald-700">{noticeMsg}</p>}

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex h-11 items-center gap-2 rounded-full bg-[#0A0A0A] px-5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                <Reicon name="wand" size={15} />
                <span>{loading ? 'Generating...' : mode === 'create' ? 'Generate with Gemini' : 'Apply Gemini Edit'}</span>
              </button>

              <button
                type="button"
                onClick={handleUseVectorPreview}
                className="liquid-glass-btn flex h-11 items-center gap-1.5 rounded-full px-4 text-xs font-semibold text-[#0A0A0A]"
              >
                <span>Vector Preview</span>
              </button>
            </div>
          </div>

          {/* Right Live Perforated Stamp Preview */}
          <div className="flex flex-col items-center justify-between rounded-[24px] bg-white p-4 sm:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Live Stamp Proof
            </p>

            <div className="my-4 w-[160px]">
              <div className="stamp-perforated-x w-full">
                <div
                  className="stamp-perforated-y p-[8px]"
                  style={{ backgroundColor: '#F3D2B3' }}
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[6px] bg-[#F7F7F9]">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Generated stamp preview"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center text-neutral-400">
                        <Reicon name="image-sparkle" size={26} />
                        <span className="text-[11px]">Artwork preview appears here</span>
                      </div>
                    )}
                    <div className="absolute inset-x-1.5 bottom-1.5 rounded-[4px] bg-white/95 px-1.5 py-1 text-center">
                      <p className="font-stamp-title truncate text-[11px] font-bold tracking-[0.05em] text-[#D64527]">
                        {(mode === 'create' ? title : targetEditStamp?.title) || 'SNAPSTAMPS'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="flex h-11 w-full items-center justify-center rounded-full bg-[#0A0A0A] text-xs font-semibold text-white hover:bg-neutral-800"
            >
              {mode === 'create' ? 'Save to Library' : 'Save Updated Stamp'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

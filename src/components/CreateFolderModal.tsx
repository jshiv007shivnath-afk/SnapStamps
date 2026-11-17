import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { PocketTint, StampItem } from '../types/stamp';
import { JellyButton } from './JellyButton';
import { Reicon } from './Reicon';

interface CreateFolderModalProps {
  isOpen: boolean;
  stamps: StampItem[];
  onClose: () => void;
  onCreateFolder: (payload: {
    title: string;
    tint: PocketTint;
    initialStampIds: string[];
  }) => void;
}

const TINT_OPTIONS: Array<{ value: PocketTint; label: string; color: string }> = [
  { value: 'amber', label: 'Amber Gold', color: '#F5CD42' },
  { value: 'sky', label: 'Cobalt Sky', color: '#72ADE8' },
  { value: 'sage', label: 'Sage Mint', color: '#74B87A' },
  { value: 'coral', label: 'Warm Coral', color: '#EE7D68' },
];

export function CreateFolderModal({
  isOpen,
  stamps,
  onClose,
  onCreateFolder,
}: CreateFolderModalProps) {
  const [title, setTitle] = useState('');
  const [tint, setTint] = useState<PocketTint>('amber');
  const [selectedStampIds, setSelectedStampIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const unlockedStamps = stamps.filter((s) => s.isUnlocked);

  const toggleStampSelection = (id: string) => {
    setSelectedStampIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = title.trim();
    if (!clean) {
      setErrorMsg('Please enter a folder name.');
      return;
    }
    onCreateFolder({
      title: clean,
      tint,
      initialStampIds: selectedStampIds,
    });
    setTitle('');
    setSelectedStampIds([]);
    setErrorMsg('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm sm:p-6"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-folder-heading"
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="no-scrollbar max-h-[86dvh] w-full max-w-md overflow-y-auto overflow-x-hidden rounded-[28px] border border-black/8 bg-white p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-0">
                <span aria-hidden="true" className="h-0 w-0 overflow-hidden">
                  <Reicon name="folder-plus" size={0} />
                </span>
                <div className="text-left">
                  <h2
                    id="create-folder-heading"
                    style={{ textAlign: 'left', fontFamily: 'system-ui' }}
                    className="text-[19px] font-semibold text-[#0A0A0A]"
                  >
                    New Stamp Folder
                  </h2>
                  <p className="font-body mt-0.5 text-left text-xs text-neutral-500">
                    Organize your stamps into a custom library pocket
                  </p>
                </div>
              </div>

              <JellyButton
                type="button"
                onClick={onClose}
                aria-label="Close new folder dialog"
                className="flex h-11 w-[65px] shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-[#0A0A0A] hover:bg-neutral-200"
              >
                <Reicon name="close" size={18} />
              </JellyButton>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="folder-name-input" className="font-control block text-xs font-medium text-neutral-600">
                  Folder Name
                </label>
                <input
                  id="folder-name-input"
                  type="text"
                  maxLength={28}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="e.g. Cricket Legends, World Tour"
                  autoFocus
                  className="font-body mt-1.5 h-12 w-full rounded-2xl bg-[#F5F5F7] px-4 text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-2 focus:outline-[#0A0A0A]"
                />
                {errorMsg && (
                  <p className="mt-1.5 text-xs font-medium text-[#D64527]">{errorMsg}</p>
                )}
              </div>

              <div>
                <span className="font-control block text-xs font-medium text-neutral-600">
                  Folder Color
                </span>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {TINT_OPTIONS.map((option) => {
                    const active = tint === option.value;
                    return (
                      <JellyButton
                        key={option.value}
                        type="button"
                        onClick={() => setTint(option.value)}
                        aria-label={`Choose ${option.label} folder color`}
                        aria-pressed={active}
                        className={`flex h-11 flex-col items-center justify-center rounded-2xl bg-[#F5F5F7] transition-all ${
                          active ? 'ring-2 ring-[#0A0A0A]' : ''
                        }`}
                      >
                        <span
                          className="h-5 w-5 rounded-full ring-1 ring-black/10"
                          style={{ backgroundColor: option.color }}
                        />
                      </JellyButton>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <span className="font-control text-xs font-medium text-neutral-600">
                    Include Collected Stamps (Optional)
                  </span>
                  {unlockedStamps.length > 0 && (
                    <span className="font-mono-nums text-[11px] text-neutral-500">
                      {selectedStampIds.length} selected
                    </span>
                  )}
                </div>

                {unlockedStamps.length === 0 ? (
                  <div className="mt-2 rounded-2xl bg-[#F5F5F7] px-4 py-3 text-xs text-neutral-500">
                    No stamps in your vault yet. After creating this folder, any stamp you unlock in Store can be saved straight inside it.
                  </div>
                ) : (
                  <div className="no-scrollbar mt-2 flex max-h-36 flex-wrap gap-2 overflow-y-auto rounded-2xl bg-[#F5F5F7] p-2.5">
                    {unlockedStamps.map((stamp) => {
                      const selected = selectedStampIds.includes(stamp.id);
                      return (
                        <JellyButton
                          key={stamp.id}
                          type="button"
                          onClick={() => toggleStampSelection(stamp.id)}
                          className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors ${
                            selected
                              ? 'bg-[#0A0A0A] text-white'
                              : 'bg-white text-[#0A0A0A]'
                          }`}
                        >
                          {selected && <Reicon name="check" size={12} />}
                          <span>{stamp.title}</span>
                        </JellyButton>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <JellyButton
                  type="button"
                  onClick={onClose}
                  className="font-control flex h-11 items-center justify-center rounded-full bg-[#F5F5F7] px-5 text-[13px] font-medium text-[#0A0A0A] hover:bg-neutral-200"
                >
                  Cancel
                </JellyButton>
                <JellyButton
                  type="submit"
                  jellyIntensity="medium"
                  className="font-control flex h-11 items-center justify-center gap-1.5 rounded-full bg-[#0A0A0A] px-6 text-[13px] font-medium text-white hover:bg-neutral-800"
                >
                  <Reicon name="folder-plus" size={15} />
                  <span>Create Folder</span>
                </JellyButton>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

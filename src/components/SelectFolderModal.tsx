import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { PocketTint, StampItem, StampPocket } from '../types/stamp';
import { getPocketStampCount } from '../utils/stampLogic';
import { JellyButton } from './JellyButton';
import { PerforatedStampCard } from './PerforatedStampCard';
import { Reicon } from './Reicon';

interface SelectFolderModalProps {
  stamp: StampItem | null;
  pockets: StampPocket[];
  stamps: StampItem[];
  onClose: () => void;
  onSelectFolder: (pocketId: string) => void;
  onCreateAndSelectFolder: (title: string, tint: PocketTint) => void;
}

const POCKET_COLOR_HEX: Record<PocketTint, string> = {
  amber: '#F5CD42',
  sage: '#74B87A',
  coral: '#EE7D68',
  sky: '#72ADE8',
};

export function SelectFolderModal({
  stamp,
  pockets,
  stamps,
  onClose,
  onSelectFolder,
  onCreateAndSelectFolder,
}: SelectFolderModalProps) {
  const [creatingNew, setCreatingNew] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuickCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newFolderName.trim();
    if (!clean) {
      setErrorMsg('Enter a folder name.');
      return;
    }
    onCreateAndSelectFolder(clean, 'amber');
    setNewFolderName('');
    setCreatingNew(false);
    setErrorMsg('');
  };

  return (
    <AnimatePresence>
      {stamp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="choose-folder-heading"
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="no-scrollbar max-h-[86dvh] w-full max-w-md overflow-y-auto overflow-x-hidden rounded-[28px] border border-black/8 bg-white p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="choose-folder-heading" className="font-title text-[20px] font-semibold text-[#0A0A0A]">
                  Choose a Folder
                </h2>
                <p className="font-body mt-0.5 text-[13px] text-neutral-500">
                  Where would you like to save{' '}
                  <span className="font-medium text-[#0A0A0A]">{stamp.title}</span>?
                </p>
              </div>
              <JellyButton
                type="button"
                onClick={onClose}
                aria-label="Keep in default folder"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-[#0A0A0A] hover:bg-neutral-200"
              >
                <Reicon name="close" size={18} />
              </JellyButton>
            </div>

            {/* Purchased Stamp Thumbnail Preview */}
            <div className="mt-4 flex items-center gap-4 rounded-2xl bg-[#F5F5F7] p-3">
              <div className="w-[74px] shrink-0">
                <PerforatedStampCard
                  stamp={{ ...stamp, isUnlocked: true }}
                  compact
                  showProgress={false}
                  showUncollectedBadge={false}
                />
              </div>
              <div className="min-w-0">
                <p className="font-title truncate text-[15px] font-semibold text-[#0A0A0A]">
                  {stamp.title}
                </p>
                <p className="font-body truncate text-xs text-neutral-500">
                  {stamp.celebrationLabel
                    ? `${stamp.celebrationLabel} · ${stamp.country}`
                    : `${stamp.city} · ${stamp.country}`}
                </p>
                <p className="font-body mt-1.5 text-[11px] font-medium text-[#2563EB]">
                  Purchased &amp; Ready to File
                </p>
              </div>
            </div>

            {/* Folder List */}
            <div className="mt-4 max-h-60 space-y-2 overflow-y-auto pr-0.5">
              {pockets.map((pocket) => {
                const count = getPocketStampCount(stamps, pocket.id);
                const isDefaultMatch = pocket.id === stamp.pocketId;
                return (
                  <JellyButton
                    key={pocket.id}
                    type="button"
                    jellyIntensity="soft"
                    onClick={() => onSelectFolder(pocket.id)}
                    aria-label={`Save to ${pocket.title} folder`}
                    className={`liquid-glass-btn flex h-14 w-full items-center justify-between rounded-2xl px-4 text-left transition-colors ${
                      isDefaultMatch ? 'ring-1 ring-[#0A0A0A]/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${POCKET_COLOR_HEX[pocket.tint]}33` }}
                      >
                        <Reicon name="folder" size={16} color="#0A0A0A" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-title truncate text-[14px] font-medium text-[#0A0A0A]">
                          {pocket.title}
                        </p>
                        <p className="font-mono-nums text-[11px] text-neutral-500">
                          {count} {count === 1 ? 'Stamp' : 'Stamps'}
                        </p>
                      </div>
                    </div>
                    <span className="font-control shrink-0 rounded-full bg-[#0A0A0A] px-3 py-1 text-[11px] font-medium text-white">
                      Save Here
                    </span>
                  </JellyButton>
                );
              })}
            </div>

            {/* Quick Inline Create Folder */}
            <div className="mt-4 pt-3 border-t border-black/6">
              {creatingNew ? (
                <form onSubmit={handleQuickCreate} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={28}
                      value={newFolderName}
                      onChange={(e) => {
                        setNewFolderName(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="New folder name..."
                      autoFocus
                      className="font-body h-11 flex-1 rounded-full bg-white px-4 text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-2 focus:outline-[#0A0A0A]"
                    />
                    <JellyButton
                      type="submit"
                      jellyIntensity="medium"
                      className="font-control h-11 shrink-0 rounded-full bg-[#0A0A0A] px-4 text-xs font-medium text-white"
                    >
                      Create &amp; Save
                    </JellyButton>
                  </div>
                  {errorMsg && <p className="text-xs font-medium text-[#D64527]">{errorMsg}</p>}
                </form>
              ) : (
                <JellyButton
                  type="button"
                  onClick={() => setCreatingNew(true)}
                  className="liquid-glass-btn font-control flex h-11 w-full items-center justify-center gap-2 rounded-full text-[13px] font-medium text-[#0A0A0A]"
                >
                  <Reicon name="folder-plus" size={16} />
                  <span>Create New Folder</span>
                </JellyButton>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

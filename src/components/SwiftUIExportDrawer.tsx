import { useState } from 'react';
import { motion } from 'motion/react';
import { SWIFTUI_FILES } from '../data/swiftuiTemplates';
import { JellyButton } from './JellyButton';
import { Reicon } from './Reicon';

interface SwiftUIExportDrawerProps {
  isOpen: boolean;
  hasDemoData: boolean;
  onClose: () => void;
  onClearDemoData: () => void;
  onRestoreDemoData: () => void;
}

export function SwiftUIExportDrawer({
  isOpen,
  hasDemoData,
  onClose,
  onClearDemoData,
  onRestoreDemoData,
}: SwiftUIExportDrawerProps) {
  const [selectedFileId, setSelectedFileId] = useState(SWIFTUI_FILES[0].id);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const activeFile = SWIFTUI_FILES.find((f) => f.id === selectedFileId) ?? SWIFTUI_FILES[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([activeFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="SwiftUI Code Export and Demo Data Controls"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-xs sm:items-center sm:p-6"
    >
      <motion.div
        initial={{ y: 32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] bg-[#F7F7F9] p-6 sm:rounded-[28px]"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-neutral-500">
              OpenSwiftUI Compatible · Passport Utilities
            </p>
            <h2 className="font-display text-xl font-bold text-[#0A0A0A]">
              SwiftUI Views &amp; Data Controls
            </h2>
          </div>
          <JellyButton
            type="button"
            onClick={onClose}
            aria-label="Close SwiftUI export drawer"
            className="liquid-glass-btn flex h-11 w-11 items-center justify-center rounded-full text-[#0A0A0A]"
          >
            <Reicon name="close" size={20} />
          </JellyButton>
        </div>

        {/* Mock Data Cleanup Control */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-white p-4">
          <div>
            <p className="font-display text-sm font-semibold text-[#0A0A0A]">
              Prototype Mock Data
            </p>
            <p className="text-xs text-neutral-500">
              {hasDemoData
                ? 'Demo stamps and social posts are active. Clear them cleanly when design review is complete.'
                : 'Demo seed data is cleared. Only your custom stamps and posts remain.'}
            </p>
          </div>
          {hasDemoData ? (
            <JellyButton
              type="button"
              onClick={onClearDemoData}
              className="flex h-11 items-center gap-2 rounded-full bg-[#0A0A0A] px-4 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              <Reicon name="trash" size={15} />
              <span>Clear Demo Data</span>
            </JellyButton>
          ) : (
            <JellyButton
              type="button"
              onClick={onRestoreDemoData}
              className="liquid-glass-btn flex h-11 items-center gap-2 rounded-full px-4 text-xs font-semibold text-[#0A0A0A]"
            >
              <Reicon name="refresh" size={15} />
              <span>Restore Demo Data</span>
            </JellyButton>
          )}
        </div>

        {/* SwiftUI File Tabs */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {SWIFTUI_FILES.map((file) => (
            <JellyButton
              key={file.id}
              type="button"
              onClick={() => setSelectedFileId(file.id)}
              className={`flex h-10 shrink-0 items-center rounded-full px-4 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFile.id === file.id
                  ? 'bg-[#0A0A0A] text-white'
                  : 'liquid-glass-btn text-[#0A0A0A]'
              }`}
            >
              {file.filename}
            </JellyButton>
          ))}
        </div>

        {/* Code Viewer */}
        <div className="mt-3 overflow-hidden rounded-[22px] bg-[#111318] text-neutral-100">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-xs font-medium text-neutral-300">{activeFile.title}</span>
            <div className="flex items-center gap-2">
              <JellyButton
                type="button"
                onClick={handleCopy}
                className="flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3 text-xs font-medium text-white hover:bg-white/20"
              >
                <Reicon name={copied ? 'check' : 'copy'} size={14} />
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </JellyButton>
              <JellyButton
                type="button"
                onClick={handleDownload}
                className="flex h-9 items-center gap-1.5 rounded-full border border-white/25 bg-white/18 px-3 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/28"
              >
                <Reicon name="download" size={14} />
                <span>Download</span>
              </JellyButton>
            </div>
          </div>

          <pre className="max-h-[340px] overflow-auto p-4 font-mono text-[12px] leading-relaxed text-neutral-200">
            <code>{activeFile.code}</code>
          </pre>
        </div>
      </motion.div>
    </div>
  );
}

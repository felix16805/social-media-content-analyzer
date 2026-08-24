"use client";

/**
 * Dropzone.tsx
 * Full-page-width drag-and-drop zone with animated gradient border.
 * Falls back to a native file picker when clicked.
 */

import { useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";

export interface DropzoneProps {
  onFileAccepted: (file: File) => void;
  onFileRejected?: (reason: string) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

/** File-type pill shown in the dropzone */
function TypePill({ label, icon }: { label: string; icon: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "var(--text-secondary)",
      }}
    >
      <span>{icon}</span>
      {label}
    </span>
  );
}

export default function Dropzone({
  onFileAccepted,
  onFileRejected,
  disabled = false,
}: DropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        const code = rejected[0].errors[0].code;
        const msg =
          code === "file-invalid-type"
            ? "Unsupported file type. Please upload a PDF, PNG, or JPEG."
            : code === "file-too-large"
              ? "File is too large. Maximum size is 20 MB."
              : rejected[0].errors[0].message;
        onFileRejected?.(msg);
        return;
      }
      if (accepted.length > 0) onFileAccepted(accepted[0]);
    },
    [onFileAccepted, onFileRejected]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: ACCEPTED_TYPES,
      maxSize: MAX_SIZE_BYTES,
      multiple: false,
      disabled,
    });

  return (
    <div
      {...getRootProps()}
      className={`
        dropzone-glow relative flex flex-col items-center justify-center gap-5
        rounded-2xl border border-dashed px-8 py-16 text-center
        transition-all duration-300 cursor-pointer select-none
        ${isDragReject
          ? "border-red-500/40 bg-red-500/5"
          : isDragActive
            ? "border-violet-500/40 bg-violet-500/5 drag-active"
            : disabled
              ? "border-white/5 opacity-50 cursor-not-allowed"
              : "border-white/10 hover:border-white/20 hover:bg-white/[0.03] dropzone-glow"
        }
      `}
      aria-label="File upload area"
    >
      <input {...getInputProps()} id="file-upload-input" />

      {/* Icon */}
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-300
          ${isDragActive && !isDragReject
            ? "bg-violet-500/20 text-violet-400"
            : isDragReject
              ? "bg-red-500/20 text-red-400"
              : "bg-white/5 text-slate-400"
          }`}
      >
        {isDragReject ? (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : isDragActive ? (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 7.5m0 0L7.5 12M12 7.5v9" />
          </svg>
        ) : (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        )}
      </div>

      {/* Text */}
      {isDragReject ? (
        <p className="text-sm font-medium text-red-400">That file type isn&apos;t supported.</p>
      ) : isDragActive ? (
        <p className="text-base font-semibold text-violet-300">Release to analyze</p>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div>
            <p className="text-base font-medium" style={{ color: "var(--text-primary)" }}>
              Drag &amp; drop a file here
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              or{" "}
              <span
                className="font-medium"
                style={{
                  background: "linear-gradient(90deg, #a78bfa, #38bdf8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                click to browse
              </span>
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <TypePill label="PDF" icon="📄" />
            <TypePill label="PNG" icon="🖼️" />
            <TypePill label="JPEG" icon="📷" />
            <TypePill label="Max 20 MB" icon="📦" />
          </div>
        </div>
      )}
    </div>
  );
}

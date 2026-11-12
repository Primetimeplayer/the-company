"use client";

import { useRef, useState } from "react";
import { FileCheck2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UploadDropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [sampleLoaded, setSampleLoaded] = useState(false);

  function takeFiles(list: FileList | null) {
    if (!list) return;
    setFiles(Array.from(list).map((file) => file.name).slice(0, 6));
  }

  return (
    <section
      aria-labelledby="upload-heading"
      className={cn(
        "rounded-xl border-2 border-dashed border-slate-300 bg-white/70 px-5 py-6 transition-colors sm:px-7 sm:py-7",
        dragging && "border-brand-from bg-indigo-50/40",
      )}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        takeFiles(event.dataTransfer.files);
      }}
    >
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-brand-indigo sm:flex">
            <UploadCloud className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2
              id="upload-heading"
              className="text-[14px] font-semibold text-slate-900"
            >
              Upload your application documents
            </h2>
            <p className="mt-1 max-w-xl text-[12.5px] leading-relaxed text-slate-500">
              PDF, Excel, Word, JPG, PNG. Preview only — files stay on your device
              and nothing is uploaded in this demo.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <input
            ref={inputRef}
            id="application-files"
            type="file"
            multiple
            accept=".pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png"
            className="sr-only"
            onChange={(event) => takeFiles(event.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            Browse files
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setFiles([]);
              setSampleLoaded(true);
            }}
          >
            <FileCheck2 className="h-4 w-4" aria-hidden />
            Load sample project
          </Button>
        </div>
      </div>

      <div aria-live="polite" className="mt-3 text-[12px] text-slate-500">
        {files.length > 0 && (
          <p>
            Selected: {files.join(", ")} — not uploaded in this demo.
          </p>
        )}
        {files.length === 0 && sampleLoaded && (
          <p className="font-medium text-emerald-700">
            Sample project RSA-B-ELEC loaded — the checks below are already running
            against it.
          </p>
        )}
        {files.length === 0 && !sampleLoaded && (
          <p>Drag files here, or load the sample project to see the checks run.</p>
        )}
      </div>
    </section>
  );
}

import { useRef, useState, useCallback } from "react";

interface DocFile {
  file: File;
  previewUrl: string;
}

const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp", "heic", "heif", "pdf"];
const MAX_EACH_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_BYTES = 16 * 1024 * 1024;

function fileExt(name: string): string {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "";
}

function bytesToHuman(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1).replace(".", ",") + " KB";
  return (bytes / (1024 * 1024)).toFixed(1).replace(".", ",") + " MB";
}

function isPdf(file: File): boolean {
  return fileExt(file.name) === "pdf" || file.type === "application/pdf";
}

function isHeic(file: File): boolean {
  const ext = fileExt(file.name);
  return ext === "heic" || ext === "heif";
}

export function useDocumentUpload() {
  const [doc1, setDoc1] = useState<DocFile | null>(null);
  const [doc2, setDoc2] = useState<DocFile | null>(null);
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (slot: 1 | 2) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const ext = fileExt(file.name);
      if (!ALLOWED_EXTS.includes(ext)) {
        alert("Formato não permitido. Use JPG, PNG, WEBP, HEIC/HEIF ou PDF.");
        e.target.value = "";
        return;
      }

      if (file.size > MAX_EACH_BYTES) {
        alert(`Arquivo muito grande. Limite de ${bytesToHuman(MAX_EACH_BYTES)} por arquivo.`);
        e.target.value = "";
        return;
      }

      const url = URL.createObjectURL(file);
      const docFile = { file, previewUrl: url };

      if (slot === 1) {
        if (doc1) URL.revokeObjectURL(doc1.previewUrl);
        setDoc1(docFile);
      } else {
        if (doc2) URL.revokeObjectURL(doc2.previewUrl);
        setDoc2(docFile);
      }
    },
    [doc1, doc2]
  );

  const removeFile = useCallback(
    (slot: 1 | 2) => () => {
      if (slot === 1) {
        if (doc1) URL.revokeObjectURL(doc1.previewUrl);
        setDoc1(null);
        if (inputRef1.current) inputRef1.current.value = "";
      } else {
        if (doc2) URL.revokeObjectURL(doc2.previewUrl);
        setDoc2(null);
        if (inputRef2.current) inputRef2.current.value = "";
      }
    },
    [doc1, doc2]
  );

  const validate = useCallback((): string | null => {
    const files = [doc1?.file, doc2?.file].filter(Boolean) as File[];
    if (files.length < 1) return "Anexe seu documento (RG, CPF ou CNH).";
    
    let total = 0;
    for (const f of files) {
      total += f.size;
    }
    if (total > MAX_TOTAL_BYTES) {
      return `Arquivos muito grandes no total. Limite de ${bytesToHuman(MAX_TOTAL_BYTES)}.`;
    }
    return null;
  }, [doc1, doc2]);

  return {
    doc1, doc2,
    inputRef1, inputRef2,
    handleFileSelect,
    removeFile,
    validate,
    isPdf, isHeic, bytesToHuman,
  };
}

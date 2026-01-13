"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function MyDropzone() {
  const [dataURL, setDataURL] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setDataURL(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} className="border rounded-md p-6 text-center cursor-pointer">
      <input {...getInputProps()} />
      {dataURL ? (
        <img src={dataURL} className="mx-auto max-h-48" />
      ) : isDragActive ? (
        <p>Drop the file here</p>
      ) : (
        <p>Drag & drop a file, or click to select</p>
      )}
    </div>
  );
}

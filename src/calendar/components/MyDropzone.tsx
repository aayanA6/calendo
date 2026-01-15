"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Tesseract from "tesseract.js";

interface MyDropzoneProps {
  onTextExtracted?: (text: string) => void;
}

export default function MyDropzone({ onTextExtracted }: MyDropzoneProps) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const saveTextToServer = async (extractedText: string) => {
    try {
      const response = await fetch("/api/save-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: extractedText }),
      });

      if (!response.ok) {
        throw new Error("Failed to save file");
      }

      const data = await response.json();
      setSaved(true);
      console.log("File saved to:", data.path);
    } catch (err) {
      setError("Failed to save file to server");
      console.error(err);
    }
  };

  const extractPdfText = async (file: File) => {
    // Use pdf.js from CDN via script injection
    if (!(window as any).pdfjsLib) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    const pdfjsLib = (window as any).pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    let result = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      result += content.items.map((item: any) => item.str).join(" ") + "\n";
    }

    return result || "No text found in PDF";
  };

  const onDrop = useCallback(
    async (files: File[]) => {
      if (!files[0]) return;

      const file = files[0];
      setIsLoading(true);
      setText("");
      setSaved(false);
      setError("");

      try {
        let extractedText = "";

        if (file.type === "text/plain") {
          extractedText = await file.text();
        } else if (file.type === "application/pdf") {
          extractedText = await extractPdfText(file);
        } else if (file.type.startsWith("image/")) {
          const { data } = await Tesseract.recognize(file, "eng", {
            logger: m => console.log(m),
          });
          extractedText = data.text || "No text found in image";
        } else {
          setText("Unsupported file type");
          return;
        }

        setText(extractedText);
        onTextExtracted?.(extractedText);

        // Automatically save to server
        await saveTextToServer(extractedText);
      } catch (err) {
        console.error("Extraction error:", err);
        setText(`Error: ${err instanceof Error ? err.message : "Unknown error occurred"}`);
      } finally {
        setIsLoading(false);
      }
    },
    [onTextExtracted]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="space-y-2">
      <div {...getRootProps()} className="cursor-pointer rounded-md border border-gray-300 p-4 hover:border-gray-400">
        <input {...getInputProps()} />
        <p className="text-center text-gray-600">{isLoading ? "Extracting text from file..." : "Drag and drop a file here, or click to browse"}</p>
        {text && (
          <div className="mt-3">
            <p className="text-sm text-green-600">✓ Text extracted successfully ({text.length} characters)</p>
            {saved && <p className="mt-1 text-sm text-blue-600">✓ Saved to src/app/apis/userInput.txt</p>}
            {error && <p className="mt-1 text-sm text-red-600">✗ {error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

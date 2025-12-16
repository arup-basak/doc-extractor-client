"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadProps {
  onUploadSuccess: () => void;
  apiUrl: string;
}

export function FileUpload({ onUploadSuccess, apiUrl }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setError(null);
      setSuccess(false);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${apiUrl}/api/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        await response.json();
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onUploadSuccess();
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [apiUrl, onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <motion.div
      layout
      className="glass-panel rounded-xl border border-white/5 bg-background/40 backdrop-blur-xl shadow-2xl p-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Upload Invoice</h2>
        {uploading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
      </div>

      <div className="space-y-6">
        <motion.div
          layout
          {...(getRootProps() as any)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          animate={{
            scale: isDragActive ? 1.02 : 1,
            borderColor: isDragActive
              ? "var(--color-primary)"
              : "rgba(255,255,255,0.1)",
            backgroundColor: isDragActive
              ? "rgba(var(--primary), 0.05)"
              : "transparent",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={`group relative cursor-pointer flex flex-col items-center justify-center rounded-xl p-10 text-center focus:outline-none border-2 border-dashed ${
            uploading ? "border-primary bg-primary/5 cursor-default" : ""
          }`}
        >
          <input {...getInputProps()} />
          <motion.div
            className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: isDragActive ? 1 : 0 }}
          />

          <AnimatePresence mode="wait">
            {uploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative z-10 flex flex-col items-center text-primary"
              >
                <Loader2 className="w-16 h-16 mb-4 animate-spin" />
                <span className="font-medium text-lg">
                  Processing document...
                </span>
                <span className="text-sm opacity-80 mt-1">
                  Please wait while we analyze your file
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative z-10 flex flex-col items-center"
              >
                <motion.div
                  animate={{
                    y: isDragActive ? -10 : 0,
                    scale: isDragActive ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center mb-6 shadow-xl shadow-black/5"
                >
                  <Upload className="w-10 h-10 text-primary" />
                </motion.div>
                <span className="text-foreground font-medium text-xl mb-2">
                  {isDragActive
                    ? "Drop to upload!"
                    : "Click to upload or drag and drop"}
                </span>
                <span className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  Supports PDF, PNG, JPG, WebP, or TXT
                  <br />
                  <span className="text-xs opacity-70">(Max 16MB)</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert
                variant="destructive"
                className="bg-destructive/10 border-destructive/20 text-destructive"
              >
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert className="bg-green-500/10 border-green-500/20 text-green-500">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Invoice uploaded and processed successfully!
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

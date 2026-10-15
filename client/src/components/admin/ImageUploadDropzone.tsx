import { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';

interface ImageUploadDropzoneProps {
  onUploadSuccess: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  folder?: string;
  label?: string;
  subLabel?: string;
  compact?: boolean;
}

export default function ImageUploadDropzone({
  onUploadSuccess,
  multiple = false,
  maxFiles = 10,
  folder = 'phantom/products',
  label = 'Upload Image Assets via Cloudinary',
  subLabel = 'Auto-optimized with f_auto, q_auto for zero lag and lossless delivery',
  compact = false
}: ImageUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setSuccessMsg(null);

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        setError(`"${file.name}" is not an image file.`);
        return;
      }
      if (file.size > 12 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 12MB limit.`);
        return;
      }
      validFiles.push(file);
    }

    if (!multiple && validFiles.length > 1) {
      setError('Please select only one image for this field.');
      return;
    }

    if (validFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} images can be uploaded at once.`);
      return;
    }

    setUploading(true);

    try {
      if (multiple) {
        const formData = new FormData();
        validFiles.forEach((file) => formData.append('images', file));
        formData.append('folder', folder);

        const res = await axios.post('/api/upload/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });

        if (res.data?.success && Array.isArray(res.data.urls)) {
          onUploadSuccess(res.data.urls);
          setSuccessMsg(
            `${res.data.urls.length} image${res.data.urls.length > 1 ? 's' : ''} uploaded and optimized via Cloudinary.`
          );
          setTimeout(() => setSuccessMsg(null), 4000);
        } else {
          setError(res.data?.message || 'Failed to upload images.');
        }
      } else {
        const formData = new FormData();
        formData.append('image', validFiles[0]);
        formData.append('folder', folder);

        const res = await axios.post('/api/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });

        if (res.data?.success && res.data.url) {
          onUploadSuccess([res.data.url]);
          setSuccessMsg('Image uploaded and optimized via Cloudinary.');
          setTimeout(() => setSuccessMsg(null), 4000);
        } else {
          setError(res.data?.message || 'Failed to upload image.');
        }
      }
    } catch (err: any) {
      console.error('Upload Error:', err);
      setError(
        err.response?.data?.message ||
        'Error uploading file. Please verify network connection or Cloudinary credentials.'
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-2 select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
          compact ? 'p-4 sm:p-5' : 'p-6 sm:p-8'
        } ${
          isDragging
            ? 'border-orange-500 bg-orange-950/20'
            : 'border-neutral-800 hover:border-neutral-700 bg-black/60 hover:bg-neutral-900/40'
        } ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
      >
        {uploading ? (
          <div className="space-y-2 flex flex-col items-center">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
            <p className="text-xs font-mono uppercase tracking-wider text-orange-400">
              Streaming & Optimizing via Cloudinary CDN...
            </p>
            <p className="text-[10px] text-neutral-500 font-mono">
              Applying f_auto (AVIF/WebP) & perceptual q_auto compression
            </p>
          </div>
        ) : (
          <div className="space-y-2 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-orange-400 shadow-sm">
              <UploadCloud className="w-5 h-5 stroke-[1.8]" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white font-mono">
                {label}
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5 max-w-sm">
                Drag and drop files here, or <span className="text-orange-400 underline underline-offset-2">browse disk</span>
              </p>
              {subLabel && (
                <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                  {subLabel}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[9px] font-mono uppercase tracking-wider text-neutral-400">
                <Sparkles className="w-2.5 h-2.5 text-orange-400" /> Cloudinary f_auto / q_auto
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">
                {multiple ? `Up to ${maxFiles} assets (JPG, PNG, WebP)` : 'Single Asset'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 bg-red-950/40 border border-red-500/40 rounded text-red-300 text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded text-emerald-300 text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
}

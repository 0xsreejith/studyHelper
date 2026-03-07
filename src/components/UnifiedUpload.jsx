import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { CheckCircle2, FileText, UploadCloud, X } from 'lucide-react';

const UnifiedUpload = ({ onFileSelect, multiple = false, maxFiles = 1, className = '' }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles) => {
      setError(null);
      if (acceptedFiles.length > 0) {
        const nextFiles = multiple ? acceptedFiles : [acceptedFiles[0]];
        setFiles(nextFiles);
        if (onFileSelect) onFileSelect(multiple ? nextFiles : nextFiles[0]);
      }
    },
    [onFileSelect, multiple]
  );

  const onDropRejected = useCallback((rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Upload a PDF or DOCX.');
      } else if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File is too large. Maximum size is 50MB.');
      } else {
        setError('File upload failed. Please try again.');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles,
    maxSize: 50 * 1024 * 1024,
  });

  const removeFile = (index) => {
    const nextFiles = multiple ? files.filter((_, i) => i !== index) : [];
    setFiles(nextFiles);
    if (onFileSelect) onFileSelect(multiple ? nextFiles : nextFiles[0] || null);
    setError(null);
  };

  return (
    <div className={className}>
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-red-400/35 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="rounded-full p-1 transition hover:bg-red-400/20"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <motion.div
        {...getRootProps()}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.22 }}
        className={`glass-card relative cursor-pointer overflow-hidden border-2 border-dashed p-7 text-center sm:p-12 ${
          isDragActive ? 'border-ai-accent bg-ai-accent/10' : 'border-white/25'
        }`}
      >
        <input {...getInputProps()} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ai-primary/5 via-ai-secondary/5 to-ai-accent/5" />

        {files.length === 0 ? (
          <div className="relative mx-auto max-w-2xl">
            <motion.div
              animate={{ y: [0, -7, 0], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
              className="mx-auto mb-5 inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-ai-accent/35 bg-ai-accent/10 text-ai-accent"
            >
              <UploadCloud size={34} />
            </motion.div>
            <h3 className="text-xl font-semibold text-white sm:text-2xl">
              Drag &amp; Drop your PDF here or click to upload
            </h3>
            <p className="mt-3 text-sm text-slate-300">
              Fast upload with instant extraction and Malayalam translation.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-200/80">
              <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1">PDF</span>
              <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1">DOCX</span>
              <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1">Max 50MB</span>
            </div>
            <div className="mt-6">
              <span className="btn-primary text-sm">Choose File</span>
            </div>
          </div>
        ) : (
          <div className="relative space-y-4">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300">
              <CheckCircle2 size={30} />
            </div>
            <div className="mx-auto max-w-xl space-y-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between rounded-2xl border border-white/15 bg-black/25 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText size={18} className="text-ai-accent" />
                    <div className="min-w-0 text-left">
                      <p className="truncate text-sm font-medium text-white">{file.name}</p>
                      <p className="text-xs text-slate-300">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="rounded-full border border-red-300/30 bg-red-400/10 p-2 text-red-200 transition hover:bg-red-400/20"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            {multiple && <p className="text-xs text-slate-300">Click to add more files</p>}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UnifiedUpload;

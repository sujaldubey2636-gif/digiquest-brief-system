import React, { useRef, useState } from 'react';
import { Upload, X, File, Image } from 'lucide-react';

export default function FileUpload({ 
  label, 
  accept = '.pdf,.doc,.docx,.txt,.jpg,.png,.mp4', 
  multiple = false, 
  files = [], 
  onChange, 
  maxSizeMB = 50 
}) {
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateAndAddFiles = (fileList) => {
    setError('');
    const newFiles = Array.from(fileList);
    const validFiles = [];

    for (const file of newFiles) {
      // Size check
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        setError(`File ${file.name} exceeds the ${maxSizeMB}MB limit.`);
        return;
      }
      
      validFiles.push(file);
    }

    if (multiple) {
      onChange([...files, ...validFiles]);
    } else {
      onChange(validFiles.slice(0, 1));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
  };

  const removeFile = (indexToRemove, e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(files.filter((_, idx) => idx !== indexToRemove));
  };

  const triggerInputClick = () => {
    fileInputRef.current.click();
  };

  const isImageFile = (fileName) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  };

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerInputClick}
        style={{
          border: '2px dashed',
          borderColor: isDragActive ? 'var(--primary)' : 'var(--border-color)',
          borderRadius: '10px',
          backgroundColor: isDragActive ? 'rgba(59, 130, 246, 0.05)' : 'rgba(17, 24, 39, 0.3)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'var(--transition-all)',
          position: 'relative'
        }}
      >
        <input 
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <div style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <Upload size={28} className={isDragActive ? 'text-info' : 'text-muted'} />
          <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            <span style={{ color: 'var(--primary)' }}>Click to upload</span> or drag and drop
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            PDF, DOCX, TXT, images, or MP4 (Max {maxSizeMB}MB)
          </p>
        </div>
      </div>

      {error && (
        <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 500 }}>
          {error}
        </p>
      )}

      {/* Render selected files */}
      {files.length > 0 && (
        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {files.map((file, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '0.8125rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                {isImageFile(file.name) ? (
                  <Image size={16} className="text-info" />
                ) : (
                  <File size={16} className="text-muted" />
                )}
                <span 
                  style={{ 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    maxWidth: '250px',
                    color: '#ffffff'
                  }}
                  title={file.name}
                >
                  {file.name}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                  ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
              <button 
                onClick={(e) => removeFile(index, e)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px'
                }}
              >
                <X size={14} className="text-danger" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

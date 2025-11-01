import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  label?: string;
  currentImage?: string | null;
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  error?: string;
  hint?: string;
  required?: boolean;
  maxSizeMB?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  currentImage,
  onImageSelect,
  onImageRemove,
  error,
  hint,
  required,
  maxSizeMB = 5,
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Validar tamanho
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert(`Arquivo muito grande! Tamanho máximo: ${maxSizeMB}MB`);
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas imagens!');
      return;
    }

    // Gerar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Notificar pai
    onImageSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove?.();
  };

  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div
        className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''} ${
          error ? styles.error : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className={styles.fileInput}
        />

        {preview ? (
          <div className={styles.previewContainer}>
            <img src={preview} alt='Preview' className={styles.preview} />
            <button
              type='button'
              className={styles.removeButton}
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className={styles.placeholder}>
            {isDragging ? (
              <Upload size={32} className={styles.icon} />
            ) : (
              <ImageIcon size={32} className={styles.icon} />
            )}
            <p className={styles.text}>
              {isDragging
                ? 'Solte a imagem aqui'
                : 'Clique ou arraste uma imagem'}
            </p>
            <p className={styles.subtext}>
              Máximo {maxSizeMB}MB (JPG, PNG, GIF, WEBP)
            </p>
          </div>
        )}
      </div>

      {error && <span className={styles.errorMessage}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  );
};

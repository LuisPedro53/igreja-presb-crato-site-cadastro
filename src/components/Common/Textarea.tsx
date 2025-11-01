import React, { forwardRef } from 'react';
import styles from './Textarea.module.css';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, required, ...props }, ref) => {
    return (
      <div className={styles.container}>
        {label && (
          <label className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          className={`${styles.textarea} ${error ? styles.error : ''} ${
            className || ''
          }`}
          {...props}
        />

        {error && <span className={styles.errorMessage}>{error}</span>}
        {hint && !error && <span className={styles.hint}>{hint}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

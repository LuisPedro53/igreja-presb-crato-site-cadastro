import {
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  forwardRef,
} from 'react';
import styles from './Input.module.css';

interface BaseInputProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

type InputProps = BaseInputProps & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseInputProps &
  TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, className = '', ...props }, ref) => {
    const inputClasses = [styles.input, error && styles.error, className]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={styles.inputWrapper}>
        {label && (
          <label htmlFor={props.id || props.name} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
        <input ref={ref} className={inputClasses} {...props} />
        {error && <span className={styles.errorMessage}>{error}</span>}
        {hint && !error && <span className={styles.hint}>{hint}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, required, className = '', ...props }, ref) => {
    const textareaClasses = [
      styles.input,
      styles.textarea,
      error && styles.error,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={styles.inputWrapper}>
        {label && (
          <label htmlFor={props.id || props.name} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
        <textarea ref={ref} className={textareaClasses} {...props} />
        {error && <span className={styles.errorMessage}>{error}</span>}
        {hint && !error && <span className={styles.hint}>{hint}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

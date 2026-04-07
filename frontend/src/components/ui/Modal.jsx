import { useEffect, useId } from 'react';
import ReactDOM from 'react-dom';
import Button from './Button';
import { Heading, Text } from './Typography';
import './Modal.css';

/**
 * SweetPress Modal — 공통 다이얼로그
 * @param {boolean} open
 * @param {string} title
 * @param {string} message
 * @param {() => void} onClose
 * @param {'info'|'error'|'success'|'danger'} variant
 * @param {string} confirmText
 * @param {string} cancelText
 * @param {() => void} [onConfirm]
 */
function Modal({
  open,
  title,
  message,
  onClose,
  onConfirm,
  variant = 'info',
  confirmText = '확인',
  cancelText = '취소',
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropClick = () => onClose?.();
  const stop = (e) => e.stopPropagation();

  return ReactDOM.createPortal(
    <div className="sp-modal__backdrop" onClick={handleBackdropClick}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`sp-modal sp-modal--${variant}`}
        onClick={stop}
      >
        <div className={`sp-modal__accent sp-modal__accent--${variant}`} aria-hidden="true" />
        <div className="sp-modal__body">
          <Heading level={3} id={titleId} className={`sp-modal__title sp-modal__title--${variant}`}>
            {title}
          </Heading>
          {message && (
            <Text size="sm" tone="secondary" className="sp-modal__message">
              {message}
            </Text>
          )}
          <div className="sp-modal__actions">
            {onConfirm ? (
              <>
                <Button variant="secondary" size="md" onClick={onClose}>
                  {cancelText}
                </Button>
                <Button
                  variant={variant === 'danger' ? 'accent' : 'primary'}
                  size="md"
                  onClick={onConfirm}
                >
                  {confirmText}
                </Button>
              </>
            ) : (
              <Button variant="primary" size="md" onClick={onClose}>
                {confirmText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;

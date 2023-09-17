import React, { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title?: ReactNode;
  className?: string;
  children?: ReactNode;
  cancelBtnText?: ReactNode;
  confirmBtnText?: ReactNode;
  onCancel?: () => void;
  onConfirm?: () => void;
  canSubmit?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  title,
  open,
  children,
  onCancel = () => {},
  onConfirm,
  cancelBtnText = 'Cancel',
  confirmBtnText = 'Done',
  className,
  canSubmit = true,
}) => {
  return (
    <dialog onClose={onCancel} open={open} className="modal modal-middle">
      <form method="dialog" className={`modal-box ${className}`}>
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <h3 className="font-bold text-lg">{title}</h3>
        {children}
        <div className="modal-action">
          {cancelBtnText && (
            <button onClick={onCancel} className="btn">
              {cancelBtnText}
            </button>
          )}
          {confirmBtnText && (
            <button disabled={!canSubmit} onClick={onConfirm} className="btn btn-primary !ml-4">
              {confirmBtnText}
            </button>
          )}
        </div>
      </form>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default Modal;

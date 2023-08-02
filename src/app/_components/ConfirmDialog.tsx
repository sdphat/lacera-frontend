import React from 'react';

interface AddGroupModalProps {
  open: boolean;
  title?: string;
  message?: string;
  onCancel?: () => void;
  onConfirm: () => void;
}

const ConfirmDialog: React.FC<AddGroupModalProps> = ({
  title,
  message = 'Are you sure?',
  open,
  onCancel = () => {},
  onConfirm,
}) => {
  return (
    <dialog onClose={onCancel} open={open} className="modal modal-middle">
      <form method="dialog" className="modal-box">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="mt-9">{message} </div>

        <div className="modal-action">
          <button onClick={onCancel} className="btn">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-primary !ml-4">
            Confirm
          </button>
        </div>
      </form>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default ConfirmDialog;

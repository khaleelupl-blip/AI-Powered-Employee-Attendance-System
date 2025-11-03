import React from 'react';
import Button from '../shared/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{title}</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-300">{message}</p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
          <Button variant="danger" onClick={onConfirm} className="sm:ml-3 sm:w-auto">
            Confirm
          </Button>
          <Button variant="secondary" onClick={onClose} className="mt-3 sm:mt-0 sm:w-auto">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

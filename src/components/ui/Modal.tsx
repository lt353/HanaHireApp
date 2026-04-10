import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Wider panel for dense content (e.g. full profile preview). */
  wide?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  wide = false,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'relative';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Render modal using portal at document root - SIMPLIFIED VERSION
  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
      style={{
        zIndex: 999999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onClick={(e) => {
        // Close modal when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`bg-white rounded-[2rem] sm:rounded-[3rem] w-full overflow-hidden shadow-2xl max-h-[90vh] flex flex-col relative ${wide ? "max-w-3xl" : "max-w-lg"}`}
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 1000000 }}
      >
        <div className="px-4 py-6 sm:p-8 border-b border-gray-50 flex justify-between items-center shrink-0">
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tighter">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors hover:scale-110 active:scale-95"
            type="button"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
        <div className="px-4 py-6 sm:p-8 pb-24 sm:pb-8 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

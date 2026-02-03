import React from "react";
import { X } from "lucide-react";
import { motion } from "motion/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 50 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: 50 }} 
        className="bg-white rounded-[2rem] sm:rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
      >
        <div className="px-4 py-6 sm:p-8 border-b border-gray-50 flex justify-between items-center shrink-0">
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tighter">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
        <div className="px-4 py-6 sm:p-8 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </div>
  );
};
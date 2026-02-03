import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CollapsibleFilterProps {
  title: string;
  isOpen?: boolean;
  children: React.ReactNode;
}

export const CollapsibleFilter: React.FC<CollapsibleFilterProps> = ({ 
  title, 
  isOpen: initialOpen = false, 
  children 
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between group"
      >
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-[#0077BE] transition-colors">
          {title}
        </span>
        {isOpen ? (
          <ChevronUp size={16} className="text-gray-300 group-hover:text-[#0077BE]" />
        ) : (
          <ChevronDown size={16} className="text-gray-300 group-hover:text-[#0077BE]" />
        )}
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-8 flex flex-wrap gap-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

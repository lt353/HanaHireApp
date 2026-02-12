import React from "react";
import { Briefcase, User, Trash2, ChevronDown, ChevronUp, FolderOpen } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../ui/button";
import { formatCandidateTitle } from "../../utils/formatters";

interface CartProps {
  role: 'seeker' | 'employer';
  queue: any[];
  onRemoveFromQueue: (id: number) => void;
  onNavigate: (tab: string) => void;
  onShowPayment: (target: any) => void;
  interactionFee: number;
  isPaymentModalOpen?: boolean;
}

export const Cart: React.FC<CartProps> = ({
  role,
  queue,
  onRemoveFromQueue,
  onNavigate,
  onShowPayment,
  interactionFee,
  isPaymentModalOpen = false
}) => {
  const [expandedId, setExpandedId] = React.useState<number | null>(null);
  const total = queue.length * interactionFee;

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24 space-y-12 sm:space-y-16 pb-48 sm:pb-16">
      {/* Updated heading with folder icon */}
      <div className="flex items-center gap-4">
        <FolderOpen size={48} className="text-[#0077BE]" />
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter">Saved Items</h2>
      </div>

      {queue.length === 0 ? (
        <div className="p-12 sm:p-16 md:p-32 bg-white border-4 border-dashed border-gray-100 rounded-[2rem] sm:rounded-[3rem] md:rounded-[5rem] text-center space-y-6 sm:space-y-8">
          <FolderOpen size={48} className="sm:w-16 sm:h-16 text-gray-100 mx-auto" />
          <p className="text-gray-400 font-black text-lg sm:text-xl md:text-2xl uppercase tracking-widest">No saved items yet</p>
          <div className="flex justify-center">
            <Button className="h-14 sm:h-16 md:h-20 px-6 sm:px-8 md:px-12 text-sm sm:text-base md:text-lg bg-[#0077BE] hover:bg-[#0077BE]/90 text-white" onClick={() => onNavigate(role === 'seeker' ? 'jobs' : 'candidates')}>
              Start Browsing
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {queue.map(item => (
                <div key={item.id} className="bg-white border border-gray-100 rounded-[2rem] sm:rounded-[3rem] lg:rounded-[3.5rem] overflow-hidden shadow-sm group transition-all hover:shadow-xl">
                  <div className="p-4 sm:p-6 lg:p-10 flex items-center justify-between gap-2 sm:gap-4 cursor-pointer" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                    <div className="flex items-center gap-2 sm:gap-4 lg:gap-8 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-[1rem] sm:rounded-[1.5rem] lg:rounded-[2rem] bg-[#0077BE]/5 flex items-center justify-center text-[#0077BE] shadow-inner group-hover:rotate-6 transition-transform shrink-0">
                        {role === 'seeker' ? <Briefcase size={20} className="sm:w-8 sm:h-8" /> : <User size={20} className="sm:w-8 sm:h-8" />}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1 sm:space-y-2">
                        <h3 className="font-black text-base sm:text-xl lg:text-2xl tracking-tight truncate">
                          {role === 'seeker' ? item.title : formatCandidateTitle(item)}
                        </h3>
                        <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-400 truncate">
                          {role === 'seeker' ? item.location : item.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      {/* Removed price - now only shown at checkout */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFromQueue(item.id);
                        }}
                        className="p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl bg-gray-50 text-gray-400 hover:bg-[#FF6B6B]/10 hover:text-[#FF6B6B] transition-all shrink-0"
                        aria-label="Remove from queue"
                      >
                        <Trash2 size={16} className="sm:w-5 sm:h-5" />
                      </button>
                      <button className="p-2 shrink-0" aria-label="Toggle details">
                        {expandedId === item.id ? <ChevronUp size={20} className="sm:w-6 sm:h-6 text-gray-400" /> : <ChevronDown size={20} className="sm:w-6 sm:h-6 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  {expandedId === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 p-4 sm:p-6 lg:p-10 bg-gray-50/50 space-y-3 sm:space-y-4"
                    >
                      {role === 'seeker' ? (
                        <>
                          <div className="flex flex-wrap gap-2 sm:gap-3">
                            <span className="px-3 sm:px-4 py-2 bg-white border border-gray-100 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-600">
                              {item.job_type}
                            </span>
                            <span className="px-3 sm:px-4 py-2 bg-white border border-gray-100 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-600">
                              {item.pay_range}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{item.description}</p>
                          )}
                        </>
                      ) : (
                        <>
                          {Array.isArray(item.skills) && item.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {item.skills.map((s: string, i: number) => (
                                <span key={i} className="px-3 sm:px-4 py-2 bg-white border border-gray-100 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-600">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.bio && (
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{item.bio}</p>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop checkout sidebar */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-2xl space-y-12 sticky top-24">
                <h3 className="text-4xl font-black tracking-tight">Review & Unlock</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="text-lg font-bold">Items ({queue.length})</span>
                    <span className="text-lg font-bold">${(queue.length * interactionFee).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-100 pt-8">
                    <span className="text-3xl font-black tracking-tight">Total</span>
                    <span className="text-5xl font-black text-[#0077BE] tracking-tighter">${total.toFixed(2)}</span>
                  </div>
                </div>
                <Button 
                  className="w-full h-24 text-2xl rounded-3xl shadow-xl shadow-[#0077BE]/20 bg-[#0077BE] hover:bg-[#0077BE]/90 text-white" 
                  onClick={() => onShowPayment({ type: role, items: queue })}
                >
                  {role === 'seeker' ? 'Apply to All Jobs' : 'Unlock All Profiles'}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile checkout button - Fixed at bottom */}
          {!isPaymentModalOpen && (
            <div className="lg:hidden fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-2xl z-40">
              <div className="max-w-5xl mx-auto space-y-3">
                <div className="flex justify-between items-center px-2">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      {queue.length} {queue.length === 1 ? 'Item' : 'Items'}
                    </span>
                    <span className="block text-3xl font-black text-[#0077BE] tracking-tighter">${total.toFixed(2)}</span>
                  </div>
                </div>
                <Button 
                  className="w-full h-16 text-lg rounded-2xl shadow-xl shadow-[#0077BE]/20 bg-[#0077BE] hover:bg-[#0077BE]/90 text-white" 
                  onClick={() => onShowPayment({ type: role, items: queue })}
                >
                  {role === 'seeker' ? 'Apply to All Jobs' : 'Unlock All Profiles'}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
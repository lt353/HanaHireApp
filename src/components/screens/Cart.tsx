import React from "react";
import { Briefcase, User, Trash2, ChevronDown, ChevronUp } from "lucide-react";
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
  isPaymentModalOpen?: boolean;  // ADD THIS LINE
}

export const Cart: React.FC<CartProps> = ({
  role,
  queue,
  onRemoveFromQueue,
  onNavigate,
  onShowPayment,
  interactionFee,
  isPaymentModalOpen = false  // ADD THIS LINE
}) => {
  const [expandedId, setExpandedId] = React.useState<number | null>(null);
  const total = queue.length * interactionFee;

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24 space-y-12 sm:space-y-16 pb-48 sm:pb-16">
      <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter">My Cart</h2>
      {queue.length === 0 ? (
        <div className="p-12 sm:p-16 md:p-32 bg-white border-4 border-dashed border-gray-100 rounded-[2rem] sm:rounded-[3rem] md:rounded-[5rem] text-center space-y-6 sm:space-y-8">
          <Briefcase size={48} className="sm:w-16 sm:h-16 text-gray-100 mx-auto" />
          <p className="text-gray-400 font-black text-lg sm:text-xl md:text-2xl uppercase tracking-widest">Your cart is empty</p>
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
  {role === 'seeker' ? <Briefcase size={16} className="sm:w-6 sm:h-6 lg:w-8 lg:h-8" /> : <User size={16} className="sm:w-6 sm:h-6 lg:w-8 lg:h-8" />}
</div>
                      <div className="min-w-0 flex-1 overflow-hidden">
  <p className="text-sm sm:text-base lg:text-2xl font-black tracking-tight leading-tight break-words line-clamp-2">
    {role === 'seeker' ? item.title : formatCandidateTitle(item)}
  </p>
  <p className="text-[9px] sm:text-[10px] text-gray-400 font-black uppercase tracking-widest pt-1 sm:pt-2 truncate">{item.location} • ${interactionFee.toFixed(2)} Fee</p>
</div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        className="p-1.5 sm:p-2 lg:p-4 text-gray-300 hover:text-[#0077BE] rounded-full transition-all"
                      >
                        {expandedId === item.id ? <ChevronUp size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" /> : <ChevronDown size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />}
                      </button>
                      <button 
                        onClick={() => onRemoveFromQueue(item.id)} 
                        className="p-2 sm:p-3 lg:p-6 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-[1rem] sm:rounded-[1.5rem] lg:rounded-[2rem] transition-all"
                      >
                        <Trash2 size={20} className="sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                      </button>
                    </div>
                  </div>
                  
                  {expandedId === item.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="px-4 sm:px-6 lg:px-10 pb-6 sm:pb-8 lg:pb-10 border-t border-gray-50 pt-6 sm:pt-8 space-y-4 sm:space-y-6 overflow-x-hidden"
                    >
                      {role === 'employer' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                          <div className="space-y-3 sm:space-y-4 overflow-hidden">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Experience & Availability</h4>
                            <div className="space-y-2">
                              <p className="text-xs sm:text-sm font-bold text-gray-600 break-words">Years: <span className="text-gray-900">{item.years_experience}</span></p>
                              <p className="text-xs sm:text-sm font-bold text-gray-600 break-words">Availability: <span className="text-gray-900">{item.availability}</span></p>
                              <p className="text-xs sm:text-sm font-bold text-gray-600 break-words">Status: <span className="text-gray-900">{item.current_employment_status}</span></p>
                            </div>
                          </div>
                          <div className="space-y-3 sm:space-y-4 overflow-hidden">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {item.skills?.map((s: string, i: number) => (
                                <span key={i} className="px-2 sm:px-3 py-1 bg-gray-50 text-[9px] sm:text-[10px] font-black text-gray-500 rounded-lg uppercase tracking-widest break-words">{s}</span>
                              ))}
                            </div>
                          </div>
                          <div className="col-span-1 md:col-span-2 space-y-3 sm:space-y-4 overflow-hidden">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Professional Bio</h4>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed italic break-words">"{item.bio}"</p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                          <div className="space-y-3 sm:space-y-4 overflow-hidden">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Role Details</h4>
                            <div className="space-y-2">
                              <p className="text-xs sm:text-sm font-bold text-gray-600 break-words">Industry: <span className="text-gray-900">{item.company_industry}</span></p>
                              <p className="text-xs sm:text-sm font-bold text-gray-600 break-words">Pay Range: <span className="text-gray-900">{item.pay_range}</span></p>
                              <p className="text-xs sm:text-sm font-bold text-gray-600 break-words">Type: <span className="text-gray-900">{item.job_type}</span></p>
                            </div>
                          </div>
                          <div className="space-y-3 sm:space-y-4 overflow-hidden">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Summary</h4>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed truncate-3-lines break-words">{item.description}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
            {/* Checkout sidebar - HIDDEN ON MOBILE */}
            <div className="hidden lg:block space-y-12">
              <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-2xl space-y-12 sticky top-24">
                <h3 className="text-4xl font-black tracking-tight">Checkout</h3>
                <div className="flex justify-between items-center border-t border-gray-100 pt-8">
                  <span className="text-3xl font-black tracking-tight">Total Due</span>
                  <span className="text-5xl font-black text-[#0077BE] tracking-tighter">${total.toFixed(2)}</span>
                </div>
                <Button 
                  className="w-full h-24 text-2xl rounded-3xl shadow-xl shadow-[#0077BE]/20 bg-[#0077BE] hover:bg-[#0077BE]/90 text-white" 
                  onClick={() => onShowPayment({ type: role, items: queue })}
                >
                  Confirm & Pay
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile checkout button - Fixed at bottom - NOW WITH CONDITIONAL RENDERING */}
          {!isPaymentModalOpen && (
            <div className="lg:hidden fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-2xl z-40">
              <div className="max-w-5xl mx-auto space-y-3">
                <div className="flex justify-between items-center px-2">
                  <span className="text-lg font-black tracking-tight text-gray-600">Total</span>
                  <span className="text-3xl font-black text-[#0077BE] tracking-tighter">${total.toFixed(2)}</span>
                </div>
                <Button 
                  className="w-full h-16 text-lg rounded-2xl shadow-xl shadow-[#0077BE]/20 bg-[#0077BE] hover:bg-[#0077BE]/90 text-white" 
                  onClick={() => onShowPayment({ type: role, items: queue })}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
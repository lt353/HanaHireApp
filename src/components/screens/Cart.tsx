import React from "react";
import { Briefcase, User, Trash2, ChevronDown, ChevronUp, FolderOpen, Lock } from "lucide-react";
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
                      {role === 'seeker' ? (
                        <div className="w-10 h-10 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-[1rem] sm:rounded-[1.5rem] lg:rounded-[2rem] bg-[#0077BE]/5 flex items-center justify-center text-[#0077BE] shadow-inner group-hover:rotate-6 transition-transform shrink-0">
                          <Briefcase size={20} className="sm:w-8 sm:h-8" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-[1rem] sm:rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden bg-gray-200 shrink-0 relative">
                          {(item.thumbnail || item.video_thumbnail_url) ? (
                            <>
                              <img
                                src={item.thumbnail || item.video_thumbnail_url}
                                className="w-full h-full object-cover blur-[7px] scale-110"
                                alt=""
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                <Lock size={12} className="text-white" />
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <User size={20} className="sm:w-8 sm:h-8" />
                            </div>
                          )}
                        </div>
                      )}

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
                          {/* Tags row */}
                          <div className="flex flex-wrap gap-2 sm:gap-3">
                            {item.job_type && <span className="px-3 sm:px-4 py-2 bg-white border border-gray-100 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-600">{item.job_type}</span>}
                            {item.pay_range && <span className="px-3 sm:px-4 py-2 bg-white border border-gray-100 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#2ECC71]">{item.pay_range}</span>}
                            {item.company_industry && <span className="px-3 sm:px-4 py-2 bg-[#0077BE]/5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#0077BE]">{item.company_industry}</span>}
                            {item.company_size && <span className="px-3 sm:px-4 py-2 bg-white border border-gray-100 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-600">{item.company_size}</span>}
                            {item.start_date && <span className="px-3 sm:px-4 py-2 bg-white border border-gray-100 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-600">Start: {item.start_date}</span>}
                          </div>
                          {/* Description */}
                          {item.description && <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{item.description}</p>}
                          {/* Requirements */}
                          {Array.isArray(item.requirements) && item.requirements.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Requirements</span>
                              <div className="flex flex-wrap gap-2">
                                {item.requirements.map((r: string, i: number) => (
                                  <span key={i} className="px-3 py-1.5 bg-[#0077BE]/5 text-[#0077BE] rounded-lg text-[10px] font-black uppercase tracking-widest">{r}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Responsibilities */}
                          {Array.isArray(item.responsibilities) && item.responsibilities.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Responsibilities</span>
                              <ul className="space-y-1.5">
                                {item.responsibilities.map((r: string, i: number) => (
                                  <li key={i} className="flex gap-2 items-start text-xs text-gray-600">
                                    <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#0077BE] shrink-0" />
                                    {r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {/* Benefits */}
                          {Array.isArray(item.benefits) && item.benefits.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Benefits</span>
                              <div className="flex flex-wrap gap-2">
                                {item.benefits.map((b: string, i: number) => (
                                  <span key={i} className="px-3 py-1.5 bg-[#2ECC71]/5 text-[#2ECC71] rounded-lg text-[10px] font-black uppercase tracking-widest">{b}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Skills chips */}
                          {Array.isArray(item.skills) && item.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {item.skills.map((s: string, i: number) => (
                                <span key={i} className="px-3 sm:px-4 py-2 bg-white border border-gray-100 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-600">{s}</span>
                              ))}
                            </div>
                          )}
                          {/* Bio */}
                          {item.bio && <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{item.bio}</p>}
                          {/* Details grid */}
                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            {item.years_experience && (
                              <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-1">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Experience</span>
                                <p className="text-xs font-black text-gray-900">{item.years_experience} Years</p>
                              </div>
                            )}
                            {item.availability && (
                              <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-1">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Availability</span>
                                <p className="text-xs font-black text-[#2ECC71]">{item.availability}</p>
                              </div>
                            )}
                            {item.education && (
                              <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-1">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Education</span>
                                <p className="text-xs font-black text-gray-900">{item.education}</p>
                              </div>
                            )}
                            {item.preferred_pay_range && (
                              <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-1">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Target Pay</span>
                                <p className="text-xs font-black text-[#2ECC71]">{item.preferred_pay_range}</p>
                              </div>
                            )}
                            {item.work_style && (
                              <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-1">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Work Style</span>
                                <p className="text-xs font-black text-gray-900">{item.work_style}</p>
                              </div>
                            )}
                            {item.current_employment_status && (
                              <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-1">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                                <p className="text-xs font-black text-gray-900">{item.current_employment_status}</p>
                              </div>
                            )}
                          </div>
                          {/* Industries interested */}
                          {Array.isArray(item.industries_interested) && item.industries_interested.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Industries Interested</span>
                              <div className="flex flex-wrap gap-2">
                                {item.industries_interested.map((ind: string, i: number) => (
                                  <span key={i} className="px-3 py-1.5 bg-[#0077BE]/5 text-[#0077BE] rounded-lg text-[10px] font-black uppercase tracking-widest">{ind}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Job types seeking */}
                          {Array.isArray(item.job_types_seeking) && item.job_types_seeking.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Seeking</span>
                              <div className="flex flex-wrap gap-2">
                                {item.job_types_seeking.map((jt: string, i: number) => (
                                  <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{jt}</span>
                                ))}
                              </div>
                            </div>
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
import React, { useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, CreditCard, HelpCircle, Mail, Phone, Plus, RefreshCw, Database } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { ViewType } from '../../App';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-9b95b3f5`;

interface SettingsProps {
  onRefreshData?: () => void;
  onNavigate: (view: ViewType) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onRefreshData }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleForceRefresh = async () => {
    if (!confirm("This will reset all marketplace data (jobs & candidates) to factory defaults. Proceed?")) return;
    
    setIsRefreshing(true);
    toast.loading("Resetting marketplace database...");
    
    try {
      const response = await fetch(`${API_BASE}/seed?force=true`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) throw new Error("Reset failed");
      
      toast.dismiss();
      toast.success("Marketplace data successfully reset!");
      if (onRefreshData) onRefreshData();
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to reset data");
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-4 gap-12">
      <aside className="lg:col-span-1 space-y-4">
        {["Account info", "Payment method", "Transaction history", "Support", "System"].map(tab => (
          <button key={tab} className="w-full text-left p-6 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] border border-gray-50 bg-white hover:bg-gray-50 transition-all flex justify-between items-center group">
            {tab} <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
          </button>
        ))}
      </aside>
      
      <div className="lg:col-span-3 space-y-12">
        <section className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm space-y-10">
          <h2 className="text-4xl font-black tracking-tighter">Account Settings</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
              <input type="text" placeholder="Identity Name" className="w-full p-5 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
              <input type="email" placeholder="contact@domain.com" className="w-full p-5 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
              <input type="tel" placeholder="+1 (808) 000-0000" className="w-full p-5 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-bold" />
            </div>
            <div className="flex items-end">
              <Button className="h-16 px-10 rounded-2xl w-full" onClick={() => toast.success("Info Updated")}>Update Info</Button>
            </div>
          </div>
        </section>

        <section className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm space-y-10">
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4"><Database className="text-[#FF6B6B]" /> System Data</h2>
          <div className="p-10 bg-red-50/30 border border-red-100 rounded-[3rem] space-y-6">
            <div className="space-y-2">
              <p className="font-black text-lg tracking-tight uppercase text-red-600">Factory Reset</p>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">If images are missing or the marketplace data seems outdated, you can force a re-seed of the database. This will overwrite all current KV store data for jobs and candidates with fresh high-quality Unsplash URLs.</p>
            </div>
            <Button 
              variant="outline" 
              className="h-14 px-8 border-red-200 text-red-600 hover:bg-red-50 rounded-2xl gap-3" 
              onClick={handleForceRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? "Resetting..." : "Reset Marketplace Data"}
            </Button>
          </div>
        </section>

        <section className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm space-y-10">
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4"><CreditCard className="text-[#0077BE]" /> Payment Setup</h2>
          <div className="p-8 border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-200"><Plus size={32} /></div>
            <p className="text-gray-400 font-bold">Secure Stripe Connection</p>
            <Button variant="outline" className="h-14 px-10 rounded-2xl bg-white" onClick={() => toast.info("Redirecting to Stripe...")}>Add Card</Button>
          </div>
        </section>

        <section className="bg-[#0077BE]/5 p-12 rounded-[4rem] border border-[#0077BE]/10 space-y-10">
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4"><HelpCircle className="text-[#0077BE]" /> Support</h2>
          <div className="grid md:grid-cols-2 gap-8 text-sm">
            <div className="space-y-4">
              <p className="font-black text-xl tracking-tight leading-none">Contact HanaHire</p>
              <div className="space-y-2 font-bold">
                <p className="flex items-center gap-3"><Mail size={18} className="text-[#0077BE]" /> support@hanahire.com</p>
                <p className="flex items-center gap-3"><Phone size={18} className="text-[#0077BE]" /> +1 (808) 555-0199</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

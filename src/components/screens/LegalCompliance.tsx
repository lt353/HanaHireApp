import React from "react";
import { motion } from "framer-motion";
import { Scale, ExternalLink, Mail, ChevronLeft } from "lucide-react";
import { ViewType } from "../../App";

interface LegalComplianceProps {
  onNavigate: (view: ViewType) => void;
}

export const LegalCompliance: React.FC<LegalComplianceProps> = ({ onNavigate }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 py-16 pb-32 space-y-14"
    >
      {/* Back */}
      <button
        type="button"
        onClick={() => onNavigate("about")}
        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#148F8B] transition-colors"
      >
        <ChevronLeft size={14} /> Back
      </button>

      {/* Header */}
      <div className="flex items-start gap-5">
        <div className="w-14 h-14 rounded-2xl bg-[#148F8B]/10 flex items-center justify-center shrink-0 mt-1">
          <Scale size={26} className="text-[#148F8B]" />
        </div>
        <div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-gray-900 leading-tight">
            Legal Compliance &amp; Equal Employment Opportunity
          </h1>
          <p className="text-lg text-gray-500 font-medium mt-3">
            HanaHire is designed to serve Hawaii's small business community while maintaining full compliance with federal employment law.
          </p>
        </div>
      </div>

      {/* Who We Serve */}
      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#148F8B]">Who We Serve</p>
        <h2 className="text-2xl font-black tracking-tight text-gray-900">Small Businesses — The Backbone of Hawaii's Economy</h2>
        <p className="text-gray-600 leading-relaxed">
          HanaHire specifically targets small businesses that need streamlined, affordable hiring solutions — businesses that often employ fewer than 15 people, may not have dedicated HR departments, and operate as family-owned or locally-focused businesses.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 pt-2">
          {[
            { stat: "99.9%", label: "of U.S. businesses are small businesses" },
            { stat: "78.5%", label: "of firms have fewer than 10 employees" },
            { stat: "~50%", label: "of the American workforce employed by small businesses" },
          ].map(({ stat, label }) => (
            <div key={stat} className="bg-[#148F8B]/5 border border-[#148F8B]/10 rounded-2xl p-5 space-y-1">
              <p className="text-3xl font-black text-[#148F8B]">{stat}</p>
              <p className="text-sm text-gray-600 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-gray-100" />

      {/* EEOC */}
      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#148F8B]">EEOC Compliance</p>
        <h2 className="text-2xl font-black tracking-tight text-gray-900">Equal Employment Opportunity Commission</h2>
        <p className="text-gray-600 leading-relaxed">
          The U.S. Equal Employment Opportunity Commission enforces federal laws that prohibit employment discrimination. These laws cover employers with{" "}
          <strong className="text-gray-900">15 or more employees</strong> (20 or more for the Age Discrimination in Employment Act).
        </p>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Federal Laws Covered</p>
          <ul className="space-y-2 text-sm text-gray-700">
            {[
              "Title VII of the Civil Rights Act of 1964",
              "Age Discrimination in Employment Act (ADEA) — 20+ employees",
              "Americans with Disabilities Act (ADA)",
              "Equal Pay Act (EPA)",
              "Genetic Information Nondiscrimination Act (GINA)",
            ].map((law) => (
              <li key={law} className="flex items-start gap-2">
                <span className="text-[#148F8B] font-black shrink-0 mt-0.5">✓</span>
                {law}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          While many of our target employers fall below EEOC employee thresholds, HanaHire is committed to fair employment practices and expects all users to treat candidates with respect and in accordance with applicable laws.
        </p>
      </section>

      <hr className="border-gray-100" />

      {/* Non-discrimination standards */}
      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#148F8B]">Non-Discrimination Standards</p>
        <h2 className="text-2xl font-black tracking-tight text-gray-900">Protected Characteristics</h2>
        <p className="text-gray-600 leading-relaxed">
          Federal law prohibits employment discrimination based on the following characteristics. HanaHire expects all employers on the platform to uphold these standards regardless of business size.
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "Race", "Color", "Religion", "Sex", "Pregnancy",
            "Gender Identity", "Sexual Orientation", "National Origin",
            "Age (40+)", "Disability", "Genetic Information",
          ].map((c) => (
            <span key={c} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg">{c}</span>
          ))}
        </div>
      </section>

      <hr className="border-gray-100" />

      {/* Platform role */}
      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#148F8B]">Our Platform's Role</p>
        <h2 className="text-2xl font-black tracking-tight text-gray-900">HanaHire Is a Marketplace — Not an Employer</h2>
        <p className="text-gray-600 leading-relaxed">
          HanaHire connects job seekers with employers and provides tools for profile creation, job posting, and candidate discovery. We do not make hiring decisions on behalf of employers, and we do not control how employers use candidate information.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: "What We Do", items: ["Provide profile and job posting tools", "Connect job seekers with employers", "Facilitate messaging and applications", "Promote fair hiring practices"] },
            { title: "What We Don't Do", items: ["Make hiring decisions for employers", "Control employer use of candidate info", "Guarantee employment outcomes", "Assume liability for individual user actions"] },
          ].map(({ title, items }) => (
            <div key={title} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">{title}</p>
              <ul className="space-y-1.5 text-sm text-gray-700">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[#148F8B] font-black shrink-0 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-gray-100" />

      {/* User responsibilities */}
      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#148F8B]">User Responsibilities</p>
        <h2 className="text-2xl font-black tracking-tight text-gray-900">Platform Use Agreement</h2>
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p><strong className="text-gray-900">All users</strong> agree to use HanaHire in compliance with all applicable federal, state, and local laws, not engage in discriminatory practices prohibited by law, and report any violations.</p>
          <p><strong className="text-gray-900">Employers</strong> specifically agree to make hiring decisions based on legitimate business criteria, comply with EEOC guidelines if applicable to their business size, and use candidate information solely for legitimate hiring purposes.</p>
          <p><strong className="text-gray-900">Job seekers</strong> specifically agree to provide accurate profile information and report any discriminatory behavior they experience on the platform.</p>
          <p className="text-gray-500">HanaHire reserves the right to suspend or terminate accounts that violate these terms and may report violations to appropriate authorities. Users agree to indemnify and hold harmless HanaHire from any claims arising from their use of the platform or their hiring/employment practices.</p>
        </div>
      </section>

      <hr className="border-gray-100" />

      {/* Report + contact */}
      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#148F8B]">Report & Contact</p>
        <h2 className="text-2xl font-black tracking-tight text-gray-900">Reporting Discrimination or Abuse</h2>
        <p className="text-gray-600 leading-relaxed">
          If you experience or witness discriminatory behavior on HanaHire, please report it immediately. We take all reports seriously and will investigate promptly.
        </p>
        <a
          href="mailto:support@hanahire.com?subject=Report%20Discrimination%20or%20Abuse&body=Please%20describe%20what%20happened%2C%20who%20was%20involved%2C%20and%20when%20it%20occurred%3A"
          className="inline-flex items-center gap-3 px-6 py-4 bg-red-50 border border-red-100 rounded-2xl text-sm font-black text-red-600 hover:bg-red-100 transition-all"
        >
          <Mail size={16} />
          Report Discrimination or Abuse — support@hanahire.com
        </a>
      </section>

      <hr className="border-gray-100" />

      {/* External resources */}
      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#148F8B]">Additional Resources</p>
        <h2 className="text-2xl font-black tracking-tight text-gray-900">Authoritative Sources</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "EEOC: Small Business Information", href: "https://www.eeoc.gov/publications/get-facts-series-small-business-information" },
            { label: "EEOC Small Business Resources", href: "https://www.eeoc.gov/employers/small-business" },
            { label: "SBA Council: Facts & Data on Small Business", href: "https://sbecouncil.org/about-us/facts-and-data/" },
            { label: "U.S. Chamber: Small Business Data Center", href: "https://www.uschamber.com/small-business/small-business-data-center" },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 px-5 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-sm font-bold text-gray-700 hover:border-[#148F8B] hover:text-[#148F8B] transition-all group"
            >
              <span>{label}</span>
              <ExternalLink size={13} className="shrink-0 text-gray-300 group-hover:text-[#148F8B]" />
            </a>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

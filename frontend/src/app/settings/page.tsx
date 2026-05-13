"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  Globe,
  Save,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
  });
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setFormData({
          fullName: session.user.user_metadata?.full_name || "",
          mobile: session.user.user_metadata?.mobile || "",
          email: session.user.email || "",
        });
      }
    };
    fetchUser();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentMobile = session?.user?.user_metadata?.mobile;
      const currentEmail = session?.user?.email;

      // 1. Check for Mobile Change (MOCK OTP)
      if (formData.mobile !== currentMobile && formData.mobile.length > 5) {
        setShowOtpModal(true);
        toast.info("MOCK: Verification code sent! (Use 123456)");
        setLoading(false);
        return;
      }

      // 2. Update Auth (Full Name & Mobile in Metadata, Email at top level)
      const { error: authError } = await supabase.auth.updateUser({
        email: formData.email,
        data: {
          full_name: formData.fullName,
          mobile: formData.mobile,
        },
      });

      if (authError) throw authError;

      // 3. Update Public Profiles Table (Skip email as it is in auth.users)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          mobile: formData.mobile,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      const {
        data: { session: updatedSession },
      } = await supabase.auth.getSession();
      const emailChanged = formData.email !== updatedSession?.user?.email;

      if (emailChanged) {
        toast.success(
          t("profile_updated") + " - " + t("email_verification_sent"),
        );
      } else {
        toast.success(t("profile_updated"));
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setVerifying(true);
    try {
      // MOCK OTP Verification
      if (otp !== "123456") {
        throw new Error(t("invalid_otp"));
      }

      // Update Auth Metadata & Profile Table directly
      const { error: authError } = await supabase.auth.updateUser({
        data: { mobile: formData.mobile },
      });
      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ mobile: formData.mobile })
        .eq("id", user.id);

      if (profileError) throw profileError;

      toast.success(t("profile_updated"));
      setShowOtpModal(false);
      setOtp("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setVerifying(false);
    }
  };

  const languages = [
    { code: "en", name: "English", native: "English" },
    { code: "ml", name: "Malayalam", native: "മലയാളം" },
    { code: "ta", name: "Tamil", native: "தமிழ்" },
    { code: "hi", name: "Hindi", native: "हिन्दी" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            {t("settings")}
          </h1>
          <p className="text-slate-500 font-medium">
            {t("manage_account_prefs")}
          </p>
        </div>

        {/* Specialist Identity Card (Moved to Top/Header area for prominence) */}
        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-3xl p-5 shadow-xl shadow-slate-200/40 group sm:min-w-[300px]">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate leading-none mb-1">
                {t("verified_specialist")}
              </h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                ID: {user?.user_metadata?.id_code || "GHOST-001"}
              </p>
            </div>
            <div className="ml-auto">
              <span className="px-2 py-1 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">
                {t("active")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Utility & Security */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 bg-slate-900 rounded-[2rem] text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <ShieldCheck size={60} />
            </div>
            <h4 className="text-xs font-black text-marine-accent uppercase tracking-widest mb-2">
              {t("security_note")}
            </h4>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              {t("security_msg")}
            </p>
          </div>

          {/* Language Preference Selector */}
          <div className="glass-card p-6 border-slate-100 bg-white shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-marine-accent/10 text-marine-accent rounded-xl">
                <Globe size={18} />
              </div>
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                {t("language_preference")}
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as any)}
                  className={cn(
                    "p-2 rounded-xl border text-center transition-all group/lang",
                    language === lang.code
                      ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                      : "bg-white border-slate-100 text-slate-600 hover:border-marine-accent/30 hover:bg-slate-50",
                  )}
                >
                  <p className="text-[10px] font-black uppercase tracking-tight">
                    {lang.code}
                  </p>
                  <p className="text-[8px] font-bold opacity-60 truncate">
                    {lang.native}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Profile Editing */}
        <div className="md:col-span-2 space-y-6 min-w-0">
          <form
            onSubmit={handleUpdateProfile}
            className="glass-card p-4 sm:p-8 space-y-6 sm:space-y-8 min-w-0"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl shrink-0">
                <User size={20} />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest truncate">
                {t("edit_profile")}
              </h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {t("full_name")}
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-xs sm:text-sm font-bold focus:outline-none focus:border-marine-accent focus:bg-white transition-all"
                      placeholder="e.g. Salim Mujthaba"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {t("mobile_number")}
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData({ ...formData, mobile: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-xs sm:text-sm font-bold focus:outline-none focus:border-marine-accent focus:bg-white transition-all"
                      placeholder="e.g. +91 9876543210"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {t("email_address")}
                  </label>
                  <div className="relative">
                    <Globe
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-xs sm:text-sm font-bold focus:outline-none focus:border-marine-accent transition-all"
                      placeholder="e.g. salim@ghostnet.org"
                    />
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 font-medium italic">
                  {t("email_change_note")}
                </p>
              </div>
            </div>

            <div className="pt-2 sm:pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-2xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} className="shrink-0" />
                    <span className="truncate">{t("save_changes")}</span>
                  </>
                )}
              </button>
            </div>
          </form>


        </div>
      </div>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOtpModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100"
            >
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-marine-accent/10 rounded-2xl flex items-center justify-center text-marine-accent mx-auto">
                  <Phone size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {t("verify_otp")}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-2">
                    {t("enter_otp")}
                  </p>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 text-center text-3xl font-black tracking-[0.5em] text-slate-900 focus:outline-none focus:border-marine-accent transition-all"
                    placeholder="------"
                  />
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6 || verifying}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 active:scale-95"
                  >
                    {verifying ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                    ) : (
                      t("verify_otp")
                    )}
                  </button>
                  <button
                    onClick={() => setShowOtpModal(false)}
                    className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper for class names
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

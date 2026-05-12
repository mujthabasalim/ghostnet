"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Anchor, 
  Shield, 
  Ship, 
  ArrowRight, 
  AlertCircle, 
  ChevronLeft, 
  CheckCircle2, 
  User, 
  Phone, 
  CreditCard, 
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { MOCK_VALID_IDS, USER_TYPES } from '@/lib/auth-mock';

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    userType: 'fisherman',
    idCode: '',
    otp: '',
    email: '',
    password: '',
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleIdValidation = async () => {
    setLoading(true);
    setError('');
    
    const validIds = MOCK_VALID_IDS[formData.userType as keyof typeof MOCK_VALID_IDS];
    if (!validIds.includes(formData.idCode.toUpperCase())) {
      setFieldErrors({ idCode: `Invalid ID. Try e.g., ${validIds[0]}` });
      setLoading(false);
      return;
    }

    try {
      console.log('Checking ID uniqueness for:', formData.idCode);
      // Real-time Database Pre-check
      const { data, error: checkError } = await supabase
        .from('profiles')
        .select('id_code')
        .eq('id_code', formData.idCode.toUpperCase())
        .maybeSingle();

      if (checkError) {
        console.error('Database check error:', checkError);
        throw checkError;
      }

      console.log('Database response:', data);

      if (data) {
        setFieldErrors({ idCode: 'This ID is already registered to another account.' });
      } else {
        console.log('ID is unique, proceeding...');
        setFieldErrors({});
        nextStep();
      }
    } catch (err: any) {
      console.error('Validation error catch:', err);
      toast.error('System verification failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    setLoading(true);
    setError('');

    try {
      // Check if mobile is already in use
      const { data, error: checkError } = await supabase
        .from('profiles')
        .select('mobile')
        .eq('mobile', formData.mobile)
        .maybeSingle();

      if (checkError) throw checkError;

      if (data) {
        setFieldErrors({ mobile: 'This mobile number is already linked to an account.' });
        setLoading(false);
        return;
      }

      // Simulate SMS API call
      setTimeout(() => {
        setOtpSent(true);
        setLoading(false);
        toast.success('Verification code sent to ' + formData.mobile);
      }, 1500);
    } catch (err: any) {
      console.error('Mobile check error:', err);
      setError('Verification service unavailable.');
      setLoading(false);
    }
  };

  const verifyOtp = () => {
    if (formData.otp === '123456') {
      setOtpVerified(true);
      toast.success('Mobile number verified successfully!');
      nextStep();
    } else {
      toast.error('Invalid OTP. Use 123456 for testing.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            mobile: formData.mobile,
            user_type: formData.userType,
            id_code: formData.idCode.toUpperCase(),
          }
        }
      });

      if (signUpError) throw signUpError;

      toast.success('Registration successful! Welcome to GhostNet.');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20 flex items-center justify-center px-4">
      <div className="max-w-xl w-full">
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Guardian Registration</h2>
            <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">Step {step} of 4</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="h-full bg-marine-accent shadow-[0_0_15px_rgba(14,165,233,0.4)]"
            />
          </div>
        </div>

        <div className="glass-card p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-marine-accent to-marine-cyan" />
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-marine-accent/10 rounded-2xl flex items-center justify-center text-marine-accent mx-auto mb-4 border border-marine-accent/20">
                    <User size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Guardian Identity</h3>
                  <p className="text-slate-500 text-sm">Tell us who you are and your role in the ocean.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      placeholder="e.g. John Doe"
                      className="w-full bg-white border border-slate-200 rounded-xl py-4 px-5 text-slate-900 focus:outline-none focus:border-marine-accent focus:ring-4 focus:ring-marine-accent/10 transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Guardian Type</label>
                    <div className="grid grid-cols-1 gap-3">
                      {USER_TYPES.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setFormData({...formData, userType: type.id})}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-300",
                            formData.userType === type.id 
                              ? "bg-marine-accent/5 border-marine-accent ring-2 ring-marine-accent/20" 
                              : "bg-white border-slate-200 hover:border-marine-accent/50"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                            formData.userType === type.id ? "bg-marine-accent text-white" : "bg-slate-100 text-slate-500"
                          )}>
                            {type.id === 'fisherman' && <Ship size={20} />}
                            {type.id === 'coastal_guard' && <Shield size={20} />}
                            {type.id === 'diver' && <Anchor size={20} />}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{type.label}</p>
                            <p className="text-xs text-slate-500 font-medium">{type.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={nextStep}
                  disabled={!formData.fullName}
                  className="w-full bg-marine-accent text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-marine-accent/30 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  Next: Validation <ArrowRight size={20} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-4 border border-amber-500/20">
                    <CreditCard size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">ID Verification</h3>
                  <p className="text-slate-500 text-sm">Enter your official identification code.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{formData.userType.replace('_', ' ')} ID Code</label>
                      <input 
                        type="text" 
                        value={formData.idCode}
                        onChange={(e) => {
                          setFormData({...formData, idCode: e.target.value});
                          if (fieldErrors.idCode) setFieldErrors({ ...fieldErrors, idCode: '' });
                        }}
                        placeholder="e.g. FIS-101"
                        className={cn(
                          "w-full bg-white border rounded-xl py-4 px-5 text-slate-900 focus:outline-none focus:border-marine-accent focus:ring-4 focus:ring-marine-accent/10 transition-all font-mono font-bold uppercase",
                          fieldErrors.idCode ? "border-rose-500 ring-4 ring-rose-500/10" : "border-slate-200"
                        )}
                      />
                      {fieldErrors.idCode && (
                        <p className="text-rose-500 text-[10px] font-bold uppercase tracking-wider mt-2 ml-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {fieldErrors.idCode}
                        </p>
                      )}
                    </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Notice</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      Your ID will be validated against the Government Maritime Database. Ensure the code matches your physical card.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={prevStep} className="flex-1 bg-slate-100 text-slate-500 font-black py-4 rounded-xl hover:bg-slate-200 transition-all">
                    Back
                  </button>
                  <button 
                    onClick={handleIdValidation}
                    disabled={loading || !formData.idCode}
                    className="flex-[2] bg-marine-accent text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-marine-accent/30 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Verify ID <ArrowRight size={20} /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-4 border border-emerald-500/20">
                    <Phone size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Mobile Verification</h3>
                  <p className="text-slate-500 text-sm">Secure your account with OTP verification.</p>
                </div>

                {!otpSent ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Mobile Number</label>
                      <input 
                        type="tel" 
                        value={formData.mobile}
                        onChange={(e) => {
                          setFormData({...formData, mobile: e.target.value});
                          if (fieldErrors.mobile) setFieldErrors({ ...fieldErrors, mobile: '' });
                        }}
                        placeholder="+94 7X XXX XXXX"
                        className={cn(
                          "w-full bg-white border rounded-xl py-4 px-5 text-slate-900 focus:outline-none focus:border-marine-accent transition-all font-bold",
                          fieldErrors.mobile ? "border-rose-500 ring-4 ring-rose-500/10" : "border-slate-200"
                        )}
                      />
                      {fieldErrors.mobile && (
                        <p className="text-rose-500 text-[10px] font-bold uppercase tracking-wider mt-2 ml-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {fieldErrors.mobile}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={sendOtp}
                      disabled={loading || !formData.mobile}
                      className="w-full bg-slate-900 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send OTP'} <ArrowRight size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Enter 6-Digit OTP</label>
                        <button onClick={() => setOtpSent(false)} className="text-[10px] text-marine-accent font-black uppercase tracking-tighter hover:underline">Change Number</button>
                      </div>
                      <input 
                        type="text" 
                        value={formData.otp}
                        onChange={(e) => setFormData({...formData, otp: e.target.value})}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full bg-white border border-slate-200 rounded-xl py-4 px-5 text-slate-900 focus:outline-none focus:border-marine-accent transition-all font-mono font-black text-center text-2xl tracking-[0.5em]"
                      />
                    </div>
                    <button 
                      onClick={verifyOtp}
                      className="w-full bg-emerald-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-emerald-600"
                    >
                      Verify OTP <CheckCircle2 size={20} />
                    </button>
                  </div>
                )}

                <button onClick={prevStep} className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors">
                  Back to ID Verification
                </button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-marine-accent/10 rounded-2xl flex items-center justify-center text-marine-accent mx-auto mb-4 border border-marine-accent/20">
                    <Key size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Secure Access</h3>
                  <p className="text-slate-500 text-sm">Create your login credentials.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="guardian@ocean.com"
                      className="w-full bg-white border border-slate-200 rounded-xl py-4 px-5 text-slate-900 focus:outline-none focus:border-marine-accent transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="••••••••"
                        className="w-full bg-white border border-slate-200 rounded-xl py-4 px-5 text-slate-900 focus:outline-none focus:border-marine-accent transition-all font-bold"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>


                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-marine-accent text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-marine-accent/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Complete Registration <ArrowRight size={20} /></>
                    )}
                  </button>
                </form>

                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  By joining, you agree to the Maritime Data Sharing Protocol.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium text-sm">
            Already a guardian? <button onClick={() => router.push('/auth')} className="text-marine-accent font-black hover:underline underline-offset-4">Sign In</button>
          </p>
        </div>
      </div>
    </div>
  );
}

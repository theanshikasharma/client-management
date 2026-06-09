import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, ArrowRight, Shield, CheckCircle2, Mail, Lock, User, Building2, ChevronLeft } from "lucide-react";

type AuthStep = "login" | "signup" | "otp";

interface AuthPageProps {
  onAuthenticated: (user: { name: string; email: string; company: string }) => void;
}

const DeloitteLogo = () => (
  <div className="flex items-center gap-2">
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#86BC25" />
      <text x="16" y="22" textAnchor="middle" fill="#0A0B0D" fontSize="18" fontWeight="800" fontFamily="serif">d.</text>
    </svg>
    <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '22px', color: '#F0F2F0', letterSpacing: '-0.5px' }}>
      Deloitte
    </span>
  </div>
);

const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: Math.random() * 4 + 1 + 'px',
          height: Math.random() * 4 + 1 + 'px',
          background: `rgba(134, 188, 37, ${Math.random() * 0.3 + 0.1})`,
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
        }}
        animate={{
          y: [0, -30, 0],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: Math.random() * 4 + 3,
          repeat: Infinity,
          delay: Math.random() * 2,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [step, setStep] = useState<AuthStep>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", company: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
    } else if (otpTimer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, otpTimer]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = "Invalid email address";
    if (!formData.password) errs.password = "Password is required";
    else if (formData.password.length < 8) errs.password = "Minimum 8 characters";
    if (step === "signup") {
      if (!formData.name) errs.name = "Full name is required";
      if (!formData.company) errs.company = "Company name is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsLoading(false);
    setOtpTimer(60);
    setTimerActive(true);
    setOtpValues(["", "", "", "", "", ""]);
    setStep("otp");
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value.slice(-1);
    setOtpValues(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every(v => v !== "")) {
      setTimeout(async () => {
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 1000));
        setIsLoading(false);
        onAuthenticated({
          name: formData.name || "Sarah Mitchell",
          email: formData.email,
          company: formData.company || "Meridian Capital Group",
        });
      }, 300);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const inputClass = (field: string) =>
    `w-full bg-[#1A1E24] border rounded-lg px-4 py-3 text-[#F0F2F0] placeholder-[#4A5568] focus:outline-none focus:ring-2 transition-all text-sm ${
      errors[field]
        ? "border-red-500/50 focus:ring-red-500/30"
        : "border-[rgba(134,188,37,0.15)] focus:ring-[rgba(134,188,37,0.3)] focus:border-[rgba(134,188,37,0.4)]"
    }`;

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0B0D' }}>
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0D1117 0%, #111A0A 100%)' }}>
        <FloatingParticles />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(134,188,37,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(134,188,37,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <DeloitteLogo />

        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(134,188,37,0.1)', border: '1px solid rgba(134,188,37,0.2)', color: '#86BC25' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#86BC25] animate-pulse" />
            Enterprise Client Portal
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: 700, lineHeight: 1.15, color: '#F0F2F0' }}>
            Transforming<br />
            <span style={{ color: '#86BC25' }}>Complex</span><br />
            Into Clarity
          </h1>
          <p className="mt-4 text-[#6B7A5E] text-base leading-relaxed max-w-sm">
            Your dedicated Deloitte engagement portal for seamless collaboration, AI-powered insights, and real-time project tracking.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { value: "98%", label: "Client Satisfaction" },
              { value: "2.4x", label: "Faster Delivery" },
              { value: "340+", label: "Active Engagements" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg p-4"
                style={{ background: 'rgba(134,188,37,0.05)', border: '1px solid rgba(134,188,37,0.1)' }}>
                <div style={{ color: '#86BC25', fontSize: '22px', fontWeight: 700 }}>{stat.value}</div>
                <div style={{ color: '#6B7A5E', fontSize: '11px' }} className="mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Shield size={14} style={{ color: '#86BC25' }} />
          <span style={{ color: '#4A5568', fontSize: '12px' }}>SOC 2 Type II · ISO 27001 · End-to-end encrypted</span>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <DeloitteLogo />
          </div>

          <AnimatePresence mode="wait">
            {/* LOGIN */}
            {step === "login" && (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <div className="mb-8">
                  <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 700, color: '#F0F2F0' }}>Welcome back</h2>
                  <p className="mt-1 text-sm" style={{ color: '#6B7A5E' }}>Sign in to your engagement portal</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#C8D4B8' }}>Email address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4A5568' }} />
                      <input
                        type="email"
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={e => { setFormData(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
                        className={inputClass('email')}
                        style={{ paddingLeft: '40px' }}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#C8D4B8' }}>Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4A5568' }} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={e => { setFormData(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); }}
                        className={inputClass('password')}
                        style={{ paddingLeft: '40px', paddingRight: '40px' }}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: '#4A5568' }}>
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                  </div>
                  <div className="flex justify-end">
                    <button type="button" className="text-xs transition-colors hover:text-[#86BC25]" style={{ color: '#6B7A5E' }}>
                      Forgot password?
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                    style={{ background: '#86BC25', color: '#0A0B0D' }}>
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-[#0A0B0D]/30 border-t-[#0A0B0D] rounded-full animate-spin" />
                    ) : (
                      <>Send OTP <ArrowRight size={15} /></>
                    )}
                  </button>
                </form>
                <p className="mt-6 text-center text-sm" style={{ color: '#6B7A5E' }}>
                  New to the portal?{" "}
                  <button onClick={() => { setStep("signup"); setErrors({}); }} className="font-medium transition-colors hover:text-[#86BC25]" style={{ color: '#86BC25' }}>
                    Create account
                  </button>
                </p>
              </motion.div>
            )}

            {/* SIGNUP */}
            {step === "signup" && (
              <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <button onClick={() => { setStep("login"); setErrors({}); }} className="flex items-center gap-1.5 mb-6 text-sm transition-colors hover:text-[#86BC25]" style={{ color: '#6B7A5E' }}>
                  <ChevronLeft size={15} /> Back to login
                </button>
                <div className="mb-8">
                  <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 700, color: '#F0F2F0' }}>Create account</h2>
                  <p className="mt-1 text-sm" style={{ color: '#6B7A5E' }}>Set up your client engagement account</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: '#C8D4B8' }}>Full name</label>
                      <div className="relative">
                        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4A5568' }} />
                        <input type="text" placeholder="Sarah Mitchell" value={formData.name}
                          onChange={e => { setFormData(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })); }}
                          className={inputClass('name')} style={{ paddingLeft: '40px' }} />
                      </div>
                      {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: '#C8D4B8' }}>Company</label>
                      <div className="relative">
                        <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4A5568' }} />
                        <input type="text" placeholder="Meridian Capital" value={formData.company}
                          onChange={e => { setFormData(p => ({ ...p, company: e.target.value })); setErrors(p => ({ ...p, company: '' })); }}
                          className={inputClass('company')} style={{ paddingLeft: '40px' }} />
                      </div>
                      {errors.company && <p className="mt-1 text-xs text-red-400">{errors.company}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#C8D4B8' }}>Work email</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4A5568' }} />
                      <input type="email" placeholder="you@company.com" value={formData.email}
                        onChange={e => { setFormData(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
                        className={inputClass('email')} style={{ paddingLeft: '40px' }} />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#C8D4B8' }}>Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4A5568' }} />
                      <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={formData.password}
                        onChange={e => { setFormData(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); }}
                        className={inputClass('password')} style={{ paddingLeft: '40px', paddingRight: '40px' }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4A5568' }}>
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                  </div>
                  <button type="submit" disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                    style={{ background: '#86BC25', color: '#0A0B0D' }}>
                    {isLoading ? <div className="w-4 h-4 border-2 border-[#0A0B0D]/30 border-t-[#0A0B0D] rounded-full animate-spin" /> : <>Continue <ArrowRight size={15} /></>}
                  </button>
                </form>
                <p className="mt-6 text-center text-xs" style={{ color: '#4A5568' }}>
                  By continuing, you agree to Deloitte's{" "}
                  <span className="underline cursor-pointer" style={{ color: '#86BC25' }}>Terms of Service</span>{" "}
                  and{" "}
                  <span className="underline cursor-pointer" style={{ color: '#86BC25' }}>Privacy Policy</span>
                </p>
              </motion.div>
            )}

            {/* OTP */}
            {step === "otp" && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <button onClick={() => setStep("login")} className="flex items-center gap-1.5 mb-6 text-sm transition-colors hover:text-[#86BC25]" style={{ color: '#6B7A5E' }}>
                  <ChevronLeft size={15} /> Change email
                </button>
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(134,188,37,0.1)', border: '1px solid rgba(134,188,37,0.2)' }}>
                    <Mail size={22} style={{ color: '#86BC25' }} />
                  </div>
                  <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 700, color: '#F0F2F0' }}>Check your email</h2>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: '#6B7A5E' }}>
                    We sent a 6-digit verification code to<br />
                    <span style={{ color: '#C8D4B8', fontWeight: 500 }}>{formData.email}</span>
                  </p>
                </div>

                <div className="flex gap-2 justify-between mb-6">
                  {otpValues.map((val, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={val}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="flex-1 aspect-square text-center text-xl font-semibold rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{
                        background: '#1A1E24',
                        border: val ? '1.5px solid #86BC25' : '1px solid rgba(134,188,37,0.15)',
                        color: '#F0F2F0',
                        boxShadow: val ? '0 0 0 3px rgba(134,188,37,0.1)' : 'none',
                      }}
                    />
                  ))}
                </div>

                {isLoading && (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-4 h-4 border-2 border-[#86BC25]/30 border-t-[#86BC25] rounded-full animate-spin" />
                    <span className="text-sm" style={{ color: '#86BC25' }}>Verifying...</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: '#6B7A5E' }}>
                    {timerActive ? (
                      <>Resend in <span style={{ color: '#86BC25' }}>{otpTimer}s</span></>
                    ) : (
                      "Didn't receive the code?"
                    )}
                  </span>
                  <button
                    disabled={timerActive}
                    onClick={() => { setOtpTimer(60); setTimerActive(true); setOtpValues(["","","","","",""]); }}
                    className="font-medium transition-colors disabled:opacity-40"
                    style={{ color: '#86BC25' }}>
                    Resend code
                  </button>
                </div>

                <div className="mt-6 flex items-center gap-2 rounded-lg p-3"
                  style={{ background: 'rgba(134,188,37,0.05)', border: '1px solid rgba(134,188,37,0.1)' }}>
                  <CheckCircle2 size={14} style={{ color: '#86BC25' }} />
                  <span className="text-xs" style={{ color: '#6B7A5E' }}>
                    For demo purposes, entering any 6 digits will authenticate you
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

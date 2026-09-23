'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, CheckCircle2, UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadMedia } from '@/lib/upload';

const STEPS = [
  "Basic Info",
  "Competition Type",
  "Registration",
  "Schedule & Location",
  "Eligibility & Rules",
  "Prize & Rewards",
  "Preview"
];

const CATEGORIES = [
  "Technology", "Startup / Business", "Art", "Design", "Sports", 
  "Photography", "Film", "Music", "Public Speaking", "Gaming", 
  "Academic", "Innovation", "Creator", "Other"
];

const LEVELS = ["Local", "District", "State", "National", "International"];

export default function CreateEventForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
      setErrorMsg('');
    }
  };

  const removeFile = () => {
    setCoverImageFile(null);
    setCoverImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const [formData, setFormData] = useState({
    name: '',
    category: 'Technology',
    tags: '',
    coverImage: '',
    paymentQrCode: '',
    upiId: '',
    paymentQrFile: null as any,
    paymentQrPreview: '',
    shortDescription: '',
    description: '',
    
    allowTeams: false,
    minTeamSize: '2',
    maxTeamSize: '4',
    locationType: 'ONLINE',
    eventLevel: 'State',
    qualificationEnabled: false,
    qualificationInfo: '',
    
    registrationStart: '',
    registrationEnd: '',
    participantLimit: '',
    isPaid: false,
    entryFee: '',
    currency: 'INR',
    
    startDate: '',
    endDate: '',
    country: '',
    stateProvince: '',
    city: '',
    district: '',
    venue: '',
    onlineLink: '',
    
    eligibility: '',
    rules: '',
    
    prizePool: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrorMsg('');
  };

  const handleSegmentChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const validateStep = () => {
    setErrorMsg('');
    if (step === 0) {
      if (!formData.name) return "Title is required";
      if (!formData.description) return "Full description is required";
    }
    if (step === 2) {
      if (formData.registrationStart && formData.registrationEnd) {
        if (new Date(formData.registrationStart) >= new Date(formData.registrationEnd)) {
          return "Registration end date must be after start date.";
        }
      }
      if (formData.isPaid && (!formData.entryFee || parseFloat(formData.entryFee) <= 0)) {
        return "Please enter a valid entry fee.";
      }
    }
    if (step === 3) {
      if (!formData.startDate || !formData.endDate) return "Competition dates are required.";
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        return "Competition end date must be after start date.";
      }
      if (formData.registrationEnd && new Date(formData.registrationEnd) > new Date(formData.startDate)) {
        return "Registration must end before competition starts.";
      }
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => {
    setErrorMsg('');
    setStep(s => Math.max(s - 1, 0));
  };

  const submitCompetition = async (status: 'PUBLISHED' | 'DRAFT') => {
    if (status === 'PUBLISHED') setLoading(true);
    else setIsDrafting(true);
    
    setErrorMsg('');
    try {
      const supabase = createClient();
      let mediaUrl = formData.coverImage;
      let qrUrl = formData.paymentQrCode;
      
      if (formData.paymentQrFile) {
        if (formData.paymentQrFile.size > 50 * 1024 * 1024) throw new Error('QR must be less than 50MB.');
        qrUrl = await uploadMedia(formData.paymentQrFile, 'qrs');
      }

      if (coverImageFile) {
        if (coverImageFile.size > 50 * 1024 * 1024) {
          setErrorMsg('Cover image must be less than 50MB.');
          setLoading(false);
          setIsDrafting(false);
          return;
        }
        mediaUrl = await uploadMedia(coverImageFile, 'events');
      }

      const payload = {
        ...formData,
        coverImage: mediaUrl,
        paymentQrCode: formData.isPaid ? qrUrl : null,
        upiId: formData.isPaid ? formData.upiId : null,
        minTeamSize: formData.allowTeams && formData.minTeamSize ? parseInt(formData.minTeamSize) : null,
        maxTeamSize: formData.allowTeams && formData.maxTeamSize ? parseInt(formData.maxTeamSize) : null,
        entryFee: formData.isPaid && formData.entryFee ? parseFloat(formData.entryFee) : 0,
        participantLimit: formData.participantLimit ? parseInt(formData.participantLimit) : null,
        state: formData.stateProvince,
        status
      };

      const res = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const resData = await res.json();
      if (!res.ok) {
        setErrorMsg(resData.error || 'Failed to create competition');
        setLoading(false);
        setIsDrafting(false);
        return;
      }

      router.push(`/competitions/${resData.event.id}`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred.');
      setLoading(false);
      setIsDrafting(false);
    }
  };

  // Helper for rendering segmented control
  const renderSegmentedControl = (name: string, options: {label: string, value: any}[], currentValue: any) => (
    <div style={{ display: 'flex', background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: '6px', gap: '6px' }}>
      {options.map(opt => {
        const isActive = currentValue === opt.value;
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => handleSegmentChange(name, opt.value)}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              background: isActive ? 'var(--accent-primary)' : 'transparent',
              color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 500,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: isActive ? '0 2px 8px rgba(59,130,246,0.3)' : 'none'
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* Premium Stepper */}
      <div style={{ position: 'relative', width: '100%', padding: '16px 0', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '600px', position: 'relative' }}>
          {/* Background Connecting Line */}
          <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', height: '2px', background: 'var(--surface-hover)', zIndex: 0 }} />
          
          {/* Active Connecting Line */}
          <div style={{ position: 'absolute', top: '20px', left: '20px', height: '2px', background: 'var(--accent-primary)', zIndex: 1, width: `calc(${(step / (STEPS.length - 1)) * 100}% - 40px)`, transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />

          {STEPS.map((label, idx) => {
            const isCompleted = idx < step;
            const isActive = idx === step;
            const isUpcoming = idx > step;
            
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2, position: 'relative', flex: 1 }}>
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isCompleted ? 'var(--accent-primary)' : (isActive ? 'var(--surface-1)' : 'var(--surface-2)'),
                  border: `2px solid ${isCompleted || isActive ? 'var(--accent-primary)' : 'var(--surface-hover)'}`,
                  color: isCompleted ? '#FFF' : (isActive ? '#FFF' : 'var(--text-muted)'),
                  fontWeight: 700, fontSize: '14px',
                  boxShadow: isActive ? '0 0 0 4px var(--accent-glow)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {isCompleted ? <CheckCircle2 size={20} /> : (idx + 1)}
                </div>
                {/* Responsive Label */}
                <span className="stepper-label" style={{ fontSize: '12px', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--text-primary)' : 'var(--text-muted)', textAlign: 'center' }}>
                  <style>{`@media (max-width: 768px) { .stepper-label { display: none; } }`}</style>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {errorMsg}
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* STEP 0: Basic Info */}
            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Competition Title <span style={{color: '#ef4444'}}>*</span></span>
                    <input type="text" name="name" className="input-modern" value={formData.name} onChange={handleChange} placeholder="E.g., National Hackathon 2026" />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Enter a clear, descriptive title.</span>
                  </label>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: '20px', flex: 1 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>Category</span>
                      <select name="category" className="input-modern" value={formData.category} onChange={handleChange}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Helps participants find your competition.</span>
                    </label>
                  </div>
                  
                  <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: '20px', flex: 1 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>Tags</span>
                      <input type="text" name="tags" className="input-modern" value={formData.tags} onChange={handleChange} placeholder="Comma-separated (coding, ai, tech)" />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Add relevant keywords.</span>
                    </label>
                  </div>
                </div>

                <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>Cover Image</span>

                  {!coverImagePreview ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      style={{ 
                        border: '2px dashed', 
                        borderColor: 'transparent',
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(139,92,246,0.05)) padding-box, linear-gradient(135deg, var(--accent-primary), var(--accent-purple)) border-box',
                        borderRadius: 'var(--radius-lg)', 
                        padding: '40px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ padding: '16px', background: 'var(--surface-1)', borderRadius: '50%', color: 'var(--accent-primary)', boxShadow: 'var(--shadow-md)' }}>
                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                          <UploadCloud size={28} />
                        </motion.div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '16px' }}>Click to upload cover image</p>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>JPEG, PNG up to 10MB (16:9 recommended)</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                      <img src={coverImagePreview} alt='Cover Preview' style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)', pointerEvents: 'none' }} />
                      <button
                        type='button'
                        onClick={removeFile}
                        style={{ position: 'absolute', top: '12px', right: '12px', padding: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', transition: 'background 0.2s' }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                  <input 
                    type='file' 
                    ref={fileInputRef} 
                    accept='image/*' 
                    onChange={handleFileChange} 
                    style={{ display: 'none' }} 
                  />
                </div>

                <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Short Description</span>
                    <textarea name="shortDescription" className="input-modern" value={formData.shortDescription} onChange={handleChange} placeholder="Brief pitch of the competition" rows={2} />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>A 1-2 sentence hook for preview cards.</span>
                  </label>
                </div>

                <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Full Description <span style={{color: '#ef4444'}}>*</span></span>
                    <textarea name="description" className="input-modern" value={formData.description} onChange={handleChange} placeholder="Detailed explanation" rows={6} />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Everything participants need to know about the event.</span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 1: Competition Type */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>Participation Format</span>
                  {renderSegmentedControl('allowTeams', [
                    { label: 'Solo', value: false },
                    { label: 'Team', value: true }
                  ], formData.allowTeams)}
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Can users join as a team?</span>
                </div>

                {formData.allowTeams && (
                  <div style={{ display: 'flex', gap: '1rem', padding: '20px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>Min Team Size</span>
                      <input type="number" name="minTeamSize" className="input-modern" min="1" value={formData.minTeamSize} onChange={handleChange} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>Max Team Size</span>
                      <input type="number" name="maxTeamSize" className="input-modern" min="1" value={formData.maxTeamSize} onChange={handleChange} />
                    </label>
                  </div>
                )}
                
                <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>Location Format</span>
                  {renderSegmentedControl('locationType', [
                    { label: 'Online', value: 'ONLINE' },
                    { label: 'Offline', value: 'OFFLINE' },
                    { label: 'Hybrid', value: 'HYBRID' }
                  ], formData.locationType)}
                </div>

                <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Geographic Level</span>
                    <select name="eventLevel" className="input-modern" value={formData.eventLevel} onChange={handleChange}>
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </label>
                </div>

                <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>Qualification Round</span>
                  {renderSegmentedControl('qualificationEnabled', [
                    { label: 'No', value: false },
                    { label: 'Yes', value: true }
                  ], formData.qualificationEnabled)}
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Is there a preliminary round before the main event?</span>
                  
                  {formData.qualificationEnabled && (
                    <div style={{ marginTop: '12px' }}>
                      <textarea name="qualificationInfo" className="input-modern" value={formData.qualificationInfo} onChange={handleChange} placeholder="Briefly describe the qualification format..." rows={3} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: Registration */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Registration Start</span>
                    <input type="datetime-local" name="registrationStart" className="input-modern" value={formData.registrationStart} onChange={handleChange} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Registration End</span>
                    <input type="datetime-local" name="registrationEnd" className="input-modern" value={formData.registrationEnd} onChange={handleChange} />
                  </label>
                </div>

                <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Participant Limit (Optional)</span>
                    <input type="number" name="participantLimit" className="input-modern" value={formData.participantLimit} onChange={handleChange} placeholder="Leave blank for unlimited" min="1" />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Maximum number of participants allowed.</span>
                  </label>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Pricing</span>
                    {renderSegmentedControl('isPaid', [
                      { label: 'Free Entry', value: false },
                      { label: 'Paid Entry', value: true }
                    ], formData.isPaid)}
                  </div>

                  {formData.isPaid && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 2 }}>
                          <span style={{ fontSize: '14px', fontWeight: 600 }}>Entry Fee</span>
                          <input type="number" name="entryFee" className="input-modern" min="1" step="0.01" value={formData.entryFee} onChange={handleChange} placeholder="0.00" />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                          <span style={{ fontSize: '14px', fontWeight: 600 }}>Currency</span>
                          <select name="currency" className="input-modern" value={formData.currency} onChange={handleChange}>
                            <option value="INR">INR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </select>
                        </label>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>Payment Details (Optional but Recommended)</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Users will see this when they register for your paid event.</span>
                        
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600 }}>Organizer UPI ID</span>
                          <input type="text" name="upiId" value={formData.upiId || ''} onChange={handleChange} className="input-modern" placeholder="e.g. name@okicici" />
                        </label>

                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600 }}>Upload Payment QR Code</span>
                          <div style={{ position: 'relative', width: 'fit-content' }}>
                            <input type="file" accept="image/*" onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                const file = e.target.files[0];
                                setFormData({ ...formData, paymentQrFile: file, paymentQrPreview: URL.createObjectURL(file) });
                              }
                            }} style={{ display: 'block', fontSize: '13px' }} />
                          </div>
                        </label>
                        
                        {formData.paymentQrPreview && (
                          <div style={{ position: 'relative', width: '200px', marginTop: '8px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            <img src={formData.paymentQrPreview} alt="QR Code" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            <button type="button" onClick={() => setFormData({...formData, paymentQrFile: null as any, paymentQrPreview: ''})} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', cursor: 'pointer' }}>X</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Schedule & Location */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Event Start <span style={{color: '#ef4444'}}>*</span></span>
                    <input type="datetime-local" name="startDate" className="input-modern" value={formData.startDate} onChange={handleChange} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Event End <span style={{color: '#ef4444'}}>*</span></span>
                    <input type="datetime-local" name="endDate" className="input-modern" value={formData.endDate} onChange={handleChange} />
                  </label>
                </div>

                {(formData.locationType === 'ONLINE' || formData.locationType === 'HYBRID') && (
                  <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>Online Meeting Link</span>
                      <input type="url" name="onlineLink" className="input-modern" value={formData.onlineLink} onChange={handleChange} placeholder="https://meet.google.com/..." />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Where will the online component be hosted?</span>
                    </label>
                  </div>
                )}

                {(formData.locationType === 'OFFLINE' || formData.locationType === 'HYBRID') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Physical Venue Details</span>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input type="text" name="country" className="input-modern" style={{ flex: 1 }} value={formData.country} onChange={handleChange} placeholder="Country" />
                      <input type="text" name="stateProvince" className="input-modern" style={{ flex: 1 }} value={formData.stateProvince} onChange={handleChange} placeholder="State" />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input type="text" name="city" className="input-modern" style={{ flex: 1 }} value={formData.city} onChange={handleChange} placeholder="City" />
                      <input type="text" name="district" className="input-modern" style={{ flex: 1 }} value={formData.district} onChange={handleChange} placeholder="District" />
                    </div>
                    <textarea name="venue" className="input-modern" value={formData.venue} onChange={handleChange} placeholder="Full Venue Address" rows={3} />
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Eligibility & Rules */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Eligibility Criteria</span>
                    <textarea name="eligibility" className="input-modern" value={formData.eligibility} onChange={handleChange} placeholder="E.g., College students only, specific regions..." rows={4} />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Who is allowed to participate?</span>
                  </label>
                </div>
                
                <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Rules & Guidelines</span>
                    <textarea name="rules" className="input-modern" value={formData.rules} onChange={handleChange} placeholder="Code of conduct, evaluation rubric, submission format..." rows={6} />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Clear rules ensure a smooth event.</span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 5: Prize & Rewards */}
            {step === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Prize Pool / Rewards</span>
                    <textarea name="prizePool" className="input-modern" value={formData.prizePool} onChange={handleChange} placeholder="E.g., $5,000 Grand Prize + Tech Gadgets for Top 3" rows={6} />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>What will the winners receive?</span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 6: Preview */}
            {step === 6 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--surface-1)' }}>
                  {/* Hero Banner */}
                  <div style={{ position: 'relative', width: '100%', height: '200px', background: 'var(--surface-2)' }}>
                    {coverImagePreview ? (
                      <img src={coverImagePreview} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <ImageIcon size={48} opacity={0.5} />
                      </div>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)' }} />
                    <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
                      <span style={{ display: 'inline-block', padding: '4px 10px', background: 'var(--accent-primary)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
                        {formData.category}
                      </span>
                      <h2 style={{ margin: 0, color: 'white', fontSize: '24px', fontWeight: 800 }}>{formData.name || 'Untitled Competition'}</h2>
                    </div>
                  </div>

                  {/* Summary Details */}
                  <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Key Details</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Format</span>
                          <span style={{ fontWeight: 600 }}>{formData.locationType} • {formData.allowTeams ? 'Team' : 'Solo'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Entry Fee</span>
                          <span style={{ fontWeight: 600, color: formData.isPaid ? 'var(--text-primary)' : 'var(--accent-emerald)' }}>
                            {formData.isPaid ? `${formData.currency} ${formData.entryFee}` : 'Free'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Level</span>
                          <span style={{ fontWeight: 600 }}>{formData.eventLevel}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Schedule</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Starts</span>
                          <span style={{ fontWeight: 600 }}>{formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'TBD'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Ends</span>
                          <span style={{ fontWeight: 600 }}>{formData.endDate ? new Date(formData.endDate).toLocaleDateString() : 'TBD'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Reg. Closes</span>
                          <span style={{ fontWeight: 600 }}>{formData.registrationEnd ? new Date(formData.registrationEnd).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button 
                    type="button" 
                    onClick={() => submitCompetition('DRAFT')} 
                    className="btn-secondary" 
                    disabled={loading || isDrafting}
                    style={{ flex: 1, padding: '14px' }}
                  >
                    {isDrafting ? 'Saving...' : 'Save as Draft'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => submitCompetition('PUBLISHED')} 
                    className="btn-primary" 
                    disabled={loading || isDrafting}
                    style={{ flex: 2, padding: '14px' }}
                  >
                    {loading ? 'Publishing...' : 'Publish Now'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginTop: '1rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border-color)'
      }}>
        {step > 0 ? (
          <button 
            type="button" 
            onClick={prevStep} 
            className="btn-secondary"
            disabled={loading || isDrafting}
          >
            <ChevronLeft size={18} />
            Back
          </button>
        ) : (
          <div /> // Spacer
        )}

        {step < STEPS.length - 1 ? (
          <button 
            type="button" 
            onClick={nextStep} 
            className="btn-primary"
          >
            Next Step
            <ChevronRight size={18} />
          </button>
        ) : (
          <div /> // Spacer since submit buttons are now in step 6
        )}
      </div>
    </div>
  );
}

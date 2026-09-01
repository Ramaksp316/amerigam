'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, CheckCircle2, UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

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
    setLoading(true);
    setErrorMsg('');
    try {
      const supabase = createClient();
      let mediaUrl = formData.coverImage;

      if (coverImageFile) {
        if (coverImageFile.size > 50 * 1024 * 1024) {
          setErrorMsg('Cover image must be less than 50MB.');
          setLoading(false);
          return;
        }
        
        const fileName = `${Date.now()}-${coverImageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '') || 'upload'}`;
        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(fileName, coverImageFile, {
              contentType: coverImageFile.type,
            });
            
        if (error) {
          console.error('Storage upload error:', error);
          setErrorMsg('Failed to upload cover image. Please try again.');
          setLoading(false);
          return;
        }

        if (data) {
          const { data: publicUrlData } = supabase.storage
              .from('uploads')
              .getPublicUrl(fileName);
          mediaUrl = publicUrlData.publicUrl;
        }
      }

      const payload = {
        ...formData,
        coverImage: mediaUrl,
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
        return;
      }

      router.push(`/competitions/${resData.event.id}`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred.');
      setLoading(false);
    }
  };

  // Helper for rendering segmented control
  const renderSegmentedControl = (name: string, options: {label: string, value: any}[], currentValue: any) => (
    <div style={{ display: 'flex', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', padding: '4px', gap: '4px' }}>
      {options.map(opt => {
        const isActive = currentValue === opt.value;
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => handleSegmentChange(name, opt.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: isActive ? 'var(--surface-2)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 500,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.2)' : 'none'
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
      
      {/* Premium Step Indicator */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 600 }}>Step {step + 1} of {STEPS.length}</span>
          <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{STEPS[step]}</span>
        </div>
        <div style={{ height: '6px', background: 'var(--surface-hover)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--accent-primary)', width: `${((step + 1) / STEPS.length) * 100}%`, transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: '999px' }} />
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
        
        {/* STEP 0: Basic Info */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Competition Title <span style={{color: '#ef4444'}}>*</span></span>
              <input type="text" name="name" className="input-modern" value={formData.name} onChange={handleChange} placeholder="E.g., National Hackathon 2026" />
            </label>
            
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Category</span>
              <select name="category" className="input-modern" value={formData.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Tags</span>
              <input type="text" name="tags" className="input-modern" value={formData.tags} onChange={handleChange} placeholder="Comma-separated (coding, ai, tech)" />
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Cover Image</span>

              {!coverImagePreview ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    border: '2px dashed var(--border-color)', 
                    borderRadius: 'var(--radius-lg)', 
                    padding: '32px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '12px',
                    cursor: 'pointer',
                    background: 'var(--surface-hover)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ padding: '12px', background: 'var(--surface-2)', borderRadius: '50%', color: 'var(--text-secondary)' }}>
                    <UploadCloud size={24} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 500 }}>Click to upload cover image</p>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>JPEG, PNG up to 10MB</p>
                  </div>
                </div>
              ) : (
                <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img src={coverImagePreview} alt='Cover Preview' style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
                  <button
                    type='button'
                    onClick={removeFile}
                    style={{ position: 'absolute', top: '8px', right: '8px', padding: '6px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={16} />
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

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Short Description</span>
              <textarea name="shortDescription" className="input-modern" value={formData.shortDescription} onChange={handleChange} placeholder="Brief pitch of the competition" rows={2} />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Full Description <span style={{color: '#ef4444'}}>*</span></span>
              <textarea name="description" className="input-modern" value={formData.description} onChange={handleChange} placeholder="Detailed explanation" rows={4} />
            </label>
          </div>
        )}

        {/* STEP 1: Competition Type */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Participation Format</span>
              {renderSegmentedControl('allowTeams', [
                { label: 'Solo', value: false },
                { label: 'Team', value: true }
              ], formData.allowTeams)}
            </div>

            {formData.allowTeams && (
              <div style={{ display: 'flex', gap: '1rem', padding: '16px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>Min Team Size</span>
                  <input type="number" name="minTeamSize" className="input-modern" min="1" value={formData.minTeamSize} onChange={handleChange} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>Max Team Size</span>
                  <input type="number" name="maxTeamSize" className="input-modern" min="1" value={formData.maxTeamSize} onChange={handleChange} />
                </label>
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Location Format</span>
              {renderSegmentedControl('locationType', [
                { label: 'Online', value: 'ONLINE' },
                { label: 'Offline', value: 'OFFLINE' },
                { label: 'Hybrid', value: 'HYBRID' }
              ], formData.locationType)}
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Geographic Level</span>
              <select name="eventLevel" className="input-modern" value={formData.eventLevel} onChange={handleChange}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Qualification Round</span>
              {renderSegmentedControl('qualificationEnabled', [
                { label: 'No', value: false },
                { label: 'Yes', value: true }
              ], formData.qualificationEnabled)}
            </div>

            {formData.qualificationEnabled && (
              <textarea name="qualificationInfo" className="input-modern" value={formData.qualificationInfo} onChange={handleChange} placeholder="Briefly describe the qualification format..." rows={2} />
            )}
          </div>
        )}

        {/* STEP 2: Registration */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Registration Start</span>
                <input type="datetime-local" name="registrationStart" className="input-modern" value={formData.registrationStart} onChange={handleChange} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Registration End</span>
                <input type="datetime-local" name="registrationEnd" className="input-modern" value={formData.registrationEnd} onChange={handleChange} />
              </label>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Participant Limit (Optional)</span>
              <input type="number" name="participantLimit" className="input-modern" value={formData.participantLimit} onChange={handleChange} placeholder="Leave blank for unlimited" min="1" />
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Pricing</span>
              {renderSegmentedControl('isPaid', [
                { label: 'Free Entry', value: false },
                { label: 'Paid Entry', value: true }
              ], formData.isPaid)}
            </div>

            {formData.isPaid && (
              <div style={{ display: 'flex', gap: '1rem', padding: '16px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 2 }}>
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>Entry Fee</span>
                  <input type="number" name="entryFee" className="input-modern" min="1" step="0.01" value={formData.entryFee} onChange={handleChange} placeholder="0.00" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>Currency</span>
                  <select name="currency" className="input-modern" value={formData.currency} onChange={handleChange}>
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </label>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Schedule & Location */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
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
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Online Meeting Link</span>
                <input type="url" name="onlineLink" className="input-modern" value={formData.onlineLink} onChange={handleChange} placeholder="https://meet.google.com/..." />
              </label>
            )}

            {(formData.locationType === 'OFFLINE' || formData.locationType === 'HYBRID') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Physical Venue Details</span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="text" name="country" className="input-modern" style={{ flex: 1 }} value={formData.country} onChange={handleChange} placeholder="Country" />
                  <input type="text" name="stateProvince" className="input-modern" style={{ flex: 1 }} value={formData.stateProvince} onChange={handleChange} placeholder="State" />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="text" name="city" className="input-modern" style={{ flex: 1 }} value={formData.city} onChange={handleChange} placeholder="City" />
                  <input type="text" name="district" className="input-modern" style={{ flex: 1 }} value={formData.district} onChange={handleChange} placeholder="District" />
                </div>
                <textarea name="venue" className="input-modern" value={formData.venue} onChange={handleChange} placeholder="Full Venue Address" rows={2} />
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Eligibility & Rules */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Eligibility Criteria</span>
              <textarea name="eligibility" className="input-modern" value={formData.eligibility} onChange={handleChange} placeholder="E.g., College students only, specific regions..." rows={4} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Rules & Guidelines</span>
              <textarea name="rules" className="input-modern" value={formData.rules} onChange={handleChange} placeholder="Code of conduct, evaluation rubric, submission format..." rows={6} />
            </label>
          </div>
        )}

        {/* STEP 5: Prize & Rewards */}
        {step === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Prize Pool / Rewards</span>
              <textarea name="prizePool" className="input-modern" value={formData.prizePool} onChange={handleChange} placeholder="E.g., $5,000 Grand Prize + Tech Gadgets for Top 3" rows={5} />
            </label>
          </div>
        )}

        {/* STEP 6: Preview */}
        {step === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center', padding: '32px 16px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)' }}>
              <CheckCircle2 size={48} color="var(--accent-primary)" style={{ margin: '0 auto 16px auto' }} />
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Ready to Publish</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Your competition "{formData.name}" is fully configured. Review the details below and publish to make it live.
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Format</span>
                <span style={{ fontWeight: 600 }}>{formData.locationType} • {formData.allowTeams ? 'Team' : 'Solo'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pricing</span>
                <span style={{ fontWeight: 600 }}>{formData.isPaid ? `${formData.currency} ${formData.entryFee}` : 'Free'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Start Date</span>
                <span style={{ fontWeight: 600 }}>{new Date(formData.startDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}

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
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}
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
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', backgroundColor: 'var(--accent-primary)' }}
          >
            Next
            <ChevronRight size={18} />
          </button>
        ) : (
          <button 
            type="button" 
            onClick={() => submitCompetition('PUBLISHED')} 
            className="btn-primary" 
            disabled={loading}
            style={{ padding: '10px 24px', backgroundColor: 'var(--accent-primary)' }}
          >
            {loading ? 'Publishing...' : 'Publish Competition'}
          </button>
        )}
      </div>
    </div>
  );
}

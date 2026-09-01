'use client';

import { useState, useTransition, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { completePersonalOnboarding, checkUsernameAvailability, searchOrganizations, createOrganizationInline } from './actions';
import { createClient } from '@/utils/supabase/client';

const TOTAL_STEPS = 5;

const PROFESSION_TAXONOMY = [
  { field: 'Technology', icon: '💻', roles: ['Software Engineer', 'Developer', 'AI Engineer', 'Data Analyst', 'Cybersecurity Specialist', 'DevOps Engineer', 'Product Manager', 'QA Engineer', 'Cloud Architect', 'Mobile Developer'] },
  { field: 'Design', icon: '🎨', roles: ['UI/UX Designer', 'Graphic Designer', 'Illustrator', 'Product Designer', 'Motion Designer', 'Brand Designer', 'Interior Designer', '3D Artist'] },
  { field: 'Fashion & Apparel', icon: '👗', roles: ['Tailor', 'Garment Maker', 'Fashion Designer', 'Embroidery Artist', 'Pattern Maker', 'Textile Designer', 'Costume Designer'] },
  { field: 'Jewelry & Gemstone', icon: '💎', roles: ['Diamond Cutter', 'Diamond Polisher', 'Diamond Artisan', 'Jeweler', 'Gemstone Specialist', 'Goldsmith', 'Silversmith', 'Watch Maker'] },
  { field: 'Trades & Crafts', icon: '🔧', roles: ['Carpenter', 'Welder', 'Electrician', 'Mechanic', 'Mason', 'Plumber', 'Craftsman', 'Blacksmith', 'Glassblower', 'Potter'] },
  { field: 'Creative Arts', icon: '🎭', roles: ['Artist', 'Photographer', 'Filmmaker', 'Musician', 'Writer', 'Dancer', 'Sculptor', 'Poet', 'Comedian', 'Voice Actor'] },
  { field: 'Sports', icon: '⚽', roles: ['Athlete', 'Football Player', 'Cricket Player', 'Runner', 'Swimmer', 'Coach', 'Personal Trainer', 'Sports Analyst', 'eSports Player'] },
  { field: 'Business', icon: '💼', roles: ['Founder', 'Entrepreneur', 'CEO', 'Sales Manager', 'Marketing Professional', 'Finance Analyst', 'Operations Manager', 'Business Analyst', 'Consultant'] },
  { field: 'Education', icon: '🎓', roles: ['Student', 'Teacher', 'Researcher', 'Professor', 'Tutor', 'Academic Writer', 'Curriculum Designer'] },
  { field: 'Food & Hospitality', icon: '👨‍🍳', roles: ['Chef', 'Baker', 'Pastry Chef', 'Restaurant Owner', 'Barista', 'Food Critic', 'Nutritionist', 'Caterer'] },
  { field: 'Agriculture', icon: '🌾', roles: ['Farmer', 'Agribusiness Owner', 'Agricultural Engineer', 'Horticulturist', 'Agricultural Worker', 'Livestock Manager'] },
  { field: 'Healthcare', icon: '🩺', roles: ['Doctor', 'Nurse', 'Physiotherapist', 'Pharmacist', 'Dentist', 'Psychologist', 'Medical Researcher', 'Paramedic'] },
  { field: 'Media & Journalism', icon: '📰', roles: ['Journalist', 'Reporter', 'News Anchor', 'Editor', 'Videographer', 'Podcast Host', 'Content Writer'] },
  { field: 'Legal', icon: '⚖️', roles: ['Lawyer', 'Judge', 'Legal Consultant', 'Paralegal', 'Compliance Officer'] },
  { field: 'Finance', icon: '📈', roles: ['Investor', 'Stock Trader', 'Financial Advisor', 'Accountant', 'Crypto Analyst', 'Banker'] },
  { field: 'Organization', icon: '🏢', roles: ['Competition Organizer', 'Community Manager', 'Event Coordinator', 'Non-profit Leader'] },
  { field: 'Other', icon: '✨', roles: [] },
];

const INTEREST_OPTIONS = [
  'Technology', 'AI / ML', 'Startups', 'Design', 'Photography', 'Music', 'Film', 'Gaming',
  'Sports', 'Fitness', 'Food', 'Travel', 'Fashion', 'Art', 'Books', 'Science',
  'Business', 'Finance', 'Crypto', 'Sustainability', 'Education', 'Health',
];
const HOBBY_OPTIONS = [
  'Reading', 'Cooking', 'Hiking', 'Gaming', 'Drawing', 'Photography', 'Music', 'Dancing',
  'Gardening', 'DIY Projects', 'Meditation', 'Running', 'Cycling', 'Swimming', 'Chess',
  'Painting', 'Writing', 'Travelling', 'Yoga', 'Woodworking',
];

export default function PersonalOnboarding({ initialData }: { initialData: { name: string; email: string; username: string } }) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  // Step 1 — Profile Setup
  const [username, setUsername] = useState(initialData.username || '');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'ok' | 'taken'>('idle');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Step 2 — Location
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');

  // Step 3 (Career)
  const [selectedField, setSelectedField] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [fieldSearch, setFieldSearch] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [orgSearchResults, setOrgSearchResults] = useState<any[]>([]);
  const [isSearchingOrg, setIsSearchingOrg] = useState(false);
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  
  // Inline Org form state
  const [newOrgUsername, setNewOrgUsername] = useState('');
  const [newOrgIndustry, setNewOrgIndustry] = useState('');
  const [newOrgStage, setNewOrgStage] = useState('');
  const [newOrgBio, setNewOrgBio] = useState('');
  const [isSubmittingOrg, setIsSubmittingOrg] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (!organizationName || organizationName.length < 2) {
      setOrgSearchResults([]);
      return;
    }
    // Only search if we haven't selected an existing org yet
    if (organizationId) return;

    const timer = setTimeout(async () => {
      setIsSearchingOrg(true);
      const results = await searchOrganizations(organizationName);
      setOrgSearchResults(results);
      setIsSearchingOrg(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [organizationName, organizationId]);

  // Step 4 — Interests & Hobbies
  const [interests, setInterests] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState<string[]>([]);

  // Step 5 — Bio
  const [bio, setBio] = useState('');

  const checkUsername = useCallback(async (val: string) => {
    if (!val || val.length < 3) return;
    setUsernameStatus('checking');
    try {
      const result = await checkUsernameAvailability(val);
      setUsernameStatus(result.available ? 'ok' : 'taken');
    } catch {
      setUsernameStatus('idle');
    }
  }, []);

  const handleUsernameChange = (val: string) => {
    const clean = val.replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase();
    setUsername(clean);
    setUsernameStatus('idle');
    if (clean.length >= 3) {
      setTimeout(() => checkUsername(clean), 400);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Profile photo must be under 5MB.'); return; }
    setAvatarUploading(true);
    try {
      const supabase = createClient();
      const fileName = `avatar-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
      const { data, error: uploadError } = await supabase.storage.from('uploads').upload(fileName, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(data.path);
      setAvatarUrl(publicUrl);
    } catch (err: any) {
      setError('Failed to upload photo. Please try again.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const addSkill = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 15) {
      setSkills(prev => [...prev, trimmed]);
    }
    setSkillInput('');
  };

  const toggleInterest = (item: string) => {
    setInterests(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };
  const toggleHobby = (item: string) => {
    setHobbies(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleFinish = () => {
    setError('');
    startTransition(async () => {
      const result = await completePersonalOnboarding({
        username,
        bio,
        avatarUrl: avatarUrl || undefined,
        city, state, country,
        field: selectedField,
        profession: selectedRole || customRole || undefined,
        organizationName: organizationName || undefined,
        organizationId: organizationId || undefined,
        skills,
        interests,
        hobbies,
      });
      if (result?.error) setError(result.error);
    });
  };

  const filteredFields = PROFESSION_TAXONOMY.filter(f =>
    !fieldSearch || f.field.toLowerCase().includes(fieldSearch.toLowerCase())
  );
  const currentFieldData = PROFESSION_TAXONOMY.find(f => f.field === selectedField);

  const progressPct = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="onboarding-container">
      {/* Progress */}
      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: '#71717A' }}>Step {step} of {TOTAL_STEPS}</span>
        <span style={{ fontSize: '13px', color: '#71717A' }}>
          {['Profile', 'Location', 'Career', 'Interests', 'Bio'][step - 1]}
        </span>
      </div>
      <div className="onboarding-progress-bar">
        <div className="onboarding-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {error && <p className="login-error">{error}</p>}

      {/* STEP 1 — Profile */}
      {step === 1 && (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0' }}>Set up your profile</h2>
          <p style={{ color: '#71717A', fontSize: '14px', margin: '0 0 24px 0' }}>Choose a username and add a profile photo.</p>

          {/* Avatar upload */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <label htmlFor="avatar-upload" style={{ cursor: 'pointer' }}>
              <div style={{
                width: 96, height: 96, borderRadius: '50%',
                background: avatarUrl ? 'transparent' : 'rgba(255,255,255,0.08)',
                border: '2px dashed rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', position: 'relative'
              }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '32px' }}>📷</span>
                )}
                {avatarUploading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white' }}>Uploading…</div>
                )}
              </div>
            </label>
            <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
            <span style={{ marginTop: '8px', fontSize: '13px', color: '#71717A' }}>
              {avatarUrl ? 'Tap to change' : 'Add profile photo (optional)'}
            </span>
          </div>

          {/* Username */}
          <label style={{ display: 'block', fontSize: '13px', color: '#A1A1AA', marginBottom: '6px' }}>Username</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#52525B', fontSize: '15px' }}>@</span>
            <input
              className="onboarding-input"
              style={{ paddingLeft: '28px' }}
              type="text"
              value={username}
              onChange={e => handleUsernameChange(e.target.value)}
              placeholder="yourusername"
              autoCapitalize="none"
              autoComplete="username"
            />
          </div>
          {usernameStatus === 'checking' && <p style={{ color: '#71717A', fontSize: '12px', marginTop: '4px' }}>Checking…</p>}
          {usernameStatus === 'ok' && <p style={{ color: '#10B981', fontSize: '12px', marginTop: '4px' }}>✓ Available</p>}
          {usernameStatus === 'taken' && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>✗ Already taken</p>}

          <div style={{ marginTop: '32px' }}>
            <button
              className="btn-onboarding-primary"
              onClick={() => {
                if (!username || username.length < 3) return setError('Username must be at least 3 characters.');
                if (usernameStatus === 'taken') return setError('Please choose a different username.');
                setError('');
                setStep(2);
              }}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — Location */}
      {step === 2 && (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0' }}>Where are you from?</h2>
          <p style={{ color: '#71717A', fontSize: '14px', margin: '0 0 24px 0' }}>Used for local ranking and connecting with nearby people.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input className="onboarding-input" placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} />
            <input className="onboarding-input" placeholder="State / Province" value={state} onChange={e => setState(e.target.value)} />
            <input className="onboarding-input" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
          </div>

          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-onboarding-primary" onClick={() => setStep(3)}>Continue →</button>
            <button className="btn-onboarding-secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="btn-onboarding-skip" onClick={() => setStep(3)}>Skip for now</button>
          </div>
        </div>
      )}

      {/* STEP 3 — Field & Profession */}
      {step === 3 && (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0' }}>What do you do?</h2>
          <p style={{ color: '#71717A', fontSize: '14px', margin: '0 0 20px 0' }}>Choose your field and profession. This defines your identity on Amerigam.</p>

          <input
            className="onboarding-input"
            placeholder="Search fields…"
            value={fieldSearch}
            onChange={e => setFieldSearch(e.target.value)}
            style={{ marginBottom: '12px' }}
          />

          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
            {filteredFields.map(f => (
              <button
                key={f.field}
                className={`onboarding-field-card ${selectedField === f.field ? 'selected' : ''}`}
                onClick={() => { setSelectedField(f.field); setSelectedRole(''); setCustomRole(''); }}
              >
                <span style={{ fontSize: '20px' }}>{f.icon}</span>
                <span style={{ fontSize: '15px', fontWeight: 500 }}>{f.field}</span>
              </button>
            ))}
          </div>

          {selectedField && (
            <>
              <p style={{ fontSize: '13px', color: '#A1A1AA', marginBottom: '10px' }}>
                Choose your role in <strong style={{ color: 'white' }}>{selectedField}</strong>:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {(currentFieldData?.roles || []).map(role => (
                  <button
                    key={role}
                    className={`onboarding-pill ${selectedRole === role ? 'selected' : ''}`}
                    onClick={() => { setSelectedRole(role); setCustomRole(''); }}
                  >
                    {role}
                  </button>
                ))}
              </div>
              <input
                className="onboarding-input"
                placeholder="Or type a custom role…"
                value={customRole}
                onChange={e => { setCustomRole(e.target.value); setSelectedRole(''); }}
                style={{ marginBottom: '4px' }}
              />
              <p style={{ fontSize: '12px', color: '#71717A', margin: '0 0 16px 0' }}>e.g. Diamond Artisan, Pattern Maker, AI Researcher</p>

              {(selectedField === 'Business' || selectedField === 'Organization') && (
                <div style={{ marginBottom: '16px', position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#A1A1AA', marginBottom: '8px' }}>
                    Company / Organization
                  </label>
                  {!organizationId && !isCreatingOrg ? (
                    <>
                      <input
                        className="onboarding-input"
                        placeholder="Type to search..."
                        value={organizationName}
                        onChange={e => {
                          setOrganizationName(e.target.value);
                          if (e.target.value.length < 2) setOrgSearchResults([]);
                        }}
                      />
                      {isSearchingOrg && <div style={{ fontSize: '12px', color: '#71717A', marginTop: '4px' }}>Searching...</div>}
                      {orgSearchResults.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#18181B', border: '1px solid #3F3F46', borderRadius: '8px', zIndex: 10, marginTop: '4px', overflow: 'hidden' }}>
                          {orgSearchResults.map(org => (
                            <button
                              key={org.id}
                              style={{ width: '100%', padding: '12px', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: '1px solid #27272A', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                              onClick={() => {
                                setOrganizationId(org.id);
                                setOrganizationName(org.name || org.username);
                                setOrgSearchResults([]);
                              }}
                            >
                              <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#27272A', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {org.avatarData ? <img src={org.avatarData} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{org.name?.charAt(0) || 'O'}</span>}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 500, fontSize: '14px' }}>{org.name || org.username}</span>
                                <span style={{ fontSize: '12px', color: '#A1A1AA' }}>{org.accountType}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : isCreatingOrg ? (
                    <div style={{ padding: '16px', background: '#18181B', border: '1px solid #3F3F46', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', color: 'white', fontWeight: 600 }}>Create New {selectedField === 'Organization' ? 'Organization' : 'Business'}</h4>
                      <input className="onboarding-input" placeholder="Organization Name" value={organizationName} onChange={e => setOrganizationName(e.target.value)} />
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#52525B' }}>@</span>
                        <input className="onboarding-input" style={{ paddingLeft: '28px' }} placeholder="username" value={newOrgUsername} onChange={e => setNewOrgUsername(e.target.value.replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase())} />
                      </div>
                      <input className="onboarding-input" placeholder="Industry / Type" value={newOrgIndustry} onChange={e => setNewOrgIndustry(e.target.value)} />
                      {selectedField === 'Business' && (
                        <input className="onboarding-input" placeholder="Stage (e.g. Startup, Enterprise)" value={newOrgStage} onChange={e => setNewOrgStage(e.target.value)} />
                      )}
                      <textarea className="onboarding-input" placeholder="Short Bio" rows={2} value={newOrgBio} onChange={e => setNewOrgBio(e.target.value)} />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button 
                          className="btn-onboarding-primary" 
                          disabled={isSubmittingOrg || !organizationName || !newOrgUsername}
                          onClick={async () => {
                            setIsSubmittingOrg(true);
                            const res = await createOrganizationInline({
                              accountType: selectedField === 'Organization' ? 'ORGANIZATION' : 'BUSINESS',
                              name: organizationName,
                              username: newOrgUsername,
                              industry: newOrgIndustry,
                              stage: newOrgStage,
                              bio: newOrgBio,
                              city,
                              country
                            });
                            if (res.error) {
                              setError(res.error);
                            } else if (res.success) {
                              setOrganizationId(res.orgId as string);
                              setIsCreatingOrg(false);
                            }
                            setIsSubmittingOrg(false);
                          }}
                        >
                          {isSubmittingOrg ? 'Creating...' : 'Create & Attach'}
                        </button>
                        <button className="btn-onboarding-secondary" onClick={() => setIsCreatingOrg(false)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#18181B', border: '1px solid #3F3F46', borderRadius: '12px' }}>
                      <div style={{ color: 'white', fontWeight: 600 }}>{organizationName}</div>
                      <button style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '13px', cursor: 'pointer' }} onClick={() => { setOrganizationId(''); setOrganizationName(''); }}>
                        Remove
                      </button>
                    </div>
                  )}
                  {/* Show Not Found Message */}
                  {!organizationId && organizationName.length >= 2 && !isSearchingOrg && orgSearchResults.length === 0 && !isCreatingOrg && (
                    <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
                      <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--danger)' }}>
                        No account found for "{organizationName}". 
                      </p>
                      <button 
                        className="btn-onboarding-primary" 
                        style={{ padding: '8px 12px', fontSize: '13px', width: 'auto' }}
                        onClick={() => {
                          setNewOrgUsername(organizationName.replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase());
                          setIsCreatingOrg(true);
                        }}
                      >
                        Create Account Now
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Skills */}
          <label style={{ display: 'block', fontSize: '13px', color: '#A1A1AA', marginBottom: '8px' }}>
            Skills <span style={{ color: '#52525B' }}>(optional, max 15)</span>
          </label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              className="onboarding-input"
              placeholder="Add a skill, press Enter"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addSkill(skillInput);
                }
              }}
              style={{ flex: 1 }}
            />
            <button
              onClick={() => addSkill(skillInput)}
              style={{ padding: '0 16px', background: '#3B82F6', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontWeight: 600 }}
            >
              Add
            </button>
          </div>
          {skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              {skills.map(skill => (
                <span key={skill} className="onboarding-tag">
                  {skill}
                  <button className="onboarding-tag-remove" onClick={() => setSkills(prev => prev.filter(s => s !== skill))}>×</button>
                </span>
              ))}
            </div>
          )}

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              className="btn-onboarding-primary" 
              onClick={() => setStep(4)}
              disabled={!!(organizationName && !organizationId)}
            >
              Continue →
            </button>
            <button className="btn-onboarding-secondary" onClick={() => setStep(2)}>← Back</button>
            <button 
              className="btn-onboarding-skip" 
              onClick={() => setStep(4)}
              disabled={!!(organizationName && !organizationId)}
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 — Interests & Hobbies */}
      {step === 4 && (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0' }}>Interests & Hobbies</h2>
          <p style={{ color: '#71717A', fontSize: '14px', margin: '0 0 20px 0' }}>This helps personalize your feed and community suggestions.</p>

          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: 'white' }}>Interests</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {INTEREST_OPTIONS.map(item => (
              <button key={item} className={`onboarding-pill ${interests.includes(item) ? 'selected' : ''}`} onClick={() => toggleInterest(item)}>
                {item}
              </button>
            ))}
          </div>

          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: 'white' }}>Hobbies</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {HOBBY_OPTIONS.map(item => (
              <button key={item} className={`onboarding-pill ${hobbies.includes(item) ? 'selected' : ''}`} onClick={() => toggleHobby(item)}>
                {item}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-onboarding-primary" onClick={() => setStep(5)}>Continue →</button>
            <button className="btn-onboarding-secondary" onClick={() => setStep(3)}>← Back</button>
            <button className="btn-onboarding-skip" onClick={() => setStep(5)}>Skip for now</button>
          </div>
        </div>
      )}

      {/* STEP 5 — Bio */}
      {step === 5 && (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0' }}>Write a short bio</h2>
          <p style={{ color: '#71717A', fontSize: '14px', margin: '0 0 20px 0' }}>Tell people who you are. Max 200 characters.</p>

          <textarea
            className="onboarding-input"
            placeholder="e.g. Diamond artisan from Surat. Passionate about craft and quality."
            value={bio}
            onChange={e => setBio(e.target.value.slice(0, 200))}
            rows={4}
            style={{ resize: 'none', paddingTop: '14px' }}
          />
          <p style={{ textAlign: 'right', fontSize: '12px', color: '#52525B', marginTop: '4px' }}>{bio.length}/200</p>

          {error && <p className="login-error" style={{ marginTop: '12px' }}>{error}</p>}

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-onboarding-primary" onClick={handleFinish} disabled={isPending}>
              {isPending ? 'Setting up your profile…' : '🎉 Finish & Enter Amerigam'}
            </button>
            <button className="btn-onboarding-secondary" onClick={() => setStep(4)}>← Back</button>
            <button className="btn-onboarding-skip" onClick={handleFinish} disabled={isPending}>Skip bio & finish</button>
          </div>
        </div>
      )}
    </div>
  );
}

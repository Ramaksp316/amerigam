'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { completeOnboarding } from './actions';
import { Camera, Search, Briefcase, Palette, Activity, Compass, Zap, BrainCircuit, Sparkles, Coffee, BookOpen, Mic, Users } from 'lucide-react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.min.css';

const masterPathData = {
    "The Professional": [
        { name: "Tech & AI", icon: <Briefcase size={24} />, desc: "Code, Data, Web3" },
        { name: "Business & Startups", icon: <Activity size={24} />, desc: "Founders, VC, Growth" },
        { name: "Corporate & Jobs", icon: <Briefcase size={24} />, desc: "Career, Mgmt, HR" },
        { name: "Finance & Markets", icon: <Activity size={24} />, desc: "Trading, Crypto, Econ" }
    ],
    "The Creator": [
        { name: "Visual Arts", icon: <Palette size={24} />, desc: "Paint, Digital, 3D" },
        { name: "Media & Lens", icon: <Camera size={24} />, desc: "Video, Photo, Film" },
        { name: "Performing Arts", icon: <Activity size={24} />, desc: "Music, Dance, Act" },
        { name: "Words & Design", icon: <Palette size={24} />, desc: "Write, UI/UX, Fashion" }
    ],
    "The Athlete": [
        { name: "Field & Court", icon: <Activity size={24} />, desc: "Cricket, Football, etc." },
        { name: "Fitness & Strength", icon: <Activity size={24} />, desc: "Gym, CrossFit, Yoga" },
        { name: "Combat & Martial Arts", icon: <Activity size={24} />, desc: "MMA, Boxing, Karate" },
        { name: "E-Sports & Gaming", icon: <Activity size={24} />, desc: "Compete, Strategy" }
    ],
    "The Explorer": [
        { name: "The Philosophers", icon: <BrainCircuit size={24} />, desc: "Science, Mind, Universe" },
        { name: "The Chill Zone", icon: <Coffee size={24} />, desc: "Casual, Movies, Memes" },
        { name: "Study & Focus", icon: <BookOpen size={24} />, desc: "Habits, Co-working" },
        { name: "Travel & Culture", icon: <Compass size={24} />, desc: "Explore, Food, Vlogs" }
    ]
};

const hobbyData: Record<string, string[]> = {
    "Tech & AI": ["Machine Learning", "Open Source", "Web3", "Cybersecurity", "Robotics", "Game Dev", "App Dev", "Cloud Computing", "Data Science"],
    "Business & Startups": ["Venture Capital", "Bootstrapping", "Product Management", "SEO", "E-Commerce", "B2B Sales", "Brand Building", "Networking"],
    "Corporate & Jobs": ["Leadership", "Career Growth", "Corporate Strategy", "Agile & Scrum", "Business Analytics", "Public Speaking", "HR"],
    "Finance & Markets": ["Stock Trading", "Cryptocurrency", "Personal Finance", "Real Estate", "Macroeconomics", "Forex", "Fintech"],
    "Visual Arts": ["Oil Painting", "Digital Art", "Sculpting", "Typography", "3D Modeling", "Sketching"],
    "Media & Lens": ["Filmmaking", "Photography", "Color Grading", "VFX"],
    "Performing Arts": ["Music Production", "Vocals", "Guitar", "Dance", "Acting"],
    "Words & Design": ["UI/UX Design", "Copywriting", "Poetry", "Screenwriting"],
    "Field & Court": ["Cricket", "Football", "Basketball", "Tennis"],
    "Fitness & Strength": ["Powerlifting", "Calisthenics", "CrossFit", "Yoga"],
    "Combat & Martial Arts": ["Boxing", "MMA", "Judo", "Karate"],
    "E-Sports & Gaming": ["Strategy Games", "FPS", "Speedrunning", "Board Games"],
    "The Philosophers": ["Stoicism", "Psychology", "Astrophysics", "Ethics", "History"],
    "The Chill Zone": ["Meme Culture", "Movie Buff", "Anime", "Standup Comedy"],
    "Study & Focus": ["Pomodoro", "Language Learning", "Note Taking", "Speed Reading"],
    "Travel & Culture": ["Backpacking", "Adventure", "Food Vlogging", "Camping", "Languages"]
};

const generalHobbies = ["Fitness & Gym", "Yoga & Meditation", "Cooking & Baking", "Traveling", "Reading", "Gaming", "Chess", "Photography", "Playing Instruments", "Singing", "Gardening", "Trekking", "DIY & Crafting", "Pet Care"];

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    
    // State
    const [masterPath, setMasterPath] = useState("");
    const [corePath, setCorePath] = useState("");
    const [hobbies, setHobbies] = useState<string[]>([]);
    const [mindset, setMindset] = useState("");
    const [vision, setVision] = useState("");
    
    // Identity State
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [location, setLocation] = useState("");
    const [portfolio, setPortfolio] = useState("");
    const [pledge, setPledge] = useState(false);
    
    const [hobbySearch, setHobbySearch] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Derived Hobbies
    const coreInterests = (corePath && hobbyData[corePath] ? hobbyData[corePath] : []).filter(h => h.toLowerCase().includes(hobbySearch.toLowerCase()));
    const filteredGeneralHobbies = generalHobbies.filter(h => h.toLowerCase().includes(hobbySearch.toLowerCase()));

    const toggleHobby = (hobby: string) => {
        if (hobbies.includes(hobby)) {
            setHobbies(hobbies.filter(h => h !== hobby));
        } else {
            setHobbies([...hobbies, hobby]);
        }
    };

    const handleNext = () => {
        if (step === 1 && !masterPath) return alert("Select your primary focus");
        if (step === 2 && !corePath) return alert("Select your specific arena");
        if (step === 3 && hobbies.length === 0) return alert("Select at least one hobby");
        if (step === 4 && !mindset) return alert("Select your mindset");
        if (step === 5 && !vision) return alert("Select your vision");
        setStep(step + 1);
    };

    const handleSubmit = async () => {
        if (!name || !username) return alert("Name and username are required");
        if (!pledge) return alert("You must agree to the pledge");
        
        setIsSaving(true);
        const result = await completeOnboarding({
            masterPath,
            corePath,
            hobbies: JSON.stringify(hobbies),
            mindset,
            vision,
            name,
            username,
            bio,
            location,
            portfolio
        });
        
        if (result.success) {
            router.push('/feed');
        } else {
            alert(result.error);
            setIsSaving(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px', minHeight: '80vh', alignItems: 'center' }}>
            <div className="card" style={{ width: '100%', maxWidth: '550px', minHeight: '550px', display: 'flex', flexDirection: 'column' }}>
                
                <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', marginBottom: '20px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', backgroundColor: 'var(--text-primary)', width: `${(step / 6) * 100}%`, transition: 'width 0.3s ease' }}></div>
                </div>
                
                <h1 className="heading-jakaas" style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '30px' }}>AMERIGAM</h1>

                {/* Step 1: Master Path */}
                {step === 1 && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h2 className="heading-jakaas" style={{ fontSize: '3rem', marginBottom: '10px' }}>DEFINE YOUR PATH</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>What is your primary focus?</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                            {["The Professional", "The Creator", "The Athlete", "The Explorer"].map(path => (
                                <div key={path} 
                                    className={`card hoverable-card ${masterPath === path ? 'selected' : ''}`}
                                    onClick={() => { setMasterPath(path); setCorePath(""); }}
                                    style={{ 
                                        padding: '20px 10px', 
                                        textAlign: 'center', 
                                        cursor: 'pointer',
                                        borderColor: masterPath === path ? 'var(--text-primary)' : 'var(--border-color)',
                                        backgroundColor: masterPath === path ? 'var(--text-primary)' : 'var(--card-bg)',
                                        color: masterPath === path ? 'var(--bg-color)' : 'var(--text-primary)'
                                    }}>
                                    <strong style={{ display: 'block', fontSize: '1.1rem' }}>{path}</strong>
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ marginTop: 'auto' }}>
                            <button className="btn" onClick={handleNext}>CONTINUE</button>
                        </div>
                    </div>
                )}

                {/* Step 2: Core */}
                {step === 2 && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h2 className="heading-jakaas" style={{ fontSize: '3rem', marginBottom: '10px' }}>THE CORE</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Choose your specific arena.</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                            {masterPathData[masterPath as keyof typeof masterPathData]?.map(core => (
                                <div key={core.name} 
                                    className={`card hoverable-card`}
                                    onClick={() => setCorePath(core.name)}
                                    style={{ 
                                        padding: '15px 10px', 
                                        textAlign: 'center', 
                                        cursor: 'pointer',
                                        borderColor: corePath === core.name ? 'var(--text-primary)' : 'var(--border-color)',
                                        backgroundColor: corePath === core.name ? 'var(--text-primary)' : 'var(--card-bg)',
                                        color: corePath === core.name ? 'var(--bg-color)' : 'var(--text-primary)'
                                    }}>
                                    <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '5px' }}>{core.name}</strong>
                                    <small style={{ color: corePath === core.name ? 'var(--bg-color)' : 'var(--text-secondary)' }}>{core.desc}</small>
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                            <button className="btn btn-outline" onClick={() => setStep(1)}>BACK</button>
                            <button className="btn" onClick={handleNext}>CONTINUE</button>
                        </div>
                    </div>
                )}

                {/* Step 3: Hobbies */}
                {step === 3 && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h2 className="heading-jakaas" style={{ fontSize: '3rem', marginBottom: '10px' }}>THE PASSIONS</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>What do you do for the soul?</p>
                        
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Search hobbies..." 
                            value={hobbySearch} 
                            onChange={e => setHobbySearch(e.target.value)} 
                        />
                        
                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase' }}>Core Interests</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                                {coreInterests.map(hobby => (
                                    <div key={hobby} onClick={() => toggleHobby(hobby)} style={{
                                        padding: '8px 16px', borderRadius: '50px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500,
                                        border: `1px solid ${hobbies.includes(hobby) ? 'var(--text-primary)' : 'var(--border-color)'}`,
                                        backgroundColor: hobbies.includes(hobby) ? 'var(--text-primary)' : 'transparent',
                                        color: hobbies.includes(hobby) ? 'var(--bg-color)' : 'var(--text-primary)'
                                    }}>{hobby}</div>
                                ))}
                            </div>

                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase' }}>Off-Duty Hobbies</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {filteredGeneralHobbies.map(hobby => (
                                    <div key={hobby} onClick={() => toggleHobby(hobby)} style={{
                                        padding: '8px 16px', borderRadius: '50px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500,
                                        border: `1px solid ${hobbies.includes(hobby) ? 'var(--text-primary)' : 'var(--border-color)'}`,
                                        backgroundColor: hobbies.includes(hobby) ? 'var(--text-primary)' : 'transparent',
                                        color: hobbies.includes(hobby) ? 'var(--bg-color)' : 'var(--text-primary)'
                                    }}>{hobby}</div>
                                ))}
                            </div>
                        </div>
                        
                        <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                            <button className="btn btn-outline" onClick={() => setStep(2)}>BACK</button>
                            <button className="btn" onClick={handleNext}>CONTINUE</button>
                        </div>
                    </div>
                )}

                {/* Step 4: Mindset */}
                {step === 4 && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h2 className="heading-jakaas" style={{ fontSize: '3rem', marginBottom: '10px' }}>THE MINDSET</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>What kind of energy are you looking for?</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                            {["Fast-paced Builders", "Deep Thinkers", "Creative Souls", "Casual Explorers"].map(m => (
                                <div key={m} onClick={() => setMindset(m)} className="card hoverable-card" style={{
                                    padding: '15px', cursor: 'pointer',
                                    borderColor: mindset === m ? 'var(--text-primary)' : 'var(--border-color)',
                                    backgroundColor: mindset === m ? 'var(--text-primary)' : 'var(--card-bg)',
                                    color: mindset === m ? 'var(--bg-color)' : 'var(--text-primary)'
                                }}>
                                    <strong style={{ fontSize: '1.1rem' }}>{m}</strong>
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                            <button className="btn btn-outline" onClick={() => setStep(3)}>BACK</button>
                            <button className="btn" onClick={handleNext}>CONTINUE</button>
                        </div>
                    </div>
                )}

                {/* Step 5: Vision */}
                {step === 5 && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h2 className="heading-jakaas" style={{ fontSize: '3rem', marginBottom: '10px' }}>THE VISION</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Why are you entering The Collective?</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                            {["To Learn & Grow", "To Teach & Share", "To Collaborate", "To Showcase", "To Explore & Adventure"].map(v => (
                                <div key={v} onClick={() => setVision(v)} className="card hoverable-card" style={{
                                    padding: '15px', cursor: 'pointer',
                                    borderColor: vision === v ? 'var(--text-primary)' : 'var(--border-color)',
                                    backgroundColor: vision === v ? 'var(--text-primary)' : 'var(--card-bg)',
                                    color: vision === v ? 'var(--bg-color)' : 'var(--text-primary)'
                                }}>
                                    <strong style={{ fontSize: '1.1rem' }}>{v}</strong>
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                            <button className="btn btn-outline" onClick={() => setStep(4)}>BACK</button>
                            <button className="btn" onClick={handleNext}>CONTINUE</button>
                        </div>
                    </div>
                )}

                {/* Step 6: Identity */}
                {step === 6 && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h2 className="heading-jakaas" style={{ fontSize: '3rem', marginBottom: '10px' }}>THE IDENTITY</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Build your authentic profile.</p>
                        
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <input type="text" className="input-field" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                            <input type="text" className="input-field" placeholder="@username" value={username} onChange={e => setUsername(e.target.value)} required />
                        </div>
                        
                        <textarea className="input-field" placeholder="Short Bio (e.g. Building AI tools...)" value={bio} onChange={e => setBio(e.target.value)} style={{ resize: 'none', height: '80px' }}></textarea>
                        <input type="text" className="input-field" placeholder="Location (City, Country)" value={location} onChange={e => setLocation(e.target.value)} />
                        <input type="url" className="input-field" placeholder="Portfolio / Social Link" value={portfolio} onChange={e => setPortfolio(e.target.value)} />
                        
                        <label style={{ display: 'flex', gap: '10px', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', marginBottom: '20px', alignItems: 'flex-start' }}>
                            <input type="checkbox" checked={pledge} onChange={e => setPledge(e.target.checked)} style={{ marginTop: '4px' }} />
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>The Collective Pledge:</strong> I pledge to keep my interactions real, respectful, and purpose-driven.
                            </span>
                        </label>
                        
                        <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                            <button className="btn btn-outline" onClick={() => setStep(5)}>BACK</button>
                            <button className="btn" onClick={handleSubmit} disabled={isSaving}>{isSaving ? 'SAVING...' : 'ENTER COLLECTIVE'}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

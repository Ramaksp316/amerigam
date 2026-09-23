'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Image as ImageIcon, X } from 'lucide-react';
import { uploadMedia } from '@/lib/upload';

export default function EditEventForm({ event }: { event: any }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>(event.coverImage || '');
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [paymentQrFile, setPaymentQrFile] = useState<File | null>(null);
  const [paymentQrPreview, setPaymentQrPreview] = useState<string>(event.paymentQrCode || '');
  const qrInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const removeCover = () => {
    setCoverImageFile(null);
    setCoverImagePreview('');
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const handleQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPaymentQrFile(file);
      setPaymentQrPreview(URL.createObjectURL(file));
    }
  };

  const removeQr = () => {
    setPaymentQrFile(null);
    setPaymentQrPreview('');
    if (qrInputRef.current) qrInputRef.current.value = '';
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    let mediaUrl = coverImagePreview !== event.coverImage ? coverImagePreview : event.coverImage;
    let qrUrl = paymentQrPreview !== event.paymentQrCode ? paymentQrPreview : event.paymentQrCode;

    try {
      if (coverImageFile) {
        if (coverImageFile.size > 50 * 1024 * 1024) throw new Error('Cover image must be less than 50MB.');
        mediaUrl = await uploadMedia(coverImageFile, 'events');
      }

      if (paymentQrFile) {
        if (paymentQrFile.size > 50 * 1024 * 1024) throw new Error('QR image must be less than 50MB.');
        qrUrl = await uploadMedia(paymentQrFile, 'qrs');
      }

      const data = {
        name: formData.get('name'),
        shortDescription: formData.get('shortDescription'),
        description: formData.get('description'),
        category: formData.get('category'),
        tags: formData.get('tags'),
        coverImage: !coverImagePreview ? null : mediaUrl,
        paymentQrCode: !paymentQrPreview ? null : qrUrl,
        eventLevel: formData.get('eventLevel'),
        locationType: formData.get('locationType'),
        venue: formData.get('venue'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        registrationStart: formData.get('registrationStart'),
        registrationEnd: formData.get('registrationEnd'),
        entryFee: parseFloat(formData.get('entryFee') as string) || 0,
        currency: formData.get('currency'),
        participantLimit: parseInt(formData.get('participantLimit') as string) || null,
        minTeamSize: parseInt(formData.get('minTeamSize') as string) || null,
        maxTeamSize: parseInt(formData.get('maxTeamSize') as string) || null,
        requireApproval: formData.get('requireApproval') === 'on',
        allowTeams: formData.get('allowTeams') === 'on',
        requireSubmissions: formData.get('requireSubmissions') === 'on',
        eligibility: formData.get('eligibility'),
        rules: formData.get('rules'),
        prizePool: formData.get('prizePool'),
      };

      const res = await fetch(`/api/events/${event.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const resData = await res.json();
      if (res.ok) {
        router.push(`/competitions/${event.id}/manage`);
        router.refresh();
      } else {
        setErrorMsg(resData.error || 'Failed to update event');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error updating event');
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 16);
  };

  return (
    <form key={event.id} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {errorMsg && <div style={{ color: '#EF4444', background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px' }}>{errorMsg}</div>}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '14px', fontWeight: 600 }}>Cover Image</label>
        <input type="file" accept="image/*" onChange={handleCoverChange} ref={coverInputRef} style={{ display: 'none' }} />
        {!coverImagePreview ? (
          <div onClick={() => coverInputRef.current?.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '32px', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <ImageIcon size={24} color="#71717A" />
            <span style={{ fontSize: '14px', color: '#A1A1AA' }}>Upload cover image</span>
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <img src={coverImagePreview} alt="Cover" style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
            <button type="button" onClick={removeCover} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', cursor: 'pointer' }}><X size={16} /></button>
          </div>
        )}
      </div>

      <input type="text" name="name" key={event.id} defaultValue={event.name} placeholder="Event Name" required className="input-field" />
      <input type="text" name="shortDescription" key={event.id} defaultValue={event.shortDescription || ''} placeholder="Short Description (1-2 sentences)" className="input-field" />
      <textarea name="description" key={event.id} defaultValue={event.description} placeholder="Full Description" rows={4} className="input-field" style={{ resize: 'vertical' }}></textarea>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <select name="category" key={event.id} defaultValue={event.category} className="input-field" required>
          <option value="">Select Category</option>
          <option value="Technology">Technology</option>
          <option value="Startup / Business">Startup / Business</option>
          <option value="Art">Art</option>
          <option value="Design">Design</option>
          <option value="Sports">Sports</option>
          <option value="Photography">Photography</option>
          <option value="Film">Film</option>
          <option value="Music">Music</option>
          <option value="Public Speaking">Public Speaking</option>
          <option value="Gaming">Gaming</option>
          <option value="Hackathon">Hackathon</option>
          <option value="Other">Other</option>
        </select>
        <input type="text" name="tags" key={event.id} defaultValue={event.tags || ''} placeholder="Tags (comma separated)" className="input-field" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <select name="eventLevel" key={event.id} defaultValue={event.eventLevel} className="input-field" required>
          <option value="Local">Local</option>
          <option value="District">District</option>
          <option value="State">State</option>
          <option value="National">National</option>
          <option value="International">International</option>
        </select>
        <select name="locationType" key={event.id} defaultValue={event.locationType} className="input-field" required>
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
          <option value="HYBRID">Hybrid</option>
        </select>
      </div>

      <input type="text" name="venue" key={event.id} defaultValue={event.venue || ''} placeholder="Venue / Online Link" className="input-field" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registration Start</label>
          <input type="datetime-local" name="registrationStart" key={event.id} defaultValue={formatDate(event.registrationStart)} className="input-field" />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registration End</label>
          <input type="datetime-local" name="registrationEnd" key={event.id} defaultValue={formatDate(event.registrationEnd)} className="input-field" />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Event Start</label>
          <input type="datetime-local" name="startDate" key={event.id} defaultValue={formatDate(event.startDate)} required className="input-field" />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Event End</label>
          <input type="datetime-local" name="endDate" key={event.id} defaultValue={formatDate(event.endDate)} required className="input-field" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', padding: '16px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', marginTop: '8px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 2 }}>
          <span style={{ fontSize: '13px', fontWeight: 500 }}>Entry Fee (0 for Free)</span>
          <input type="number" name="entryFee" key={event.id} defaultValue={event.entryFee} className="input-field" min="0" step="0.01" />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <span style={{ fontSize: '13px', fontWeight: 500 }}>Currency</span>
          <select name="currency" key={event.id} defaultValue={event.currency || 'INR'} className="input-field">
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </label>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontWeight: 600, fontSize: '14px' }}>Payment QR Code & UPI ID (Optional)</span>
        <span style={{ fontSize: '12px', color: '#A1A1AA' }}>Upload your UPI QR Code and enter your UPI ID for direct payment.</span>
        
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 500 }}>Organizer UPI ID (e.g. name@bank)</span>
          <input type="text" name="upiId" key={event.id} defaultValue={event.upiId || ''} className="input-field" placeholder="Enter your UPI ID for automatic app open" />
        </label>

        <input type="file" accept="image/*" onChange={handleQrChange} ref={qrInputRef} style={{ display: 'none' }} />
        
        {!paymentQrPreview ? (
          <div onClick={() => qrInputRef.current?.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '32px', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <ImageIcon size={24} color="#71717A" />
            <span style={{ fontSize: '14px', color: '#A1A1AA' }}>Click to upload QR code</span>
          </div>
        ) : (
          <div style={{ position: 'relative', width: '200px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <img src={paymentQrPreview} alt="QR Code" style={{ width: '100%', height: 'auto', display: 'block' }} />
            <button type="button" onClick={removeQr} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', cursor: 'pointer' }}><X size={16} /></button>
          </div>
        )}
      </div>

      <textarea name="eligibility" key={event.id} defaultValue={event.eligibility || ''} placeholder="Eligibility Criteria" rows={3} className="input-field" style={{ resize: 'vertical' }}></textarea>
      <textarea name="rules" key={event.id} defaultValue={event.rules || ''} placeholder="Rules" rows={3} className="input-field" style={{ resize: 'vertical' }}></textarea>
      <input type="text" name="prizePool" key={event.id} defaultValue={event.prizePool || ''} placeholder="Prize Pool" className="input-field" />
      <input type="number" name="participantLimit" key={event.id} defaultValue={event.participantLimit || ''} placeholder="Max Participants (Leave blank for unlimited)" className="input-field" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-primary)' }}>
          <input type="checkbox" name="allowTeams" defaultChecked={event.allowTeams} />
          Allow Teams
        </label>
        <div style={{ display: 'flex', gap: '1rem', opacity: event.allowTeams ? 1 : 0.5 }}>
          <input type="number" name="minTeamSize" key={event.id} defaultValue={event.minTeamSize || ''} placeholder="Min Team Size" className="input-field" style={{ flex: 1 }} />
          <input type="number" name="maxTeamSize" key={event.id} defaultValue={event.maxTeamSize || ''} placeholder="Max Team Size" className="input-field" style={{ flex: 1 }} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-primary)', marginTop: '8px' }}>
          <input type="checkbox" name="requireApproval" defaultChecked={event.requireApproval} />
          Require manual approval for registrations
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-primary)' }}>
          <input type="checkbox" name="requireSubmissions" defaultChecked={event.requireSubmissions} />
          Require project/URL submission
        </label>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 'var(--space-4)', padding: '16px', fontSize: '16px', fontWeight: 'bold' }}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}

const fs = require('fs');
let code = fs.readFileSync('app/create/CreateEventForm.tsx', 'utf8');

code = code.replace(
  "import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';",
  "import { ChevronRight, ChevronLeft, CheckCircle2, UploadCloud, X, Image as ImageIcon } from 'lucide-react';\nimport { createClient } from '@/utils/supabase/client';"
);

code = code.replace(
  "import { useState } from 'react';",
  "import { useState, useRef } from 'react';"
);

code = code.replace(
  "const [formData, setFormData] = useState({",
  `const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
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

  const [formData, setFormData] = useState({`
);

const uploadHtml = `<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
            </div>`;

code = code.replace(
  /<label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>\s*<span style={{ fontWeight: 600, fontSize: '14px' }}>Cover Image URL<\/span>[\s\S]*?<\/label>/g,
  uploadHtml
);

code = code.replace(
  "const submitCompetition = async (status: 'PUBLISHED' | 'DRAFT') => {\n    setLoading(true);\n    setErrorMsg('');\n    try {\n      const payload = {\n        ...formData,",
  `const submitCompetition = async (status: 'PUBLISHED' | 'DRAFT') => {
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
        
        const fileName = \`\${Date.now()}-\${coverImageFile.name.replace(/[^a-zA-Z0-9.\\-_]/g, '') || 'upload'}\`;
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
        coverImage: mediaUrl,`
);

fs.writeFileSync('app/create/CreateEventForm.tsx', code);
console.log('Done!');

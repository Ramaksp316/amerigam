const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../app/create/CreatePostForm.tsx");
let content = fs.readFileSync(filePath, "utf-8");

if (!content.includes("file.type.startsWith('video/')")) {
  content = content.replace(
    `} else {\n        setErrorMsg('Please upload a valid image file.');\n        clearMedia();\n      }`,
    `} else if (file.type.startsWith('video/')) {\n        setImageSrc(null);\n        const url = URL.createObjectURL(file);\n        setVideoSrc(url);\n        setHasMedia(true);\n        setCroppedBlob(null);\n        setCroppedPreview(null);\n      } else {\n        setErrorMsg('Please upload a valid image or video file.');\n        clearMedia();\n      }`
  );
  // Also CRLF version just in case
  content = content.replace(
    `} else {\r\n        setErrorMsg('Please upload a valid image file.');\r\n        clearMedia();\r\n      }`,
    `} else if (file.type.startsWith('video/')) {\r\n        setImageSrc(null);\r\n        const url = URL.createObjectURL(file);\r\n        setVideoSrc(url);\r\n        setHasMedia(true);\r\n        setCroppedBlob(null);\r\n        setCroppedPreview(null);\r\n      } else {\r\n        setErrorMsg('Please upload a valid image or video file.');\r\n        clearMedia();\r\n      }`
  );
}

if (!content.includes("showTagInput")) {
  content = content.replace("const [currentTag, setCurrentTag] = useState('');", "const [currentTag, setCurrentTag] = useState('');\n  const [showTagInput, setShowTagInput] = useState(false);");
}

const match = content.match(/  return \(\s*<form/);
if (!match) throw new Error("Could not find return statement");
const returnIndex = match.index;

const newReturn = `  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: '#000000', color: '#FFFFFF', padding: '12px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button type="button" onClick={handleBack} style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '15px', fontWeight: 500, padding: '4px 0' }}>
          Cancel
        </button>
        <h2 style={{ fontSize: '16px', margin: 0, fontWeight: 600 }}>New Post</h2>
        <button type="submit" disabled={isUploading || (!content.trim() && !hasMedia)} style={{ 
          background: isUploading || (!content.trim() && !hasMedia) ? '#1F2937' : '#3B82F6', 
          color: isUploading || (!content.trim() && !hasMedia) ? '#9CA3AF' : '#FFFFFF',
          border: 'none',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: isUploading || (!content.trim() && !hasMedia) ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s'
        }}>
          {isUploading ? 'Posting...' : 'Post'}
        </button>
      </div>

      {/* Account Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#27272A', overflow: 'hidden', flexShrink: 0 }}>
          {currentUser.profileImage ? <img src={currentUser.profileImage} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : null}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '15px', fontWeight: 600, lineHeight: 1.2 }}>{currentUser.name}</span>
          <span style={{ fontSize: '13px', color: '#71717A', marginTop: '2px' }}>@{currentUser.username}</span>
        </div>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '16px', fontSize: '14px' }}>
          {errorMsg}
        </div>
      )}

      {/* Main Composer Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <textarea 
          name="content" 
          placeholder="What's on your mind?" 
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          style={{ 
            width: '100%', 
            minHeight: '80px', 
            fontSize: '16px', 
            lineHeight: 1.5,
            border: 'none', 
            background: 'transparent', 
            color: '#FFFFFF',
            padding: '0', 
            marginBottom: '16px', 
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit'
          }}
          autoFocus
        />

        {/* Media Preview */}
        {hasMedia && (
          <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', background: '#0A0A0A', border: '1px solid #1A1A1A', marginBottom: '16px' }}>
            {croppedPreview && <img src={croppedPreview} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }} />}
            {videoSrc && (
              <video src={videoSrc} controls style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }} playsInline preload="metadata" />
            )}
            <button type="button" onClick={clearMedia} style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Topics / Tags UI */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {tags.map(tag => (
              <span key={tag} style={{ background: '#1A1A1A', color: '#3B82F6', padding: '6px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                #{tag} <X size={14} cursor="pointer" onClick={() => removeTag(tag)} style={{ color: '#71717A' }} />
              </span>
            ))}
          </div>
        )}
        
        {showTagInput && (
          <div style={{ marginBottom: '16px', padding: '12px', background: '#0A0A0A', borderRadius: '12px', border: '1px solid #1A1A1A' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Hash size={16} color="#71717A" />
              <input 
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Type a topic..." 
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFFFFF', width: '100%', fontSize: '14px' }}
                autoFocus
              />
              <button type="button" onClick={() => setShowTagInput(false)} style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', padding: '4px' }}>
                <X size={16} />
              </button>
            </div>
            
            {/* Suggested topics */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Startup', 'Design', 'Engineering', 'Photography', 'Business'].map(suggestion => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    if (!tags.includes(suggestion) && tags.length < 10) {
                      setTags([...tags, suggestion]);
                    }
                  }}
                  style={{ background: '#1A1A1A', border: 'none', color: '#A1A1AA', padding: '6px 10px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer' }}
                >
                  +{suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Creation Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '12px 0', borderTop: '1px solid #1A1A1A', marginTop: 'auto' }}>
        <input 
          type="file" 
          ref={fileInputRef}
          name="media" 
          accept="image/*,video/*" 
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#A1A1AA' }}>
          <ImageIcon size={24} />
        </button>
        <button type="button" onClick={() => setShowTagInput(!showTagInput)} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: showTagInput ? '#3B82F6' : '#A1A1AA' }}>
          <Hash size={24} />
        </button>
      </div>

      {/* Cropping Modal */}
      {isCropping && imageSrc && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#000000', display: 'flex', flexDirection: 'column', zIndex: 99999 }}>
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1A1A1A' }}>
            <button type="button" onClick={handleCropCancel} style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '15px' }}>Cancel</button>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Crop Photo</h3>
            <button type="button" onClick={handleCropSave} style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: '15px', fontWeight: 600 }}>Done</button>
          </div>
          
          <div style={{ flex: 1, position: 'relative', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', height: '100%' }}>
              <img ref={imageRef} src={imageSrc} alt="Source" style={{ maxWidth: '100%', display: 'block' }} />
            </div>
          </div>

          <div style={{ padding: '24px', display: 'flex', gap: '12px', justifyContent: 'center', background: '#0A0A0A', borderTop: '1px solid #1A1A1A' }}>
            <button type="button" onClick={() => changeCropRatio('original', NaN)} style={{ background: selectedAspectRatioType === 'original' ? '#27272A' : 'transparent', color: '#FFF', border: '1px solid #27272A', padding: '6px 12px', borderRadius: '16px', fontSize: '13px' }}>Free</button>
            <button type="button" onClick={() => changeCropRatio('square', 1)} style={{ background: selectedAspectRatioType === 'square' ? '#27272A' : 'transparent', color: '#FFF', border: '1px solid #27272A', padding: '6px 12px', borderRadius: '16px', fontSize: '13px' }}>1:1</button>
            <button type="button" onClick={() => changeCropRatio('portrait', 0.8)} style={{ background: selectedAspectRatioType === 'portrait' ? '#27272A' : 'transparent', color: '#FFF', border: '1px solid #27272A', padding: '6px 12px', borderRadius: '16px', fontSize: '13px' }}>4:5</button>
            <button type="button" onClick={() => changeCropRatio('landscape', 1.777)} style={{ background: selectedAspectRatioType === 'landscape' ? '#27272A' : 'transparent', color: '#FFF', border: '1px solid #27272A', padding: '6px 12px', borderRadius: '16px', fontSize: '13px' }}>16:9</button>
          </div>
        </div>
      )}
    </form>
  );
}
`;

content = content.substring(0, returnIndex) + newReturn;

fs.writeFileSync(filePath, content);
console.log("Rewritten CreatePostForm.tsx successfully!");

export default function TestAudioPage() {
  return (
    <div style={{ backgroundColor: '#000', color: 'white', minHeight: '100vh', padding: '20px' }}>
      <h1>Audio Diagnostic Test</h1>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>1. Standard Test Video (Big Buck Bunny)</h2>
        <p>This video DEFINITELY has an AAC audio track.</p>
        <video 
          controls 
          playsInline 
          style={{ width: '100%', maxWidth: '400px' }}
          src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>2. Typical Pexels Seeded Video</h2>
        <p>This is what we seeded. It likely HAS NO AUDIO TRACK AT ALL.</p>
        <video 
          controls 
          playsInline 
          style={{ width: '100%', maxWidth: '400px' }}
          src="https://videos.pexels.com/video-files/7690410/7690410-sd_540_960_30fps.mp4"
        />
      </div>
    </div>
  );
}

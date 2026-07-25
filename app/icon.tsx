import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const size = {
  width: 512,
  height: 512,
};
export const contentType = 'image/png';

export default function Icon() {
  try {
    const logoData = readFileSync(join(process.cwd(), 'public', 'logo.png'));
    const logoBase64 = logoData.toString('base64');
    
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
          }}
        >
          <img 
            src={`data:image/png;base64,${logoBase64}`} 
            style={{ width: '80%', height: '80%', objectFit: 'contain' }} 
          />
        </div>
      ),
      { ...size }
    );
  } catch (e) {
    // Fallback if file not found
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', background: 'black' }} />
      ),
      { ...size }
    );
  }
}

import { ImageResponse } from 'next/og';

export const size = {
  width: 512,
  height: 512,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FF0080 0%, #FF8C00 50%, #40E0D0 100%)',
          borderRadius: '112px',
        }}
      >
        <span style={{ fontSize: 320, color: 'white', fontWeight: 'bold', fontFamily: 'sans-serif' }}>A</span>
      </div>
    ),
    {
      ...size,
    }
  );
}

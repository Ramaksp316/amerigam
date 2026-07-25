import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 512,
  height: 512,
};
export const contentType = 'image/png';

export default async function Icon() {
  const logoData = await fetch(
    new URL('../public/logo.png', import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        }}
      >
        <img 
          src={logoData as any} 
          style={{ width: '118%', height: '118%', objectFit: 'cover' }} 
        />
      </div>
    ),
    { ...size }
  );
}

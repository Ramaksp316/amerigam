import { ImageResponse } from 'next/og';
import LogoSVG from '../components/LogoSVG';

export const runtime = 'edge';

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
          backgroundColor: '#ffffff',
          borderRadius: '112px',
        }}
      >
        <LogoSVG style={{ width: '65%', height: '65%' }} />
      </div>
    ),
    { ...size }
  );
}

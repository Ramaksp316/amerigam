import { ImageResponse } from 'next/og';
import LogoSVG from '../components/LogoSVG';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
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
        <LogoSVG style={{ width: '65%', height: '65%' }} />
      </div>
    ),
    { ...size }
  );
}

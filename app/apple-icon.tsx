import { ImageResponse } from 'next/og';

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
          backgroundColor: '#000000',
        }}
      >
        <svg 
          width="135" 
          height="135" 
          viewBox="0 0 512 512" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M256 64 Q256 256 64 256 Q256 256 256 448 Q256 256 448 256 Q256 256 256 64 Z" fill="#FFFFFF"/>
          <path d="M256 160 Q256 256 160 256 Q256 256 256 352 Q256 256 352 256 Q256 256 256 160 Z" fill="#000000"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}

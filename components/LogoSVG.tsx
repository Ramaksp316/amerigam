export default function LogoSVG({ className = "w-12 h-12", style }: { className?: string, style?: React.CSSProperties }) {
  return (
    <svg 
      className={className} 
      style={style}
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="amerigamGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8A2BE2" />
          <stop offset="50%" stopColor="#FF8C00" />
          <stop offset="100%" stopColor="#00FFFF" />
        </linearGradient>
      </defs>
      <path 
        d="M 260 80 L 370 120 L 370 260 L 320 220 L 360 410 L 270 300 L 220 300 L 120 430 L 180 280 L 210 150 Z" 
        fill="url(#amerigamGrad)" 
      />
    </svg>
  );
}

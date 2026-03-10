import { useMemo } from 'react';

interface SpeedGaugeProps {
  wpm: number;
  targetWPM?: number;
  size?: number;
  showLabel?: boolean;
}

export function SpeedGauge({ wpm, targetWPM = 100, size = 200, showLabel = true }: SpeedGaugeProps) {
  const maxWPM = 200;

  const { color, zone, bgGlow } = useMemo(() => {
    if (wpm === 0) return { color: '#9C8A78', zone: 'Ready', bgGlow: 'transparent' };
    if (wpm <= targetWPM) return { color: '#5E8A6A', zone: 'Perfect', bgGlow: 'rgba(94, 138, 106, 0.15)' };
    if (wpm <= targetWPM + 30) return { color: '#D4896A', zone: 'Slow down', bgGlow: 'rgba(212, 137, 106, 0.15)' };
    return { color: '#D05A4A', zone: 'Too fast!', bgGlow: 'rgba(208, 90, 74, 0.2)' };
  }, [wpm, targetWPM]);

  const radius = 45;
  const circumference = Math.PI * radius; // half circle
  const progress = Math.min(wpm / maxWPM, 1);
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-2" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size * 0.65 }}>
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full blur-xl transition-all duration-700"
          style={{ background: bgGlow }}
        />

        <svg
          viewBox="0 0 100 65"
          className="w-full h-full"
          role="img"
          aria-label={`${wpm} words per minute`}
        >
          <title>{wpm} WPM</title>
          {/* Target zone arc */}
          <path
            d={describeArc(50, 55, 45, 180, 180 + (targetWPM / maxWPM) * 180)}
            fill="none"
            stroke="#5E8A6A"
            strokeWidth="2"
            opacity="0.15"
            strokeLinecap="round"
          />

          {/* Track */}
          <path
            d="M 5 55 A 45 45 0 0 1 95 55"
            className="gauge-track"
            strokeOpacity="0.3"
          />

          {/* Fill */}
          <path
            d="M 5 55 A 45 45 0 0 1 95 55"
            className="gauge-fill"
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />

          {/* Needle */}
          <g transform={`rotate(${-90 + progress * 180}, 50, 55)`} className="transition-transform duration-500">
            <line
              x1="50" y1="55" x2="50" y2="18"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />
            <circle cx="50" cy="55" r="3" fill={color} />
          </g>

          {/* Labels on the arc */}
          <text x="8" y="63" fill="var(--color-text-muted, #8B7E74)" fontSize="4" opacity="0.7" fontFamily="var(--font-body)">0</text>
          <text x="85" y="63" fill="var(--color-text-muted, #8B7E74)" fontSize="4" opacity="0.7" fontFamily="var(--font-body)">{maxWPM}</text>
        </svg>

        {/* Center number */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <div
            className="font-display text-4xl leading-none transition-colors duration-300"
            style={{ color, fontFamily: 'var(--font-display)' }}
          >
            {wpm}
          </div>
          <div className="text-xs mt-0.5 tracking-wide uppercase" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
            WPM
          </div>
        </div>
      </div>

      {showLabel && (
        <div
          className="text-sm font-medium px-3 py-1 rounded-full transition-all duration-300"
          style={{
            color,
            background: bgGlow,
          }}
        >
          {zone}
        </div>
      )}
    </div>
  );
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

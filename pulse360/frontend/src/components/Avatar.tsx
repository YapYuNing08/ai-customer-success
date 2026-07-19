interface AvatarProps {
  /** Full name — the first letter is shown, and the background colour is derived from it. */
  name?: string;
  /** Sizing / border classes (e.g. "w-10 h-10 text-sm border border-earth-sage/20"). */
  className?: string;
}

/**
 * Deterministic colour from a name so each customer keeps the same "random"
 * background across renders and views instead of flickering on every re-render.
 */
const colorFromName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; // force 32-bit
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 45%)`; // mid saturation/lightness keeps white text readable
};

/** Circular initial avatar. Replaces photo avatars with the name's first letter on a coloured disc. */
export default function Avatar({ name = '', className = '' }: AvatarProps) {
  const trimmed = name.trim();
  const initial = trimmed.charAt(0).toUpperCase() || '?';
  return (
    <div
      className={`flex items-center justify-center font-bold text-white uppercase select-none shrink-0 ${className}`}
      style={{ backgroundColor: colorFromName(trimmed) }}
      role="img"
      aria-label={trimmed || 'User'}
      title={trimmed}
    >
      {initial}
    </div>
  );
}

export default function Spinner({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
    >
      <circle cx="12" cy="12" r="10" stroke="#E5E0D8" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#B8860B" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

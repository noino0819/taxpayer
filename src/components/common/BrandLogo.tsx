interface BrandLogoProps {
  size?: number
  className?: string
}

export function BrandLogo({ size = 24, className = '' }: BrandLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <path
        d="M8 9L10 15L12 10.5L14 15L16 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

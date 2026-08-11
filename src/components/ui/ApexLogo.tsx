import React from 'react';

interface ApexLogoProps {
  /** Full rendered width of the SVG. Height is auto-scaled from the 300×120 viewBox. */
  width?: number;
  className?: string;
}

/**
 * APEX brand logo — four-segment arc mark + wordmark.
 * The <text> element uses font-family="Inter" to match the site body font.
 */
export const ApexLogo: React.FC<ApexLogoProps> = ({ width = 160, className = '' }) => {
  return (
    <svg
      viewBox="0 0 300 120"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      aria-label="APEX Automotive Bracket"
      className={className}
      style={{ display: 'block' }}
    >
      {/* Four-segment arc mark — scaled down ~88% and nudged down so it aligns with wordmark */}
      <g transform="scale(0.88) translate(1, 6)">
        <path
          d="M 14.73,26.19 A 72,72 0 0 0 43.68,30.00 L 35.13,54.56 A 46,46 0 0 1 16.63,52.12 Z"
          fill="#C63A16"
        />
        <path
          d="M 45.57,30.69 A 72,72 0 0 0 70.20,46.38 L 52.07,65.02 A 46,46 0 0 1 36.33,55.00 Z"
          fill="#14110f"
        />
        <path
          d="M 71.62,47.80 A 72,72 0 0 0 87.31,72.43 L 63.00,81.67 A 46,46 0 0 1 52.98,65.93 Z"
          fill="#C63A16"
        />
        <path
          d="M 88.00,74.32 A 72,72 0 0 0 91.81,103.27 L 65.88,101.37 A 46,46 0 0 1 63.44,82.87 Z"
          fill="#14110f"
        />
      </g>

      {/* Wordmark — bumped to 72px so cap-height matches the arc mark */}
      <text
        x="100"
        y="88"
        textAnchor="start"
        fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
        fontWeight="800"
        fontSize="72"
        letterSpacing="1"
        fill="#14110f"
      >
        APEX
      </text>
    </svg>
  );
};

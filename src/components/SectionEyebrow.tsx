import React from "react";

interface SectionEyebrowProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Small uppercase lime pill shown above section headings —
 * matches the hero eyebrow and the big.utlik.co / mainplatform style.
 */
const SectionEyebrow: React.FC<SectionEyebrowProps> = ({ children, className = "" }) => (
  <div
    className={`inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm ${className}`}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-lime-sm" />
    <span className="text-[11px] md:text-xs font-semibold tracking-[0.18em] uppercase text-primary">
      {children}
    </span>
  </div>
);

export default SectionEyebrow;

// src/components/icons.tsx
// Small, consistent inline icon set (Lucide-style, 24px viewBox, 1.75 stroke,
// currentColor). Replaces unicode/emoji glyphs for a professional, crisp UI.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false"
      width="1em" height="1em" {...props}
    >
      {children}
    </svg>
  );
}

export const UploadIcon = (p: IconProps) => (
  <Base {...p}><path d="M12 16V4" /><path d="m6 10 6-6 6 6" /><path d="M4 20h16" /></Base>
);

export const SlidersIcon = (p: IconProps) => (
  <Base {...p}>
    <line x1="4" y1="8" x2="20" y2="8" /><circle cx="9" cy="8" r="2" fill="currentColor" stroke="none" />
    <line x1="4" y1="16" x2="20" y2="16" /><circle cx="15" cy="16" r="2" fill="currentColor" stroke="none" />
  </Base>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Base {...p}><path d="m9 6 6 6-6 6" /></Base>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Base {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Base>
);

export const FileTextIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
    <path d="M9 13h6" /><path d="M9 17h4" />
  </Base>
);

export const CodeIcon = (p: IconProps) => (
  <Base {...p}><path d="m8 8-4 4 4 4" /><path d="m16 8 4 4-4 4" /><path d="m13 6-2 12" /></Base>
);

export const ListIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 6h12" /><path d="M8 12h12" /><path d="M8 18h12" />
    <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
  </Base>
);

export const ShieldCheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3 5 6v5c0 4 3 6.5 7 8 4-1.5 7-4 7-8V6l-7-3Z" />
    <path d="m9.5 11.5 2 2 3.5-3.5" />
  </Base>
);

export const AlertIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M10.3 4.3 2.6 18a1.6 1.6 0 0 0 1.4 2.4h16a1.6 1.6 0 0 0 1.4-2.4L13.7 4.3a1.6 1.6 0 0 0-2.8 0Z" />
    <path d="M12 9v4" /><path d="M12 17h.01" />
  </Base>
);

export const GithubIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
  </Base>
);

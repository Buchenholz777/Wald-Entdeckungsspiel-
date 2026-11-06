import type { ReactNode } from 'react';

/** Schlichte Bedienelement-Symbole (keine Suchbilder). Immer dekorativ; Text steht daneben. */
function Icon({ children, size = 22 }: { children: ReactNode; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export const IconCheck = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <path d="M5 12.5 L10 17.5 L19 7" />
  </Icon>
);
export const IconUndo = () => (
  <Icon>
    <path d="M9 7 L4.5 11.5 L9 16" />
    <path d="M5 11.5 H14 a5 5 0 0 1 0 10 H10" transform="translate(0 -4)" />
  </Icon>
);
export const IconHelp = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.6 9.4 a2.6 2.6 0 0 1 4.9 1.2 c0 1.8 -2.5 2.2 -2.5 3.9" />
    <path d="M12 17.5 v0.1" />
  </Icon>
);
export const IconMenu = () => (
  <Icon>
    <path d="M4 7 H20 M4 12 H20 M4 17 H20" />
  </Icon>
);
export const IconClose = () => (
  <Icon>
    <path d="M6 6 L18 18 M18 6 L6 18" />
  </Icon>
);
export const IconZoom = () => (
  <Icon size={20}>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="M15 15 L20 20 M10.5 8 V13 M8 10.5 H13" />
  </Icon>
);
export const IconReplay = () => (
  <Icon size={20}>
    <path d="M4 12 a8 8 0 1 0 2.6 -5.9" />
    <path d="M4 4 V9 H9" />
  </Icon>
);
export const IconChevron = ({ open }: { open: boolean }) => (
  <Icon size={20}>
    <path d={open ? 'M6 15 L12 9 L18 15' : 'M6 9 L12 15 L18 9'} />
  </Icon>
);
export const IconArrow = () => (
  <Icon>
    <path d="M5 12 H19 M13 6 L19 12 L13 18" />
  </Icon>
);
export const IconBack = () => (
  <Icon>
    <path d="M19 12 H5 M11 6 L5 12 L11 18" />
  </Icon>
);
export const IconSkip = () => (
  <Icon>
    <path d="M6 12 H18" />
  </Icon>
);
export const IconSound = () => (
  <Icon size={20}>
    <path d="M4 9.5 H8 L13 5.5 V18.5 L8 14.5 H4 Z" />
    <path d="M16.5 9 a4.5 4.5 0 0 1 0 6" />
  </Icon>
);
export const IconHome = () => (
  <Icon>
    <path d="M4 11.5 L12 4.5 L20 11.5" />
    <path d="M6 10 V19 H10 V14 H14 V19 H18 V10" />
  </Icon>
);
export const IconInfo = () => (
  <Icon size={24}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 11 V17" />
    <path d="M12 7.4 V7.5" />
  </Icon>
);
export const IconPlus = () => (
  <Icon size={20}>
    <path d="M12 5 V19 M5 12 H19" />
  </Icon>
);

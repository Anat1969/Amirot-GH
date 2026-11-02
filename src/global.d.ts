import type { DetailedHTMLProps, HTMLAttributes } from 'react';
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'ai-menu': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & { chat?: string; research?: string; brand?: string };
    }
  }
}

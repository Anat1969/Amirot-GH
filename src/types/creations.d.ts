import 'react';
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'app-creations': { src?: string; heading?: string };
      'app-cover': { src?: string; ref?: unknown; children?: unknown };
    }
  }
}

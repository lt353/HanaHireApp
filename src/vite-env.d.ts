/// <reference types="vite/client" />

// Figma asset imports
declare module 'figma:asset/*' {
  const src: string;
  export default src;
}

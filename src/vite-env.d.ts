/// <reference types="vite/client" />

/**
 * `?inline` returns a CSS file's text instead of emitting a separate asset.
 * The embed needs this so the whole stylesheet can be injected into a shadow
 * root (a shadow root cannot follow a <link> in the host document).
 */
declare module '*.css?inline' {
  const css: string;
  export default css;
}

// FinoTicket L11 — embed entry point
//
// This is the file the tenant's <script src=".../fino-console.js"> executes.
// All it does is boot the element; everything else lives in ./boot and
// ./FinoConsoleElement so it stays unit-testable without a bundler.

import { bootFinoConsole } from './boot';

bootFinoConsole();

export { FinoConsoleElement, defineFinoConsole } from './FinoConsoleElement';
export { bootFinoConsole, injectAppStyles } from './boot';
export * from './protocol';
export { mountEmbedRoot } from './embedRoot';

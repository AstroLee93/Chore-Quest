/** Which ChoreQuest build is running (set at build time in vite.config.ts). */
declare const __CQ_BUILD__: { version: string; commit: string; builtAt: string };

export const BUILD = typeof __CQ_BUILD__ !== 'undefined' ? __CQ_BUILD__ : { version: 'dev', commit: 'unknown', builtAt: '' };
export const VERSION_LABEL = `v${BUILD.version}${BUILD.commit !== 'unknown' ? ` · ${BUILD.commit}` : ''}`;
export const builtOn = () => (BUILD.builtAt ? new Date(BUILD.builtAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '');

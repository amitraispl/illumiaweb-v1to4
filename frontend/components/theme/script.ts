/*
 * Light / dark for every version. The theme lives on <html data-vN-theme>, put
 * there before paint by the layout's script so nothing flashes. Light is the
 * default; a visitor's choice is remembered per version.
 * Kept free of "use client" so server layouts can build the script.
 */
export type Theme = "light" | "dark";
/** The browser chrome (theme-color) for each theme. */
export type Chrome = { light: string; dark: string };

/** Fired on window after every switch, for canvases that draw the theme themselves. */
export const THEME_EVENT = "illumia:theme";

export const themeAttr = (key: string) => `data-${key}-theme`;

/** Inline, pre-paint: read the saved theme (light unless "dark" was chosen) and colour the browser chrome. */
export function themeScript(key: string, chrome: Chrome) {
  return (
    `try{var t=localStorage.getItem('${key}-theme')==='dark'?'dark':'light';` +
    `document.documentElement.setAttribute('${themeAttr(key)}',t);` +
    `var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?'${chrome.dark}':'${chrome.light}')}catch(e){}`
  );
}

/** Each version's browser chrome, shared by its layout script and its switch. */
export const chromes: Record<string, Chrome> = {
  v1: { light: "#f4f5f7", dark: "#1f1f25" },
  v2: { light: "#f4f5f7", dark: "#16161b" },
  v3: { light: "#f4f5f7", dark: "#1f1f25" },
  v4: { light: "#f4f5f7", dark: "#17171c" },
  v5: { light: "#f4f5f7", dark: "#131318" },
  v6: { light: "#f4f5f7", dark: "#1b1b21" },
};

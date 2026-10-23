"use client";

/*
 * Page-enter handshake between a version's Shell and its pages.
 *
 * The Shell calls signalEnter(ns) once the transition has uncovered the page.
 * Pages call onPageEnter(ns, play). Because Next hydrates a page segment
 * separately from its layout, the signal can arrive before the page listens,
 * so the signal is also recorded against the current path and checked on subscribe.
 */

type EnterWindow = Window & { __ilEntered?: Record<string, string> };

export function signalEnter(ns: string) {
  const w = window as EnterWindow;
  w.__ilEntered = { ...(w.__ilEntered ?? {}), [ns]: location.pathname };
  window.dispatchEvent(new CustomEvent(`${ns}:enter`));
}

/** Forget the signal while a transition covers the page, so the next page waits for its own. */
export function clearEnter(ns: string) {
  const w = window as EnterWindow;
  if (w.__ilEntered) delete w.__ilEntered[ns];
}

/**
 * Run `play` once the page is uncovered. A fallback timer guarantees content
 * never stays hidden if the signal is missed.
 */
export function onPageEnter(ns: string, play: () => void, fallbackMs = 2600): () => void {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    play();
  };
  if ((window as EnterWindow).__ilEntered?.[ns] === location.pathname) {
    const id = requestAnimationFrame(run);
    return () => cancelAnimationFrame(id);
  }
  const evt = `${ns}:enter`;
  window.addEventListener(evt, run, { once: true });
  const t = window.setTimeout(run, fallbackMs);
  return () => {
    window.removeEventListener(evt, run);
    window.clearTimeout(t);
  };
}

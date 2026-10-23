"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { ScrollTrigger, reducedMotion } from "@/lib/gsap";
import { useLenis } from "./SmoothScroll";

/**
 * Page transitions for the App Router.
 * `cover` hides the current page (resolve when fully covered),
 * `reveal` uncovers the new one. Each version supplies its own pair.
 */
export type TransitionHooks = {
  cover: (href: string, label: string) => Promise<void>;
  reveal: (first: boolean) => Promise<void>;
};

type Ctx = { navigate: (href: string, label?: string) => void };
const TransitionContext = createContext<Ctx>({ navigate: () => {} });

export function TransitionProvider({ hooks, children }: { hooks: TransitionHooks; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const busy = useRef(false);
  const lastPath = useRef<string | null>(null);
  const hooksRef = useRef(hooks);
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);
  useEffect(() => {
    hooksRef.current = hooks;
  }, [hooks]);

  const navigate = useCallback(
    async (href: string, label = "") => {
      if (busy.current) return;
      const target = href.split("#")[0];
      if (target === pathname) {
        if (lenis) lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (reducedMotion()) {
        router.push(href);
        return;
      }
      busy.current = true;
      router.prefetch(href);
      await hooksRef.current.cover(href, label);
      router.push(href);
    },
    [pathname, router, lenis],
  );

  // runs on first load and after every route change
  useEffect(() => {
    // first load, or React strict mode re-running the same mount in dev
    const isFirst = lastPath.current === null || lastPath.current === pathname;
    lastPath.current = pathname;
    if (!isFirst) {
      lenisRef.current?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
    }
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const done = reducedMotion() ? Promise.resolve() : hooksRef.current.reveal(isFirst);
      done.finally(() => (busy.current = false));
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return <TransitionContext.Provider value={{ navigate }}>{children}</TransitionContext.Provider>;
}

export const useTransition = () => useContext(TransitionContext);

type TLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & { label?: string; children: ReactNode };

/** A next/link that plays the version's page transition before navigating. */
export function TLink({ href, label, onClick, children, ...rest }: TLinkProps) {
  const { navigate } = useTransition();
  const url = typeof href === "string" ? href : href.pathname ?? "/";
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(url, label ?? (typeof children === "string" ? children : ""));
  };
  return (
    <Link href={href} onClick={handle} {...rest}>
      {children}
    </Link>
  );
}

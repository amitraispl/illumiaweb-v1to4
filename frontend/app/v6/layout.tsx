import type { Metadata } from "next";
import { Syne, Carlito, Space_Mono } from "next/font/google";
import { chromes, themeScript } from "@/components/theme/script";
import { Shell } from "./Shell";
import "./v6.css";

const display = Syne({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--f-display" });
const body = Carlito({ subsets: ["latin"], weight: ["400", "700"], variable: "--f-body" });
const code = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--f-code" });

export const metadata: Metadata = {
  title: { default: "Flux", template: "%s · Flux · Illumia Software" },
};

export default function V6Layout({ children }: LayoutProps<"/v6">) {
  return (
    <div className={`v6 ${display.variable} ${body.variable} ${code.variable}`}>
      {/* before paint: put the saved theme (light by default) on <html>, and on a first visit hold the page back so the ink drop lands on an empty stage */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            themeScript("v6", chromes.v6) +
            "try{if(!sessionStorage.getItem('v6-loaded')&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!navigator.webdriver)document.documentElement.setAttribute('data-v6-boot','')}catch(e){}",
        }}
      />
      <Shell>{children}</Shell>
    </div>
  );
}

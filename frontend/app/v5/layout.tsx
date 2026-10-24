import type { Metadata } from "next";
import { Unbounded, Carlito, Geist_Mono } from "next/font/google";
import { chromes, themeScript } from "@/components/theme/script";
import { Shell } from "./Shell";
import "./v5.css";

const display = Unbounded({ subsets: ["latin"], variable: "--f-display" });
const body = Carlito({ subsets: ["latin"], weight: ["400", "700"], variable: "--f-body" });
const code = Geist_Mono({ subsets: ["latin"], variable: "--f-code" });

export const metadata: Metadata = {
  title: { default: "Lumen · Illumia Software Development", template: "%s · Lumen · Illumia Software Development" },
  description:
    "Design & development, custom mobile apps, custom web applications and third-party integrations, built by one accountable team at Illumia Solutions.",
};

export default function V5Layout({ children }: LayoutProps<"/v5">) {
  return (
    <div className={`v5 ${display.variable} ${body.variable} ${code.variable}`}>
      {/* before paint: put the saved theme (light by default) on <html>, and on a first visit hold the page back so the boot sequence plays on an empty stage */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            themeScript("v5", chromes.v5) +
            "try{if(!sessionStorage.getItem('v5-loaded')&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!navigator.webdriver)document.documentElement.setAttribute('data-v5-boot','')}catch(e){}",
        }}
      />
      <Shell>{children}</Shell>
    </div>
  );
}

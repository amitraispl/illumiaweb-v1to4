import type { Metadata } from "next";
import { Bricolage_Grotesque, Carlito, JetBrains_Mono } from "next/font/google";
import { chromes, themeScript } from "@/components/theme/script";
import { Shell } from "./Shell";
import "./v1.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--f-display", axes: ["opsz", "wdth"] });
const body = Carlito({ subsets: ["latin"], weight: ["400", "700"], variable: "--f-body" });
const code = JetBrains_Mono({ subsets: ["latin"], variable: "--f-code" });

export const metadata: Metadata = {
  title: { default: "Beacon · Illumia Software", template: "%s · Beacon · Illumia Software" },
};

export default function V1Layout({ children }: LayoutProps<"/v1">) {
  return (
    <div className={`v1 ${display.variable} ${body.variable} ${code.variable}`}>
      {/* before paint: put the saved theme (light by default) on <html>, and skip the first-visit loader when it has already played this session */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            themeScript("v1", chromes.v1) +
            "try{sessionStorage.getItem('v1-loaded')&&document.documentElement.setAttribute('data-v1-seen','')}catch(e){}",
        }}
      />
      <Shell>{children}</Shell>
    </div>
  );
}

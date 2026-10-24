import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { chromes, themeScript } from "@/components/theme/script";
import { Shell } from "./Shell";
import "./v3.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--f-archivo", axes: ["wdth"] });

export const metadata: Metadata = {
  title: { default: "Kinetic · Illumia Software", template: "%s · Kinetic · Illumia Software" },
};

export default function V3Layout({ children }: LayoutProps<"/v3">) {
  return (
    <div className={`v3 ${archivo.variable}`}>
      {/* before paint: put the saved theme (light by default) on <html>, and skip the intro when it has already played this session */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            themeScript("v3", chromes.v3) +
            "try{sessionStorage.getItem('v3-loaded')&&document.documentElement.setAttribute('data-v3-seen','')}catch(e){}",
        }}
      />
      <Shell>{children}</Shell>
    </div>
  );
}

import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { Shell } from "./Shell";
import "./v3.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--f-archivo", axes: ["wdth"] });

export const metadata: Metadata = {
  title: { default: "Kinetic · Illumia Software", template: "%s · Kinetic · Illumia Software" },
};

export default function V3Layout({ children }: LayoutProps<"/v3">) {
  return (
    <div className={`v3 ${archivo.variable}`}>
      <script
        dangerouslySetInnerHTML={{
          __html: "try{sessionStorage.getItem('v3-loaded')&&document.documentElement.setAttribute('data-v3-seen','')}catch(e){}",
        }}
      />
      <Shell>{children}</Shell>
    </div>
  );
}

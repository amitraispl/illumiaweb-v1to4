import type { Metadata } from "next";
import { Instrument_Serif, Instrument_Sans } from "next/font/google";
import { chromes, themeScript } from "@/components/theme/script";
import { Shell } from "./Shell";
import "./v2.css";

const display = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--f-display" });
const text = Instrument_Sans({ subsets: ["latin"], variable: "--f-text", axes: ["wdth"] });

export const metadata: Metadata = {
  title: { default: "Editorial · Illumia Software", template: "%s · Editorial · Illumia Software" },
};

export default function V2Layout({ children }: LayoutProps<"/v2">) {
  return (
    <div className={`v2 ${display.variable} ${text.variable}`}>
      {/* before paint: put the saved theme (light by default) on <html> */}
      <script dangerouslySetInnerHTML={{ __html: themeScript("v2", chromes.v2) }} />
      <Shell>{children}</Shell>
    </div>
  );
}

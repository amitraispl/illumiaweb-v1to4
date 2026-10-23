import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Shell } from "./Shell";
import "./v4.css";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--f-display" });
const text = Manrope({ subsets: ["latin"], variable: "--f-text" });

export const metadata: Metadata = {
  title: { default: "Blueprint · Illumia Software", template: "%s · Blueprint · Illumia Software" },
};

export default function V4Layout({ children }: LayoutProps<"/v4">) {
  return (
    <div className={`v4 ${display.variable} ${text.variable}`}>
      <Shell>{children}</Shell>
    </div>
  );
}

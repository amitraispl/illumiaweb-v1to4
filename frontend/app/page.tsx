import Link from "next/link";
import { Bricolage_Grotesque, Instrument_Serif, Archivo, Cormorant_Garamond, Carlito } from "next/font/google";
import s from "./picker.module.css";

const f1 = Bricolage_Grotesque({ subsets: ["latin"], weight: "600" });
const f2 = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const f3 = Archivo({ subsets: ["latin"], axes: ["wdth"] });
const f4 = Cormorant_Garamond({ subsets: ["latin"], weight: "500", style: ["italic"] });
const ui = Carlito({ subsets: ["latin"], weight: ["400", "700"] });

const versions = [
  {
    href: "/v1",
    name: "Beacon",
    font: f1.className,
    line: "Dark and cinematic. The cursor is a light that reveals code hidden in the dark.",
    traits: ["WebGL beacon hero", "Cursor spotlight", "Decode headlines", "Pinned horizontal services", "Dark to light flip", "Diamond page transition"],
    type: "Bricolage Grotesque · Carlito",
    tone: s.beacon,
  },
  {
    href: "/v2",
    name: "Editorial",
    font: f2.className,
    line: "A printed issue on paper. Huge serif type, a magazine grid and shutter transitions.",
    traits: ["Masthead letter rise", "Window opens to full screen", "Ink-fill statement", "Cursor-follow previews", "Stacking sheets", "Shutter page transition"],
    type: "Instrument Serif · Instrument Sans",
    tone: s.editorial,
  },
  {
    href: "/v3",
    name: "Kinetic",
    font: f3.className,
    line: "Loud and playful. Whole fields of colour and type that stretches as you move.",
    traits: ["Variable-width type", "Pointer-reactive letters", "Pinned colour chapters", "Stacking cards", "Drag rail", "Skewed sweep transition"],
    type: "Archivo variable (width 62–125)",
    tone: s.kinetic,
  },
  {
    href: "/v4",
    name: "Blueprint",
    font: f4.className,
    line: "Calm and architectural. Software drawn as a building, revealed slowly.",
    traits: ["Self-drawing isometric", "Floors light on scroll", "Timezone overlap tool", "Horizontal gallery", "Scroll progress %", "Curtain transition"],
    type: "Cormorant Garamond · Manrope",
    tone: s.blueprint,
  },
];

export default function Picker() {
  return (
    <main className={`${s.page} ${ui.className}`}>
      <header className={s.head}>
        <img src="/brand/illumia-logo-light.svg" alt="Illumia Solutions" width={150} height={40} />
        <h1>Software Development, four directions</h1>
        <p>
          The same content and brand colours, built four ways. Open each one and click through its four pages:
          home, services, work and contact.
        </p>
      </header>
      <ul className={s.grid} role="list">
        {versions.map((v) => (
          <li key={v.href} className={`${s.card} ${v.tone}`}>
            <Link href={v.href} className={s.link}>
              <span className={`${s.name} ${v.font}`}>{v.name}</span>
              <span className={s.line}>{v.line}</span>
              <ul className={s.traits} role="list">
                {v.traits.map((t) => <li key={t}>{t}</li>)}
              </ul>
              <span className={s.type}>{v.type}</span>
              <span className={s.go}>Open {v.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

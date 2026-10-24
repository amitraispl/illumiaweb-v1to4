/**
 * The site copy every version shows. V5 (Lumen) is the source of truth: its
 * content file holds the data, and the page text below mirrors what V5 writes
 * inline in its pages. Change copy in V5 and here, never per version.
 */

export {
  company,
  intro,
  services,
  process,
  agile,
  ownership,
  promises,
  stats,
  stack,
  buildLog,
  serviceBySlug,
} from "@/app/v5/content";
export type { Service, Group, Capability, Step } from "@/app/v5/content";

/* Page text, as V5 sets it. */
export const pages = {
  hero: { primary: "Consult an expert", secondary: "Explore services" },
  philosophyBy: "Illumia Software Development Philosophy",
  servicesHead: { eyebrow: "Core Service Architecture", title: "Four disciplines, one accountable team" },
  servicesPage: {
    title: "Services",
    lede: "Four disciplines, one accountable team. From the first wireframe to a system that talks to the rest of your stack.",
    promisesTitle: "Every engagement, every service",
  },
  processHead: { eyebrow: "How we work", title: "A cycle, not a straight line" },
  processPage: {
    title: "A cycle, not a straight line.",
    lede:
      "Discovery doesn’t end when design starts, and testing doesn’t wait for the end. Every stage stays open to what the next one learns, and your team reviews and weighs in throughout, not just at kickoff and handoff.",
    loop: "Iterate feeds straight back into Discover",
  },
  ownershipHead: { eyebrow: "Full Transparency", title: "Own everything you pay for" },
  agileHead: { eyebrow: "Agile Delivery" },
  officesHead: {
    eyebrow: "Offices",
    title: "Engineered in Kolkata. Supported across six time zones.",
    body: "Sprint reviews land in your working day, and post-launch support follows the sun.",
  },
  contact: {
    eyebrow: "Contact · consult an expert",
    title: "Start a project",
    lede: "Tell us what you are building. An engineer, not a salesperson, replies within one working day.",
    servicesQuestion: "Which services do you need? Pick any.",
    budgets: ["Under $25k", "$25k–75k", "$75k–200k", "$200k+", "Not sure yet"],
    briefPlaceholder: "What should it do, and for whom?",
    reachTitle: "Six offices, one team",
    thanks: "Thank you. Your brief is in.",
  },
  footer: {
    ask: "Ready to get started?",
    cta: "Consult an expert",
    about: "The software development wing of Illumia Solutions: design, mobile, web and integrations, by one accountable team.",
    legal: "© 2026 Illumia Solutions Pvt. Ltd. · Software Development",
  },
};

/** Each version's nav: V5's four destinations. */
export const navFor = (v: string) => [
  { href: `/${v}`, label: "Home" },
  { href: `/${v}/services`, label: "Services" },
  { href: `/${v}/process`, label: "Process" },
  { href: `/${v}/contact`, label: "Contact" },
];

/** The service a contact link asked for, e.g. /v1/contact?service=web. Read in the browser only. */
export const askedService = (): string | null => {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("service");
};

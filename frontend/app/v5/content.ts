/**
 * Lumen's own copy. Taken from illumiasolutions.com/software-development and its four
 * service pages (Oct 2026), lightly trimmed to fit the layouts. Company facts come from
 * the shared content file so every version agrees on them.
 */

import { company as base } from "@/lib/content";
import type { Shape } from "./field";

export type Capability = { title: string; body: string };
export type Group = { name: string; items: [Capability, Capability] };

export type Service = {
  slug: string;
  /** one-word tag used on the overview page */
  tag: string;
  name: string;
  /** the line after the dash in the page heading */
  promise: string;
  short: string;
  lede: string;
  highlights: [string, string, string];
  groups: Group[];
  closing: string;
  cta: string;
  stack: string[];
};

export const company = {
  ...base,
  email: "sales@illumiasolutions.com",
  site: "https://illumiasolutions.com",
};

export const intro = {
  eyebrow: "Bespoke Engineering",
  title: ["Software development", "engineered,", "not assembled."],
  lede:
    "From pixel-perfect design to production-grade mobile and web applications, our engineering team builds custom software precisely matched to your business logic, and connects it seamlessly to the tools you already run.",
  about:
    "We don’t start from a template. Every engagement begins with your actual workflows, data, and users, then moves through design, engineering, and integration by the same accountable team.",
  philosophy: "Software that fits your business exactly, not the other way around.",
};

export const services: Service[] = [
  {
    slug: "design",
    tag: "Design",
    name: "Design & Development",
    promise: "From Concept to Code.",
    short:
      "End-to-end UI/UX design and engineering: wireframes, prototypes and design systems carried through to production-ready code by one accountable team.",
    lede:
      "We take products from a blank page to production. User research, interaction design and full-stack engineering are handled by one team, in the same sprints, so nothing gets lost in translation between design and build.",
    highlights: ["UX Research & Wireframing", "Interactive Prototyping & Design Systems", "Full-Stack Implementation"],
    groups: [
      {
        name: "User-Centered Design",
        items: [
          { title: "UX Research & Discovery", body: "Interviews, journey mapping and competitive analysis that don’t stop at kickoff. We go back to users mid-sprint whenever a build reveals something the original research didn’t." },
          { title: "Wireframing & Information Architecture", body: "Wireframes and site maps validated early, then revisited whenever engineering surfaces a constraint the flow didn’t account for. Nothing is locked once the build starts." },
        ],
      },
      {
        name: "Interactive Prototyping",
        items: [
          { title: "Clickable Prototypes", body: "Reviewed sprint by sprint alongside early engineering, not gated behind a separate design phase. Each round of feedback loops straight back into the next iteration." },
          { title: "Rapid Iteration", body: "Design and engineering trade findings sprint over sprint: a build constraint sends us back to the wireframe, real user feedback sends us back to the prototype." },
        ],
      },
      {
        name: "Design Systems",
        items: [
          { title: "Component Libraries & UI Kits", body: "Built alongside the first features that need them, then extended sprint by sprint, not designed upfront in isolation from the code that uses them." },
          { title: "Brand-Aligned Visual Language", body: "Typography, colour and spacing systems refined as real screens get built, not signed off before a line of code exists." },
        ],
      },
      {
        name: "Full-Stack Implementation",
        items: [
          { title: "Production-Ready Engineering", body: "No handoff, no waiting room. The same team designing the interface is building it in the same sprint, catching mismatches immediately instead of weeks later." },
          { title: "Modern Frameworks", body: "React/Next.js, Node and other modern, maintainable stacks, chosen early and revisited as the design work clarifies what your product actually needs." },
        ],
      },
      {
        name: "Iterative Workflow",
        items: [
          { title: "Agile Sprint Cycles", body: "Work broken into short, fixed sprints, each one ending in a reviewable build, not a black box you wait weeks to see." },
          { title: "Continuous Feedback Loops", body: "Every stage stays open to what the next one learns. Testing, review and real usage loop straight back into design and development, sprint after sprint." },
        ],
      },
      {
        name: "Ongoing Partnership",
        items: [
          { title: "Design & Dev Retainers", body: "The same sprint cadence continues post-launch, with design and engineering still looping on real usage data, not handed off to a different team." },
          { title: "No Vendor Lock-in", body: "Full ownership of source files and code. Modify, extend or bring it in-house at any time." },
        ],
      },
    ],
    closing:
      "Our design and development teams work as one, so your product’s look, feel and function are never compromises made in isolation.",
    cta: "Start your design sprint",
    stack: ["Figma", "React", "Next.js", "Node.js", "TypeScript", "Storybook"],
  },
  {
    slug: "mobile",
    tag: "Mobile",
    name: "Custom Mobile Applications",
    promise: "Native Performance, Any Platform.",
    short: "Native iOS/Android and cross-platform apps engineered for performance, offline resilience, and App Store-ready polish.",
    lede:
      "Native iOS and Android apps, or a single cross-platform codebase, built in short sprints with a staging build you can test every cycle. Engineered for performance, offline resilience, and a polish that feels at home on the platform it runs on.",
    highlights: ["Native iOS & Android Development", "Offline-First Architecture", "Push, Deep Linking & Device APIs"],
    groups: [
      {
        name: "Native & Cross-Platform",
        items: [
          { title: "iOS & Android Native", body: "Swift and Kotlin development for apps that demand maximum platform performance and deep OS integration." },
          { title: "Cross-Platform Delivery", body: "React Native and Flutter builds that ship to both app stores from a single, maintainable codebase." },
        ],
      },
      {
        name: "Offline-First Architecture",
        items: [
          { title: "Local Data Sync", body: "Robust offline storage and background sync, so your app stays usable with unreliable connectivity." },
          { title: "Conflict Resolution", body: "Reliable merge strategies for data captured offline and synced later." },
        ],
      },
      {
        name: "Platform Integration",
        items: [
          { title: "Push Notifications & Deep Linking", body: "Native notification pipelines and deep linking for re-engagement and seamless navigation." },
          { title: "Device Hardware Access", body: "Camera, GPS, biometrics and sensor integrations built to platform-specific best practices." },
        ],
      },
      {
        name: "App Store Readiness",
        items: [
          { title: "Submission & Compliance", body: "Full App Store and Play Store submission handling, including compliance and review-readiness." },
          { title: "Performance Profiling", body: "Startup time, memory and battery profiling, so your app meets store-quality bars, not just feature checklists." },
        ],
      },
      {
        name: "Secure by Design",
        items: [
          { title: "Encrypted Local Storage", body: "Sensitive data encrypted at rest on-device, with secure token handling for authenticated sessions." },
          { title: "API Hardening", body: "Certificate pinning and hardened API communication between app and backend." },
        ],
      },
      {
        name: "Post-Launch Support",
        items: [
          { title: "Monitoring & Crash Reporting", body: "Real-time crash reporting and analytics wired in from day one." },
          { title: "Version & Release Management", body: "Managed release cadences, phased rollouts and rapid hotfix turnaround." },
        ],
      },
    ],
    closing:
      "Whether it’s a customer-facing app or an internal field tool, we build mobile software that performs, and that your team can maintain long after launch.",
    cta: "Scope your mobile app",
    stack: ["Swift", "Kotlin", "React Native", "Flutter", "SQLite", "Firebase"],
  },
  {
    slug: "web",
    tag: "Web",
    name: "Custom Web Applications",
    promise: "Built to Scale With You.",
    short: "Scalable, secure web applications on modern frameworks, from internal operations tools to customer-facing platforms.",
    lede:
      "From internal operations tools to customer-facing platforms, we build web applications in iterative sprints on modern, maintainable stacks, engineered for the load, security and workflows your business actually has.",
    highlights: ["React / Next.js Front-Ends", "API & Database Architecture", "CI/CD & Containerised Delivery"],
    groups: [
      {
        name: "Modern Front-End Engineering",
        items: [
          { title: "React / Next.js Development", body: "Fast, SEO-friendly interfaces built on modern component frameworks, with server-side rendering where it matters." },
          { title: "Responsive by Default", body: "Every screen built mobile-first and tested across breakpoints, not patched afterward." },
        ],
      },
      {
        name: "Robust Back-End Systems",
        items: [
          { title: "API & Service Architecture", body: "RESTful and GraphQL APIs designed around your actual data model and access patterns." },
          { title: "Database Design", body: "Schema design and query optimisation for both relational and document-based data stores." },
        ],
      },
      {
        name: "Authentication & Access Control",
        items: [
          { title: "SSO & Role-Based Access", body: "SAML/OAuth single sign-on and granular role-based permissions for internal and customer-facing apps alike." },
          { title: "Multi-Tenant Architecture", body: "Secure tenant isolation for SaaS products serving multiple customer organisations." },
        ],
      },
      {
        name: "Performance & Scalability",
        items: [
          { title: "Caching & Load Optimisation", body: "Application and edge caching strategies that keep response times low as traffic grows." },
          { title: "Horizontal Scaling", body: "Stateless service design, ready to scale out on your infrastructure of choice." },
        ],
      },
      {
        name: "DevOps & Deployment",
        items: [
          { title: "CI/CD Pipelines", body: "Automated build, test and deployment pipelines from day one. No manual release nights." },
          { title: "Containerised Delivery", body: "Docker and Kubernetes-ready packaging for consistent environments across dev, staging and production." },
        ],
      },
      {
        name: "Maintenance & Evolution",
        items: [
          { title: "Ongoing Feature Development", body: "Continued engineering support as requirements evolve, not a one-and-done handoff." },
          { title: "Full Source Ownership", body: "Clean, documented codebases with no proprietary lock-in." },
        ],
      },
    ],
    closing:
      "We build web applications the way we’d want to inherit them: clean architecture, sane defaults, and documentation that actually helps.",
    cta: "Scope your web app",
    stack: ["React", "Next.js", "GraphQL", "PostgreSQL", "Docker", "Kubernetes"],
  },
  {
    slug: "integrations",
    tag: "Integrations",
    name: "Third-Party Integrations",
    promise: "Connect Everything You Run.",
    short: "Seamless API integrations connecting your software to CRMs, payment gateways, ERPs, and the wider tools your business depends on.",
    lede:
      "Your software doesn’t operate in isolation. Sprint by sprint, we build reliable, secure integrations connecting your applications to the CRMs, payment gateways, ERPs and platforms your business already depends on.",
    highlights: ["CRM, ERP & Payment Gateway Sync", "Custom API Design & Management", "Event-Driven Data Pipelines"],
    groups: [
      {
        name: "Business System Integrations",
        items: [
          { title: "CRM & ERP Connectivity", body: "Two-way sync with Salesforce, HubSpot, ERPNext, Odoo and the other systems your teams already rely on." },
          { title: "Payment Gateway Integration", body: "Stripe, PayPal, Razorpay and other payment processors, integrated with proper reconciliation and error handling." },
        ],
      },
      {
        name: "API Development & Management",
        items: [
          { title: "Custom API Design", body: "Well-documented, versioned APIs built for the partners and internal teams that will consume them." },
          { title: "Third-Party API Consumption", body: "Robust client integrations against external APIs, with retry logic and graceful degradation built in." },
        ],
      },
      {
        name: "Data Synchronisation",
        items: [
          { title: "Real-Time & Batch Sync", body: "Webhook-driven real-time updates or scheduled batch sync, chosen to match the data’s actual freshness requirements." },
          { title: "Data Transformation & Mapping", body: "ETL pipelines that reconcile mismatched schemas between systems without losing data integrity." },
        ],
      },
      {
        name: "Authentication & Security",
        items: [
          { title: "OAuth & API Key Management", body: "Secure credential storage and token refresh flows for every connected service." },
          { title: "Audit Logging", body: "Full traceability of what data moved where, and when. Critical for compliance-sensitive integrations." },
        ],
      },
      {
        name: "Middleware & Orchestration",
        items: [
          { title: "Integration Platforms", body: "Custom middleware, or platforms like n8n and Zapier-class tooling, selected on complexity and volume." },
          { title: "Event-Driven Architecture", body: "Message queues and event buses for integrations that need to scale beyond simple point-to-point calls." },
        ],
      },
      {
        name: "Monitoring & Reliability",
        items: [
          { title: "Failure Alerting", body: "Proactive alerting when an integration fails or data drifts out of sync, not a silent failure discovered weeks later." },
          { title: "Ongoing Maintenance", body: "Third-party APIs change. We keep your integrations working as they do." },
        ],
      },
    ],
    closing:
      "Good integrations are invisible: data flows where it needs to, on time, without anyone thinking about it. That’s the standard we build to.",
    cta: "Discuss your integration",
    stack: ["Salesforce", "HubSpot", "ERPNext", "Stripe", "Razorpay", "n8n"],
  },
];

export type Step = { name: string; body: string };

/** The seven-stage cycle. Iterate feeds straight back into Discover. */
export const process: Step[] = [
  { name: "Discover", body: "Stakeholder interviews, technical audits and scope framing, revisited every sprint as real usage and new context reshape what we thought we knew." },
  { name: "Design", body: "Wireframes and UX flows shaped with your team, sent back for another pass whenever testing or review surfaces something the first draft missed." },
  { name: "Prototype", body: "Clickable prototypes validated with real users before production code is committed, and again any time a later stage reveals a gap." },
  { name: "Develop", body: "Iterative builds in short sprints, each one shippable to staging, so scope can adapt before it hardens into something harder to change." },
  { name: "Test", body: "QA folded into every sprint, not saved for the end. Issues route straight back into design or development while they’re still cheap to fix." },
  { name: "Review", body: "Stakeholder walkthroughs each sprint surface what’s working and what isn’t, feeding directly into the next round of design and build." },
  { name: "Iterate", body: "Insights from testing, review and stakeholder feedback loop back into earlier phases. The cycle repeats until the product is right, not just shipped." },
];

export const agile = {
  title: "Those seven stages repeat. They don’t run once.",
  body:
    "We work in short sprints, so any stage can send us back to an earlier one. You see working software early and often, and scope adapts as testing, reviews and stakeholder feedback teach us something the initial spec couldn’t.",
  points: [
    { name: "Short Sprints", body: "Work broken into fixed, short cycles, usually two weeks, each ending in something you can actually review." },
    { name: "Ship Early, Ship Often", body: "Staging environments updated every sprint, not unveiled at the end. You see the product take shape as it’s built." },
    { name: "Backlog, Not a Blueprint", body: "Priorities re-ordered as we learn, from user feedback, real data or a shift in your business, without renegotiating the whole project." },
    { name: "Continuous Feedback", body: "Regular reviews with your team keep design, engineering and integration work aligned to what’s actually needed, sprint over sprint." },
  ],
};

/** What the client walks away with. Each one carries a small file-system snippet as its picture. */
export const ownership = [
  {
    name: "Full Source Code Ownership",
    body: "Every repository transferred to your GitHub org on delivery. No proprietary lock-in, ever.",
    snippet: ["$ git push --mirror \\", "    git@github.com:your-org/app.git", "→ 1,284 commits · 38 branches", "✓ transferred · owner: your-org"],
  },
  {
    name: "Technical Documentation",
    body: "Architecture diagrams, API references and setup guides, written for the team that inherits the code.",
    snippet: ["docs/", "├─ architecture.md", "├─ api-reference.md", "├─ runbooks/", "└─ setup.md"],
  },
  {
    name: "Design Files & Assets",
    body: "Figma files, component libraries and brand assets, yours to reuse and extend.",
    snippet: ["design/", "├─ product.fig", "├─ components/  142", "├─ tokens.json", "└─ brand-assets/"],
  },
  {
    name: "Post-Launch Support Window",
    body: "A defined support period after go-live, to catch what only real usage surfaces.",
    snippet: ["go-live ●━━━━━━━━━━━━━━━━━━○", "        └ support window ┘", "crash reports ...... wired", "hotfix lane ........ open"],
  },
];

/** The three promises closing every service page on the main site. */
export const promises = [
  { name: "No lock-in", body: "Every repository, design file and credential is yours. Modify, extend or bring the work in-house at any time." },
  { name: "Dedicated team", body: "The same designers and engineers from the first wireframe to post-launch, sprint over sprint. No handoffs to strangers." },
  { name: "Fast onboarding", body: "A discovery conversation, a scoped first sprint, and a staging build you can click through at the end of it." },
];

export const stats = [
  { value: 4, suffix: "", label: "disciplines, one accountable team" },
  { value: 7, suffix: "", label: "stages that repeat every sprint" },
  { value: 2, suffix: "wk", label: "sprints, each ending in a reviewable build" },
  { value: 100, suffix: "%", label: "of the source code is yours on delivery" },
];

export const stack = [
  "React", "Next.js", "TypeScript", "Node.js", "Swift", "Kotlin", "React Native", "Flutter",
  "GraphQL", "REST", "PostgreSQL", "Docker", "Kubernetes", "Figma", "Stripe", "Razorpay",
  "Salesforce", "HubSpot", "ERPNext", "Odoo", "n8n", "OAuth",
];

export const buildLog = [
  "$ illumia build --target staging --sprint 07",
  "→ design tokens synced from Figma",
  "→ resolving 1,284 packages",
  "→ running 3,912 tests ........ passed",
  "→ contract tests: stripe, hubspot, erpnext ... ok",
  "→ container signed  sha256:9f2c…e41a",
  "✓ staging updated · review link sent to your team",
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);

/** the shape each service rebuilds the light into */
export const LOOK: Record<string, Shape> = { design: "wireframe", mobile: "phone", web: "stack", integrations: "network" };

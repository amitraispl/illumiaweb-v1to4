/**
 * Shared content for every design version.
 *
 * Facts marked REAL come from illumiasolutions.com (Oct 2026).
 * Anything marked SAMPLE is placeholder copy that must be confirmed or
 * replaced by Illumia before launch — never present it as real client proof.
 */

export type Service = {
  slug: string;
  name: string;
  short: string;
  body: string;
  deliverables: string[];
  stack: string[];
};

export type Project = {
  slug: string;
  name: string;
  sector: string;
  year: string;
  summary: string;
  outcome: string;
  stack: string[];
  /** which interface fragment draws this project's cover */
  cover: "erp" | "network" | "intake" | "assistant" | "migrate" | "field";
};

export type Step = { name: string; body: string; weeks: string };

/* REAL: company facts */
export const company = {
  name: "Illumia Solutions",
  wing: "Software Development",
  tagline: "Illuminating the path to SUCCESS",
  phone: "+91 93320 45178",
  phoneHref: "tel:+919332045178",
  address: ["2nd Floor, FL-C, 98/9 Gopal Lal Tagore Road", "Baranagar, Kolkata 700036", "India"],
  linkedin: "https://www.linkedin.com/company/illumia-solutions/",
  contactUrl: "https://illumiasolutions.com/contact/",
  offices: [
    { country: "India", city: "Kolkata", tz: "Asia/Kolkata", hq: true },
    { country: "USA", city: "New York", tz: "America/New_York", hq: false },
    { country: "Philippines", city: "Manila", tz: "Asia/Manila", hq: false },
    { country: "Australia", city: "Sydney", tz: "Australia/Sydney", hq: false },
    { country: "Kenya", city: "Nairobi", tz: "Africa/Nairobi", hq: false },
    { country: "Nigeria", city: "Lagos", tz: "Africa/Lagos", hq: false },
  ],
  /* REAL (self-reported on the main site) */
  stats: [
    { value: 20, suffix: "+", label: "years of collective engineering experience" },
    { value: 47, suffix: "+", label: "specialised service modules" },
    { value: 6, suffix: "", label: "countries with an Illumia office" },
    { value: 24, suffix: "/7", label: "multi-timezone support" },
  ],
  certifications: ["CISSP", "CISA", "CEH", "CCIE"],
  /* REAL partners (not clients) */
  partners: ["Proxmox", "NetBox Labs", "Zextras", "Seqrite", "Apache Guacamole", "Force Ten Technologies"],
};

/* Services: grounded in Illumia's real practice areas; wording is new. */
export const services: Service[] = [
  {
    slug: "product",
    name: "Product engineering",
    short: "Web and mobile products, from first sketch to the thousandth release.",
    body:
      "We design and build customer-facing software: portals, SaaS platforms and mobile apps. One team owns interface, API and infrastructure, so nothing is lost between hand-offs.",
    deliverables: ["Product discovery", "UX and interface design", "Web apps", "iOS and Android", "APIs"],
    stack: ["TypeScript", "Next.js", "React Native", "Node.js", "PostgreSQL"],
  },
  {
    slug: "erp",
    name: "ERPNext and business systems",
    short: "Open-source ERP shaped around how your business actually runs.",
    body:
      "Implementation, custom modules and integrations on ERPNext and the Frappe framework. No per-seat licences, and you own every line of the customisation.",
    deliverables: ["Process mapping", "Custom doctypes and apps", "Data migration", "Integrations", "Training"],
    stack: ["Frappe", "Python", "MariaDB", "Redis", "REST"],
  },
  {
    slug: "ai",
    name: "Governed AI applications",
    short: "Assistants and automations that can pass an audit.",
    body:
      "Retrieval assistants, document pipelines and agent workflows, built with a human in the loop and documented against the EU AI Act, NIST AI RMF and ISO 42001.",
    deliverables: ["Use-case assessment", "RAG and agents", "Evaluation suites", "Model risk documentation"],
    stack: ["Python", "Claude", "pgvector", "LangGraph", "OpenTelemetry"],
  },
  {
    slug: "platform",
    name: "Platform and DevOps",
    short: "Pipelines, private cloud and the boring reliability that lets teams ship daily.",
    body:
      "CI/CD, infrastructure as code and container platforms on public cloud or on your own Proxmox clusters, with NetBox as the source of truth.",
    deliverables: ["CI/CD pipelines", "Kubernetes", "Infrastructure as code", "Observability", "Runbooks"],
    stack: ["Proxmox", "Kubernetes", "Terraform", "NetBox", "Grafana"],
  },
  {
    slug: "secure",
    name: "Secure by design",
    short: "Security built into the code, not bolted on before the audit.",
    body:
      "Threat modelling, secure code review and compliance-ready architecture for PCI-DSS, ISO 27001, HIPAA and GDPR, from engineers who also hold CISSP and CEH.",
    deliverables: ["Threat models", "Code review", "SAST/DAST in CI", "Pen-test remediation", "Audit evidence"],
    stack: ["Keycloak", "Vault", "OWASP ZAP", "Semgrep", "Wazuh"],
  },
  {
    slug: "modernise",
    name: "Legacy modernisation",
    short: "Move the system everyone is afraid to touch, one safe slice at a time.",
    body:
      "We map the old system, wrap it in tests, and replace it piece by piece behind a stable interface, so the business never stops while the platform changes underneath.",
    deliverables: ["System archaeology", "Strangler-fig migration", "Data pipelines", "Cutover plans"],
    stack: ["Go", "Python", "Kafka", "PostgreSQL", "Docker"],
  },
];

/* SAMPLE: concept projects to show the layouts at full density. Replace with real case studies. */
export const projects: Project[] = [
  {
    slug: "ledgerline",
    name: "Ledgerline",
    sector: "Distribution · ERP",
    year: "2026",
    summary: "One ERPNext instance for a 14-warehouse distributor that used to run on four spreadsheets.",
    outcome: "Month-end close from 9 days to 2",
    stack: ["ERPNext", "Frappe", "Python"],
    cover: "erp",
  },
  {
    slug: "harbourwatch",
    name: "Harbourwatch",
    sector: "Telecom · Network",
    year: "2026",
    summary: "A NetBox-driven portal that turns 3,000 devices into one searchable map of the network.",
    outcome: "Change approvals in minutes, not days",
    stack: ["NetBox", "Django", "React"],
    cover: "network",
  },
  {
    slug: "clearpass",
    name: "Clearpass",
    sector: "Healthcare · Portal",
    year: "2025",
    summary: "A HIPAA-ready patient intake portal that replaces the clipboard in the waiting room.",
    outcome: "Front-desk time per patient down 70%",
    stack: ["Next.js", "Keycloak", "PostgreSQL"],
    cover: "intake",
  },
  {
    slug: "atlas",
    name: "Atlas Assist",
    sector: "Finance · AI",
    year: "2026",
    summary: "A governed policy assistant that cites its sources and logs every answer for audit.",
    outcome: "Every answer traceable to a clause",
    stack: ["Claude", "pgvector", "Python"],
    cover: "assistant",
  },
  {
    slug: "migrate-one",
    name: "Migrate/One",
    sector: "Infrastructure · Cloud",
    year: "2025",
    summary: "A control panel that moved 400 virtual machines to Proxmox without a weekend outage.",
    outcome: "Licence spend cut by two thirds",
    stack: ["Proxmox", "Go", "Svelte"],
    cover: "migrate",
  },
  {
    slug: "fieldbook",
    name: "Fieldbook",
    sector: "Utilities · Mobile",
    year: "2025",
    summary: "An offline-first app for engineers who work where the signal does not reach.",
    outcome: "Job sheets synced from 0 bars",
    stack: ["React Native", "SQLite", "Node.js"],
    cover: "field",
  },
];

export const process: Step[] = [
  { name: "Discover", body: "Workshops, system archaeology and a written brief everyone signs.", weeks: "1–2 weeks" },
  { name: "Design", body: "Flows, interface and architecture, tested with real users early.", weeks: "2–4 weeks" },
  { name: "Build", body: "Two-week sprints with a working demo at the end of every one.", weeks: "6–16 weeks" },
  { name: "Harden", body: "Security review, load tests and the documentation auditors ask for.", weeks: "1–2 weeks" },
  { name: "Launch", body: "Staged rollout, monitoring in place, a rollback plan rehearsed.", weeks: "1 week" },
  { name: "Evolve", body: "Support across six time zones, and a roadmap we keep shipping.", weeks: "Ongoing" },
];

export const stack = [
  "TypeScript", "React", "Next.js", "Node.js", "Python", "Go", "Frappe", "ERPNext",
  "PostgreSQL", "Redis", "Kafka", "Docker", "Kubernetes", "Proxmox", "Terraform",
  "NetBox", "Keycloak", "Grafana", "Claude", "React Native",
];

export const buildLog = [
  "$ illumia build --target production",
  "→ resolving 1,284 packages",
  "→ running 3,912 tests ........ passed",
  "→ semgrep: 0 high, 0 medium findings",
  "→ container signed  sha256:9f2c…e41a",
  "→ rollout 10% → 50% → 100%",
  "✓ live in 4m 12s — zero downtime",
];

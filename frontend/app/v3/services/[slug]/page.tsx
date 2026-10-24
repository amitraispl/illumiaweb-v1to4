import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serviceBySlug, services } from "@/lib/copy";
import { Detail } from "./Detail";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(props: PageProps<"/v3/services/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const s = serviceBySlug(slug);
  return s ? { title: s.name, description: s.short } : {};
}

export default async function KineticService(props: PageProps<"/v3/services/[slug]">) {
  const { slug } = await props.params;
  if (!serviceBySlug(slug)) notFound();
  return <Detail slug={slug} />;
}

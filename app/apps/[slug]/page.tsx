import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolHeader from "@/components/ui/ToolHeader";
import { getCoreApps, getToolBySlug } from "@/lib/tools";

interface AppPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getCoreApps().map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: AppPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool || tool.kind !== "core-app") {
    return {};
  }

  return {
    title: `${tool.name} – Atlas`,
    description: tool.description,
  };
}

export default async function CoreAppPage({ params }: AppPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool || tool.kind !== "core-app") {
    notFound();
  }

  const ToolComponent = tool.component;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <ToolHeader
        icon={tool.icon}
        name={tool.name}
        description={tool.description}
        badge="Core App"
      />

      <ToolComponent />
    </main>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolHeader from "@/components/ui/ToolHeader";
import { getSimpleTools, getToolBySlug } from "@/lib/tools";

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getSimpleTools().map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool || tool.kind !== "tool") {
    return {};
  }

  return {
    title: `${tool.name} – Atlas`,
    description: tool.description,
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool || tool.kind !== "tool") {
    notFound();
  }

  const ToolComponent = tool.component;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <ToolHeader
        icon={tool.icon}
        name={tool.name}
        description={tool.description}
      />

      <ToolComponent />
    </main>
  );
}

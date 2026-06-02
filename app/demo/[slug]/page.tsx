import DemoIndex from "../../../frontend/pages/demo/index";

export default async function DemoSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <DemoIndex slug={slug} />;
}

export function generateStaticParams() {
  return [
    { slug: "cpu-scheduling" },
    { slug: "memory-management" },
    { slug: "virtual-memory" },
    { slug: "deadlock" },
  ];
}

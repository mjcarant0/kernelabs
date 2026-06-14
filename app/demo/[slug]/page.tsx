import DemoIndex from "../../../frontend/pages/demo/index";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DemoSlugPage({ params }: Props) {
  const { slug } = await params;
  return <DemoIndex slug={slug} />;
}

export function generateStaticParams() {
  return [
    { slug: "cpu-scheduling" },
    { slug: "memory-management" },
    { slug: "virtual-memory" },
    { slug: "disk-scheduling" },
    { slug: "deadlock" },
  ];
}

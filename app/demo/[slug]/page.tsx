import DemoIndex from "../../../frontend/pages/demo/index";

interface Props {
  params: { slug: string };
}

export default function DemoSlugPage({ params }: Props) {
  return <DemoIndex slug={params.slug} />;
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

/**
 Dynamic Topic Route
**/

import IntroductionTopic from "@/frontend/pages/topics/introduction";

interface TopicRouteProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function TopicRoute({ params }: TopicRouteProps) {
  const { slug } = await params;

  // Route to the correct topic based on slug
  switch (slug) {
    case "introduction":
      return <IntroductionTopic />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-(--bg-primary) via-[color-mix(in_srgb,var(--bg-primary)_72%,#0b1120)] to-(--bg-secondary)">
          <div className="glass-card max-w-xl rounded-3xl p-10 text-center">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-cyan-500 dark:text-cyan-300">
              Topic Route
            </p>
            <h1 className="text-3xl font-bold text-(--text-primary) mb-4">Topic Not Found</h1>
            <p className="text-(--text-secondary)">The topic "{slug}" does not exist yet.</p>
          </div>
        </div>
      );
  }
}

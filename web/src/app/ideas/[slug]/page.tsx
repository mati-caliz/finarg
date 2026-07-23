import { PostDetail } from "@/components/posts/PostDetail";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ideas - La Brecha",
  description: "Ideas, leyes y análisis para Argentina publicados por el observatorio.",
};

export default async function IdeaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PostDetail slug={slug} />;
}

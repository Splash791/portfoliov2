import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { trackEvent } from "@/lib/analytics";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.meta.title} — Tyler Quach`,
    description: post.meta.summary,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  trackEvent("blog_post_view", { slug });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-24 sm:py-32">
      <Link
        href="/blog"
        className="font-mono text-xs text-ink/70 transition-colors hover:text-ink"
      >
        ← All posts
      </Link>

      <article className="glass mt-6 rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="flex flex-wrap items-center gap-2">
          {post.meta.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-ink/5 px-3 py-1 font-mono text-xs text-ink/75"
            >
              {tag}
            </span>
          ))}
          <span className="font-mono text-xs text-ink/65">
            {post.meta.readingTime}
          </span>
        </div>

        <h1 className="mt-4 font-serif text-3xl text-ink sm:text-4xl">
          {post.meta.title}
        </h1>

        {/* `.mdx-body` (globals.css) styles raw MDX child elements directly
            instead of pulling in @tailwindcss/typography for a handful of
            headings/paragraphs/lists — the lighter option (section 0).
            max-w caps reading-line length even though the article container
            itself can stretch wider on large desktop viewports (1440px).
            A fixed rem value, not `ch`: Geist Variable's own `ch` (the "0"
            glyph's width) measures noticeably wider than this font's real
            average character width, so `max-w-[65ch]` rendered at ~87-89
            characters/line in practice (detected live), not 65 -- well past
            the 65-75ch reading measure this is supposed to enforce. */}
        <div className="mdx-body mt-8 max-w-[35rem] text-sm leading-relaxed text-ink/80 sm:text-base">
          <MDXRemote source={post.content} />
        </div>
      </article>
    </main>
  );
}

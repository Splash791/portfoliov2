import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Tyler Quach",
  description:
    "Notes on projects, ML research, internship lessons, and travel + tech.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-24 sm:py-32">
      <h1 className="font-serif text-4xl text-ink sm:text-5xl">All posts</h1>

      <ul className="mt-10 flex flex-col gap-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="glass block rounded-[1.75rem] px-6 py-6 transition-transform hover:scale-[1.01] sm:px-8"
            >
              <h2 className="font-serif text-xl text-ink sm:text-2xl">
                {post.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">
                {post.summary}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-ink/5 px-3 py-1 font-mono text-xs text-ink/75"
                  >
                    {tag}
                  </span>
                ))}
                <span className="font-mono text-xs text-ink/65">
                  {post.readingTime}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

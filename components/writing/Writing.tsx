"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { durations, easing, useReducedMotionSafe } from "@/lib/motion";
// Type-only import — erased at build time, so lib/blog.ts's `fs`/`path`
// usage never ends up in this client bundle. `getAllPosts()` itself must
// be called server-side (app/page.tsx) and passed in as `posts`.
import type { PostMeta } from "@/lib/blog";

export default function Writing({ posts }: { posts: PostMeta[] }) {
  const reducedMotion = useReducedMotionSafe();

  return (
    <section
      id="writing"
      className="relative mx-auto w-full max-w-5xl px-6 py-24 sm:py-32"
    >
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink/70">
            Blog
          </p>
          <h2 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">
            Notes on what I&apos;m building and learning
          </h2>
        </div>
        <Link
          href="/blog"
          className="shrink-0 font-mono text-xs text-ink/75 underline-offset-4 transition-colors hover:text-ink hover:underline"
        >
          View all posts →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {posts.map((post, i) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            // Reduced motion: instant (duration 0), same convention as
            // Nav.tsx/ProjectModal.tsx — not an early-return here since the
            // fade/slide is simple enough that a zero-duration transition
            // is indistinguishable from "no animation" in practice.
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: durations.base, delay: i * 0.08, ease: easing.out }
            }
          >
            <Link
              href={`/blog/${post.slug}`}
              className="glass block h-full rounded-[1.75rem] px-6 py-6 transition-transform hover:scale-[1.01] sm:px-8"
            >
              <h3 className="font-serif text-xl text-ink">{post.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">
                {post.summary}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-ink/5 px-3 py-1 font-mono text-[0.65rem] text-ink/75"
                  >
                    {tag}
                  </span>
                ))}
                <span className="font-mono text-[0.65rem] text-ink/65">
                  {post.readingTime}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

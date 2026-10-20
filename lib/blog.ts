import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

// Reads MDX posts from /content/blog (section 10b). Frontmatter contract:
// title, date (string — real publish dates don't exist yet, see TODOs on
// each post), tags: string[] (one or more of the four categories in
// section 5.6), summary.

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  readingTime: string;
};

export type Post = {
  meta: PostMeta;
  content: string;
};

function readPostFile(filename: string): Post {
  const slug = filename.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  return {
    meta: {
      slug,
      title: data.title,
      date: data.date,
      tags: data.tags ?? [],
      summary: data.summary,
      readingTime: readingTime(content).text,
    },
    content,
  };
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  return files
    .map((f) => readPostFile(f).meta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return readPostFile(`${slug}.mdx`);
}

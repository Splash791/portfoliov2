export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-5xl px-6 py-10 text-center">
      <div className="flex flex-col items-center gap-3 border-t border-ink/10 pt-8 sm:flex-row sm:justify-between">
        <p className="font-mono text-xs text-ink/70">
          © {new Date().getFullYear()} Tyler Quach
        </p>
        {/* TODO: no real LinkedIn URL was provided in the plan — replace href before launch. */}
        <a
          href="#"
          data-placeholder="linkedin-url"
          className="font-mono text-xs text-ink/70 transition-colors hover:text-ink"
        >
          LinkedIn
        </a>
      </div>
    </footer>
  );
}

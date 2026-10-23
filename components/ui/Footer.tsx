export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-5xl px-6 py-10 text-center">
      {/* A camo-tinted divider (instead of a flat ink hairline) and a
          rose hover state on the link are the same subtle "camo thread"
          treatment as the section headings above -- the footer stays
          otherwise plain/quiet by design. Rose (umber, 7.88:1 against
          paper), not coral (tan, 4.49:1 -- just under the 4.5:1 AA floor
          for this text size), since the hover color still needs to clear
          the Contrast Floor Rule. */}
      <div className="flex flex-col items-center gap-3 border-t border-coral/25 pt-8 sm:flex-row sm:justify-between">
        <p className="font-mono text-xs text-ink/70">
          © {new Date().getFullYear()} Tyler Quach
        </p>
        <a
          data-monkey-anchor="footer"
          href="https://www.linkedin.com/in/tyler-quach-/"
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs text-ink/70 transition-colors hover:text-rose"
        >
          LinkedIn
        </a>
      </div>
    </footer>
  );
}

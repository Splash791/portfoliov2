"use client";

import { motion } from "framer-motion";
import { durations, easing, useReducedMotionSafe } from "@/lib/motion";
import Magnetic from "@/components/ui/Magnetic";

export default function Connect() {
  const reducedMotion = useReducedMotionSafe();

  return (
    <section
      id="connect"
      className="relative mx-auto w-full max-w-3xl px-6 py-24 sm:py-32"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={
          reducedMotion ? { duration: 0 } : { duration: durations.base, ease: easing.out }
        }
        className="glass flex flex-col items-center gap-4 rounded-[2rem] px-6 py-14 text-center sm:px-12"
      >
        <h2 className="font-serif text-3xl text-ink sm:text-4xl">
          Let&apos;s connect
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-ink/70">
          Always glad to talk about building things, ML research, or where
          to go next — reach out on LinkedIn or by email.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Magnetic>
            <a
              href="https://www.linkedin.com/in/tyler-quach-/"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-ink px-6 py-3 font-mono text-sm text-[var(--color-paper)] transition-transform hover:scale-[1.03]"
            >
              LinkedIn
            </a>
          </Magnetic>
          {/* TODO: no real email address was provided in the plan — replace before launch. */}
          <Magnetic>
            <a
              href="mailto:hello@example.com"
              data-placeholder="contact-email"
              className="glass rounded-full px-6 py-3 font-mono text-sm text-ink transition-transform hover:scale-[1.03]"
            >
              hello@example.com
            </a>
          </Magnetic>
        </div>
      </motion.div>
    </section>
  );
}

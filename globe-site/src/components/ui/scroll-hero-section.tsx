import { useEffect } from 'react';

type Theme = 'system' | 'light' | 'dark';

export type ScrollHeroSectionProps = {
  /** Words that cycle under "you can …" */
  items?: string[];
  /** Sets CSS var --count automatically from items length */
  showFooter?: boolean;
  /** UI theme (affects color-scheme + switch color) */
  theme?: Theme;
  /** Enable view-timeline animations if supported */
  animate?: boolean;
  /** Accent hue (0–359) */
  hue?: number;
  /** Where the highlight band starts (vh) */
  startVh?: number; // default 50
  /** Space (vh) below the sticky header block */
  spaceVh?: number; // default 50
  /** Debug outline (for dev) */
  debug?: boolean;
  /** Optional custom intro text under the header */
  taglineHTML?: string; // allows <br />
};

export function ScrollHeroSection({
  items = ['i build', 'i deploy', 'i scale'],
  showFooter = false,
  theme = 'system',
  animate = true,
  hue = 280,
  startVh = 50,
  spaceVh = 50,
  debug = false,
  taglineHTML = '',
}: ScrollHeroSectionProps) {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.animate = String(animate);
    root.dataset.debug = String(debug);
    root.style.setProperty('--hue', String(hue));
    root.style.setProperty('--start', `${startVh}vh`);
    root.style.setProperty('--space', `${spaceVh}vh`);
  }, [theme, animate, debug, hue, startVh, spaceVh]);

  return (
    <div
      className="scroll-hero-section min-h-screen w-screen"
      style={
        {
          ['--count' as any]: items.length,
        } as React.CSSProperties
      }
    >
      <header className="content fluid">
        <section className="content">
          <h1 className="sr-only sm:not-sr-only">
            <span aria-hidden="true">you can&nbsp;</span>
            <span className="sr-only">you can ship things.</span>
          </h1>

          {/* Visible cycling words (aria-hidden) */}
          <ul aria-hidden="true">
            {items.map((word, i) => (
              <li key={i} style={{ ['--i' as any]: i } as React.CSSProperties}>
                {word}
              </li>
            ))}
          </ul>
        </section>
      </header>

      <main>
        <section>
          {taglineHTML && (
            <p
              className="fluid"
              dangerouslySetInnerHTML={{ __html: taglineHTML }}
            />
          )}
        </section>
      </main>

      {showFooter && <footer>ʕ⊙ᴥ⊙ʔ Chetan Tripathi &copy; 2025</footer>}

      {/* Styles ported and condensed; uses CSS custom props like the original */}
      <style>{`
        @layer base, stick, demo, debug;

        :root {
          --start: 50vh;
          --space: 50vh;
          --hue: 280;
          --accent: light-dark(hsl(var(--hue) 100% 50%), hsl(var(--hue) 90% 75%));
          --switch: canvas;
          --font-size-min: 14;
          --font-size-max: 20;
          --font-ratio-min: 1.1;
          --font-ratio-max: 1.33;
          --font-width-min: 375;
          --font-width-max: 1500;
        }
        [data-theme='dark'] { --switch: #000; color-scheme: dark only; }
        [data-theme='light'] { --switch: #fff; color-scheme: light only; }
        html { color-scheme: light dark; scrollbar-color: var(--accent) #0000; }
        *, *::before, *::after { box-sizing: border-box; }

        body {
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
            Helvetica Neue, Arial, Noto Sans, Apple Color Emoji, Segoe UI Emoji;
          background: light-dark(white, black);
        }

        /* Screen grid background */
        body::before {
          --size: 45px; --line: color-mix(in hsl, canvasText, transparent 80%);
          content: '';
          position: fixed; inset: 0; z-index: -1;
          background:
            linear-gradient(90deg, var(--line) 1px, transparent 1px var(--size))
              calc(var(--size) * 0.36) 50% / var(--size) var(--size),
            linear-gradient(var(--line) 1px, transparent 1px var(--size)) 0%
              calc(var(--size) * 0.32) / var(--size) var(--size);
          mask: linear-gradient(-20deg, transparent 50%, white);
          pointer-events: none;
        }

        /* Utilities */
        .sr-only {
          position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
        }
        .fluid {
          --fluid-min: calc(var(--font-size-min) * pow(var(--font-ratio-min), var(--font-level, 0)));
          --fluid-max: calc(var(--font-size-max) * pow(var(--font-ratio-max), var(--font-level, 0)));
          --fluid-preferred: calc((var(--fluid-max) - var(--fluid-min)) / (var(--font-width-max) - var(--font-width-min)));
          --fluid-type: clamp(
            (var(--fluid-min) / 16) * 1rem,
            ((var(--fluid-min) / 16) * 1rem)
              - (((var(--fluid-preferred) * var(--font-width-min)) / 16) * 1rem)
              + (var(--fluid-preferred) * var(--variable-unit, 100vi)),
            (var(--fluid-max) / 16) * 1rem
          );
          font-size: var(--fluid-type);
        }

        /* Sticky header logic */
        .scroll-hero-section header {
          --font-level: 4;
          --font-size-min: 24;
          position: sticky;
          top: calc((var(--count) - 1) * -1lh);
          line-height: 1.2;
          display: flex;
          align-items: start;
          width: 100%;
          margin-bottom: var(--space);
        }
        .scroll-hero-section header section:first-of-type {
          display: flex; width: 100%;
          align-items: start; justify-content: center;
          padding-top: calc(var(--start) - 0.5lh);
        }
        .scroll-hero-section header section:first-of-type h1 {
          position: sticky; top: calc(var(--start) - 0.5lh);
          margin: 0; font-weight: 600;
        }

        .scroll-hero-section ul {
          font-weight: 600; list-style: none; padding: 0; margin: 0;
        }

        .scroll-hero-section li {
          --dimmed: color-mix(in oklch, canvasText, #0000 80%);
          background:
            linear-gradient(
              180deg,
              var(--dimmed) 0 calc(var(--start) - 0.5lh),
              var(--accent) calc(var(--start) - 0.55lh) calc(var(--start) + 0.55lh),
              var(--dimmed) calc(var(--start) + 0.5lh)
            );
          background-attachment: fixed;
          color: #0000;
          background-clip: text;
        }

        .scroll-hero-section main {
          width: 100%; height: 100vh; position: relative; z-index: 2; color: canvas;
        }
        .scroll-hero-section main::before {
          content: ''; position: absolute; inset: 0; z-index: -1;
          background: light-dark(#000, #fff); 
          transform: scale(0.9);
          transform-origin: 50% 100%;
          border-radius: 1rem 1rem 0 0;
        }
        .scroll-hero-section main section {
          --font-level: 4; --font-size-min: 20;
          height: 100%; width: 100%; display: flex; place-items: center;
        }
        .scroll-hero-section main section p {
          margin: 0; font-weight: 600; white-space: nowrap;
        }
        .scroll-hero-section main section a:not(.bear-link) {
          color: var(--accent); text-decoration: none; text-underline-offset: 0.1lh;
        }
        .scroll-hero-section main section a:not(.bear-link):is(:hover, :focus-visible) { text-decoration: underline; }

        .scroll-hero-section footer {
          padding-block: 2rem; font-size: 0.875rem; font-weight: 300;
          color: color-mix(in hsl, canvas, #0000 35%); text-align: center; width: 100%;
          background: light-dark(#000, #fff);
        }

        /* View-timeline progressive enhancement */
        @supports (animation-timeline: view()) {
          .scroll-hero-section[data-animate='true'] main { 
            view-timeline: --section;
          }
          .scroll-hero-section[data-animate='true'] main::before {
            transform: scale(0.9);
            animation: scrollGrow both ease-in-out;
            animation-timeline: --section;
            animation-range: entry 50%;
          }
          .scroll-hero-section[data-animate='true'] main section p {
            position: fixed; top: 50%; left: 50%; translate: -50% -50%;
            animation: scrollReveal both ease-in-out;
            animation-timeline: --section;
            animation-range: entry 50%;
          }
          .scroll-hero-section[data-animate='true'] main .bear-link {
            animation: scrollSwitch both ease-in-out;
            animation-timeline: --section;
            animation-range: entry 50%;
          }
          @keyframes scrollSwitch { to { color: var(--switch); } }
          @keyframes scrollReveal { from { opacity: 0; } to { opacity: 1; } }
          @keyframes scrollGrow { 
            from {
              transform: scale(0.9);
              border-radius: 1rem 1rem 0 0;
            }
            to { 
              transform: scale(1);
              border-radius: 0;
            }
          }
        }
        
        /* Fallback for browsers without view-timeline support */
        @supports not (animation-timeline: view()) {
          .scroll-hero-section main::before {
            transform: scale(0.9);
            transform-origin: 50% 100%;
            border-radius: 1rem 1rem 0 0;
          }
        }

        /* Debug */
        [data-debug='true'] .scroll-hero-section li { outline: 0.05em dashed currentColor; }
        [data-debug='true'] .scroll-hero-section :is(h2, li:last-of-type) { outline: 0.05em dashed canvasText; }
      `}</style>
    </div>
  );
}

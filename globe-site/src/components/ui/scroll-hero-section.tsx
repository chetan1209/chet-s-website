import { useEffect, useRef, useState } from 'react';
import { ContainerScroll } from './container-scroll-animation';
import Testimonials from './twitter-testimonial-cards';

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
  const [visibleGroups, setVisibleGroups] = useState<boolean[]>(
    () => items.map(() => false),
  );
  const anchorRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.animate = String(animate);
    root.dataset.debug = String(debug);
    root.style.setProperty('--hue', String(hue));
    root.style.setProperty('--start', `${startVh}vh`);
    root.style.setProperty('--space', `${spaceVh}vh`);
  }, [theme, animate, debug, hue, startVh, spaceVh]);

  useEffect(() => {
    setVisibleGroups(items.map(() => false));
  }, [items]);

  useEffect(() => {
    const anchors = anchorRefs.current;
    if (!anchors.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = anchors.findIndex((anchor) => anchor === entry.target);
          if (index < 0) return;
          setVisibleGroups((prev) => {
            if (prev[index]) return prev;
            const next = [...prev];
            next[index] = true;
            return next;
          });
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.4,
        rootMargin: '0px 0px -20% 0px',
      },
    );

    anchors.forEach((anchor) => {
      if (anchor) observer.observe(anchor);
    });

    return () => observer.disconnect();
  }, [items]);

  const metricGroups = [
    {
      metrics: [
        '10+ production features',
        '20+ system components',
        'multi-stack builds (web · backend · ML)',
      ],
    },
    {
      metrics: ['4× faster ingestion', '3× log coverage', 'CI/CD automated'],
    },
    {
      metrics: ['1,500+ engineers enabled', '50+ teams', '6 universities', '5M+ users supported'],
    },
  ];

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
        <section className="content flex flex-col md:flex-row items-center justify-center gap-12 md:gap-72 w-full max-w-7xl mx-auto">
          {/* Left side - Text */}
          <div className="flex-1 flex justify-center md:justify-end">
            <div>
              <h1 className="sr-only sm:not-sr-only">
                <span aria-hidden="true">you can&nbsp;</span>
                <span className="sr-only">you can ship things.</span>
              </h1>

              {/* Visible cycling words (aria-hidden) */}
              <ul aria-hidden="true" className="text-left">
                {items.map((word, i) => (
                  <li key={word} style={{ ['--i' as any]: i } as React.CSSProperties}>
                    <span className="phrase">{word}</span>
                    <div
                      className={`metrics ${visibleGroups[i] ? 'is-visible' : ''}`}
                      style={{ ['--group-index' as any]: i } as React.CSSProperties}
                    >
                      {metricGroups[i]?.metrics.map((metric, metricIndex) => (
                        <p
                          key={metric}
                          className="metric"
                          style={{ ['--delay' as any]: `${metricIndex * 90}ms` } as React.CSSProperties}
                        >
                          {metric}
                        </p>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right side - Testimonials */}
          <div className="flex-shrink-0 flex justify-center md:justify-start">
            <Testimonials />
          </div>
        </section>
      </header>

      <main>
        <div className="scroll-anchors" aria-hidden="true">
          {items.map((item, index) => (
            <div
              key={item}
              ref={(node) => {
                anchorRefs.current[index] = node;
              }}
              className="scroll-anchor"
            />
          ))}
        </div>
        <ContainerScroll
          titleComponent={
            <div className="text-4xl font-semibold text-black dark:text-white">
              {/* Optional title can go here */}
            </div>
          }
        >
          <div className="h-full w-full flex items-center justify-center">
            {taglineHTML ? (
              <p
                className="fluid"
                dangerouslySetInnerHTML={{ __html: taglineHTML }}
              />
            ) : (
              <div className="text-center">
                {/* Content for the white card */}
              </div>
            )}
          </div>
        </ContainerScroll>
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
          --size: 45px; 
          --line: color-mix(in hsl, canvasText, transparent 30%);
          content: '';
          position: fixed; 
          inset: 0; 
          z-index: 0;
          background:
            linear-gradient(90deg, var(--line) 1px, transparent 1px var(--size))
              calc(var(--size) * 0.36) 50% / var(--size) var(--size),
            linear-gradient(var(--line) 1px, transparent 1px var(--size)) 0%
              calc(var(--size) * 0.32) / var(--size) var(--size);
          mask: linear-gradient(-20deg, transparent 30%, white);
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
          --font-size-min: 30;
          position: sticky;
          top: calc((var(--count) - 1) * -1lh);
          line-height: 1.2;
          display: flex;
          align-items: start;
          width: 100%;
          margin-bottom: var(--space);
        }
        .scroll-hero-section header section:first-of-type {
          display: flex; 
          width: 100%;
          align-items: center; 
          justify-content: center;
          padding-top: calc(var(--start) - 0.5lh);
          padding-left: 10rem;
          padding-right: 10rem;
        }
        .scroll-hero-section header section:first-of-type h1 {
          position: sticky; 
          top: calc(var(--start) - 0.5lh);
          margin: 0; 
          font-weight: 600;
        }

        .scroll-hero-section ul {
          font-weight: 600; list-style: none; padding: 0; margin: 0;
          position: relative;
          display: grid;
          gap: 1.75rem;
        }
        .scroll-hero-section ul li {
          position: relative;
          min-height: 1lh;
          display: grid;
          gap: 0.5rem;
        }

        .scroll-hero-section .phrase {
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
        .scroll-hero-section .phrase {
          display: inline-block;
        }

        .scroll-hero-section .metrics {
          display: grid;
          gap: 0.35rem;
          font-weight: 450;
          font-size: 0.95rem;
          letter-spacing: 0.01em;
          color: color-mix(in hsl, canvasText, #0000 35%);
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 520ms cubic-bezier(0.16, 1, 0.3, 1),
            transform 520ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .scroll-hero-section .metrics.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .scroll-hero-section .metric {
          margin: 0;
          transition: opacity 520ms cubic-bezier(0.16, 1, 0.3, 1),
            transform 520ms cubic-bezier(0.16, 1, 0.3, 1);
          transition-delay: var(--delay);
          opacity: 0;
          transform: translateY(10px);
        }
        .scroll-hero-section .metrics.is-visible .metric {
          opacity: 1;
          transform: translateY(0);
        }
        .scroll-hero-section .metrics .metric:last-child {
          color: color-mix(in hsl, canvasText, #0000 20%);
        }

        .scroll-hero-section .scroll-anchors {
          display: grid;
          gap: 55vh;
          padding-top: calc(var(--start) * 0.6);
          padding-bottom: calc(var(--space) * 0.8);
          pointer-events: none;
        }
        .scroll-hero-section .scroll-anchor {
          height: 1px;
        }


        .scroll-hero-section main {
          width: 100%; 
          position: relative; 
          z-index: 2; 
          color: canvas;
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

        @media (min-width: 768px) {
          .scroll-hero-section .metrics {
            max-width: 20rem;
          }
          .scroll-hero-section ul li:nth-child(1) .metrics {
            margin-left: 1rem;
          }
          .scroll-hero-section ul li:nth-child(2) .metrics {
            margin-left: 2.2rem;
          }
          .scroll-hero-section ul li:nth-child(3) .metrics {
            margin-left: 0.6rem;
          }
        }

        @media (max-width: 767px) {
          .scroll-hero-section .metrics {
            font-size: 0.9rem;
            transform: translateY(6px);
          }
          .scroll-hero-section .metric {
            transform: translateY(6px);
          }
          .scroll-hero-section header section:first-of-type {
            padding-left: 2rem;
            padding-right: 2rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .scroll-hero-section .metrics,
          .scroll-hero-section .metric {
            transition-duration: 1ms;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}

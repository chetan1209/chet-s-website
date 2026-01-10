"use client";

import { useState, useRef } from "react";
import { Briefcase, Code, GraduationCap } from "lucide-react";
import PortfolioHero from "@/components/ui/portfolio-hero";
import RadialOrbitalTimeline3D from "@/components/ui/radial-orbital-timeline-3d";
import { PixelCursorTrail } from "@/components/ui/pixel-trail";
import { ScrollHeroSection } from "@/components/ui/scroll-hero-section";

const timelineData = [
  {
    id: 1,
    title: "Work Ex",
    date: "2022 - Present",
    content: "Your work experience details will go here. You can add descriptions of your roles, achievements, and responsibilities.",
    category: "Experience",
    icon: Briefcase,
    relatedIds: [2],
    status: "completed" as const,
    energy: 95,
  },
  {
    id: 2,
    title: "Projects",
    date: "2020 - Present",
    content: "Your projects will be displayed here. Include descriptions, technologies used, and key features.",
    category: "Projects",
    icon: Code,
    relatedIds: [1, 3],
    status: "in-progress" as const,
    energy: 85,
  },
  {
    id: 3,
    title: "Research",
    date: "2021 - Present",
    content: "Your research work and publications will be shown here. Add details about your research areas and contributions.",
    category: "Research",
    icon: GraduationCap,
    relatedIds: [2],
    status: "in-progress" as const,
    energy: 75,
  },
];

export default function App() {
  const globeSectionRef = useRef<HTMLDivElement>(null);

  const handleScrollDown = () => {
    if (globeSectionRef.current) {
      globeSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="overflow-x-hidden relative">
      {/* Pixel Cursor Trail - overlays entire page */}
      <PixelCursorTrail />
      
      {/* Hero Section */}
      <section className="min-h-screen">
        <PortfolioHero onScrollDown={handleScrollDown} />
      </section>

      {/* Scroll Hero Section with morphing text */}
      <section className="min-h-screen">
        <ScrollHeroSection
          items={['i build', 'i deploy', 'i scale']}
          showFooter={false}
          animate={true}
          startVh={50}
          spaceVh={50}
        />
      </section>

      {/* 3D Globe Section */}
      <section
        ref={globeSectionRef}
        id="globe-section"
        className="min-h-screen"
      >
        <RadialOrbitalTimeline3D timelineData={timelineData} />
      </section>
    </div>
  );
}

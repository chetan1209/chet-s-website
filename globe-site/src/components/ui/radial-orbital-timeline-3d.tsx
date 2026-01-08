"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import { ArrowRight, Link, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as THREE from "three";

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface RadialOrbitalTimeline3DProps {
  timelineData: TimelineItem[];
}

// 3D Node component
function Node3D({
  item,
  position,
  isActive,
  isRelated,
  isPulsing,
  onClick,
  rotationSpeed,
  shouldCounterRotate,
}: {
  item: TimelineItem;
  position: [number, number, number];
  isActive: boolean;
  isRelated: boolean;
  isPulsing: boolean;
  onClick: () => void;
  rotationSpeed: number;
  shouldCounterRotate: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const nodeGroupRef = useRef<THREE.Group>(null);
  const Icon = item.icon;

  useFrame((state) => {
    if (meshRef.current) {
      // Pulse animation
      const scale = isActive
        ? 1.5
        : 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * rotationSpeed;
      const ringScale = isActive
        ? 1.8
        : 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      ringRef.current.scale.setScalar(ringScale);
    }
    // Counter-rotate the active node to keep it stationary
    // Group rotates at 0.08 speed, so counter-rotate at -0.08
    if (nodeGroupRef.current && shouldCounterRotate) {
      nodeGroupRef.current.rotation.y = -state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <group ref={nodeGroupRef} position={position}>
      {/* Glow ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.15, 0.2, 32]} />
        <meshBasicMaterial
          color={isActive ? "#ffffff" : isRelated ? "#60a5fa" : "#3b82f6"}
          transparent
          opacity={isActive ? 0.6 : isPulsing ? 0.5 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Main node sphere */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={isActive ? "#ffffff" : isRelated ? "#60a5fa" : "#1e40af"}
          emissive={isActive ? "#ffffff" : isRelated ? "#60a5fa" : "#3b82f6"}
          emissiveIntensity={isActive ? 1.5 : isRelated ? 1 : 0.5}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Icon (using Html for React icons) */}
      <Html
        center
        distanceFactor={8}
        position={[0, 0, 0.15]}
        style={{
          pointerEvents: "none",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          className={`flex items-center justify-center ${
            isActive ? "text-black" : "text-white"
          }`}
        >
          <Icon size={16} />
        </div>
      </Html>

      {/* Label */}
      <Html
        center
        distanceFactor={10}
        position={[0, -0.25, 0]}
        style={{
          pointerEvents: "none",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          className={`text-xs font-semibold tracking-wider whitespace-nowrap ${
            isActive ? "text-white scale-110" : "text-white/70"
          } transition-all duration-300`}
        >
          {item.title}
        </div>
      </Html>
    </group>
  );
}

// Main 3D Timeline component
function Timeline3DScene({
  timelineData,
  activeId,
  onNodeClick,
  autoRotate,
  relatedIds,
  pulseEffect,
}: {
  timelineData: TimelineItem[];
  activeId: number | null;
  onNodeClick: (id: number) => void;
  autoRotate: boolean;
  relatedIds: number[];
  pulseEffect: Record<number, boolean>;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Calculate positions for nodes in 3D space (spherical distribution)
  const nodePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const radius = 2.5;

    timelineData.forEach((item, index) => {
      // Use Fibonacci sphere algorithm for even distribution
      const theta = 2.399963229728653 * index; // Golden angle in radians
      const y = 1 - (index / timelineData.length) * 2; // -1 to 1
      const r = Math.sqrt(1 - y * y);
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      positions.push([x * radius, y * radius, z * radius]);
    });

    return positions;
  }, [timelineData]);

  // Always rotate, but slower
  useFrame((state) => {
    if (groupRef.current) {
      // Slower rotation speed (0.08 instead of 0.2)
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Center core */}
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#818cf8"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Orbital ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.01, 16, 100]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
      </mesh>

      {/* Nodes */}
      {timelineData.map((item, index) => {
        const position = nodePositions[index];
        const isActive = activeId === item.id;
        const isRelated = relatedIds.includes(item.id);
        const isPulsing = pulseEffect[item.id];

        return (
          <Node3D
            key={item.id}
            item={item}
            position={position}
            isActive={isActive}
            isRelated={isRelated}
            isPulsing={isPulsing}
            onClick={() => onNodeClick(item.id)}
            rotationSpeed={isActive ? 0 : 0.5}
            shouldCounterRotate={false}
          />
        );
      })}
    </group>
  );
}

// Side panel card component (fixed on right side)
function SidePanelCard({
  item,
  isVisible,
  onClose,
  timelineData,
  onRelatedClick,
}: {
  item: TimelineItem | null;
  isVisible: boolean;
  onClose: () => void;
  timelineData: TimelineItem[];
  onRelatedClick: (id: number) => void;
}) {
  const getStatusStyles = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed":
        return "text-white bg-black border-white";
      case "in-progress":
        return "text-black bg-white border-black";
      case "pending":
        return "text-white bg-black/40 border-white/50";
      default:
        return "text-white bg-black/40 border-white/50";
    }
  };

  if (!item) return null;

  return (
    <div
      className={`fixed right-0 top-0 h-full w-96 bg-black/95 backdrop-blur-lg border-l border-white/30 shadow-xl shadow-white/10 z-50 transition-transform duration-700 ease-in-out ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="h-full overflow-y-auto p-6">
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <Badge className={`px-2 text-xs ${getStatusStyles(item.status)}`}>
                {item.status === "completed"
                  ? "COMPLETE"
                  : item.status === "in-progress"
                  ? "IN PROGRESS"
                  : "PENDING"}
              </Badge>
              <span className="text-xs font-mono text-white/50">{item.date}</span>
            </div>
            <CardTitle className="text-lg mt-2 text-white">{item.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-white/80">
            <p>{item.content}</p>

            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="flex items-center text-white/70">
                  <Zap size={12} className="mr-1" />
                  Energy Level
                </span>
                <span className="font-mono text-white">{item.energy}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${item.energy}%` }}
                ></div>
              </div>
            </div>

            {item.relatedIds.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="flex items-center mb-2">
                  <Link size={12} className="text-white/70 mr-1" />
                  <h4 className="text-xs uppercase tracking-wider font-medium text-white/70">
                    Connected Nodes
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.relatedIds.map((relatedId) => {
                    const relatedItem = timelineData.find((i) => i.id === relatedId);
                    return (
                      <Button
                        key={relatedId}
                        variant="outline"
                        size="sm"
                        className="flex items-center h-7 px-3 py-0 text-xs rounded-none border-white/20 bg-transparent hover:bg-white/10 text-white/80 hover:text-white transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRelatedClick(relatedId);
                        }}
                      >
                        {relatedItem?.title}
                        <ArrowRight size={10} className="ml-1 text-white/60" />
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="mt-6 w-full border-white/20 bg-transparent hover:bg-white/10 text-white/80 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RadialOrbitalTimeline3D({
  timelineData,
}: RadialOrbitalTimeline3DProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [relatedIds, setRelatedIds] = useState<number[]>([]);

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const handleNodeClick = (id: number) => {
    if (activeId === id) {
      // Close if clicking the same node
      setActiveId(null);
      setAutoRotate(true);
      setPulseEffect({});
      setRelatedIds([]);
    } else {
      // Open new node
      setActiveId(id);
      setAutoRotate(false);
      const related = getRelatedItems(id);
      setRelatedIds(related);
      const newPulseEffect: Record<number, boolean> = {};
      related.forEach((relId) => {
        newPulseEffect[relId] = true;
      });
      setPulseEffect(newPulseEffect);
    }
  };

  const handleRelatedClick = (id: number) => {
    handleNodeClick(id);
  };

  const activeItem = activeId
    ? timelineData.find((item) => item.id === activeId)
    : null;

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveId(null);
        setAutoRotate(true);
        setPulseEffect({});
        setRelatedIds([]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClose = () => {
    setActiveId(null);
    setAutoRotate(true);
    setPulseEffect({});
    setRelatedIds([]);
  };

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* Canvas container that shifts left when active */}
      <div
        className={`h-full transition-transform duration-700 ease-in-out ${
          activeId ? "translate-x-[-12rem]" : "translate-x-0"
        }`}
      >
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          style={{ width: "100%", height: "100%" }}
          onClick={(e) => {
            // Close on background click
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          {/* Starry background */}
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            fade
            speed={0.5}
          />

          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />

          {/* Main timeline scene */}
          <Timeline3DScene
            timelineData={timelineData}
            activeId={activeId}
            onNodeClick={handleNodeClick}
            autoRotate={autoRotate}
            relatedIds={relatedIds}
            pulseEffect={pulseEffect}
          />

          {/* Camera controls - can rotate but not zoom */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            minDistance={4}
            maxDistance={10}
          />
        </Canvas>
      </div>

      {/* Side panel card */}
      <SidePanelCard
        item={activeItem}
        isVisible={!!activeId}
        onClose={handleClose}
        timelineData={timelineData}
        onRelatedClick={handleRelatedClick}
      />
    </div>
  );
}

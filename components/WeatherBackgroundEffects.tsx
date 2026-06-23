"use client";

import React from "react";
import { motion } from "framer-motion";

interface BackgroundEffectsProps {
  type: "sunny" | "rainy" | "cloudy" | "snowy" | "mild";
}

export default function WeatherBackgroundEffects({ type }: BackgroundEffectsProps) {
  // Generate random values for positions, speed, and delays
  const particleCount = type === "rainy" ? 40 : type === "snowy" ? 30 : 5;
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: type === "rainy" ? 1 + Math.random() * 1.5 : 4 + Math.random() * 5,
    size: type === "rainy" ? 1.5 + Math.random() * 1.5 : 2 + Math.random() * 6,
  }));

  if (type === "rainy") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Falling Rain drops */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute bg-cyan-400/30"
            style={{
              left: p.left,
              width: "1.5px",
              height: `${20 + Math.random() * 20}px`,
              top: -50,
            }}
            animate={{
              y: ["0vh", "110vh"],
              x: ["0px", "-20px"],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay,
            }}
          />
        ))}
        {/* Subtle lightning flash overlay */}
        <motion.div
          className="absolute inset-0 bg-white"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0, 0.08, 0, 0, 0, 0.12, 0.02, 0, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    );
  }

  if (type === "snowy") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Drifting snow particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white/60 backdrop-blur-[1px]"
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              top: -20,
            }}
            animate={{
              y: ["0vh", "110vh"],
              x: ["0px", `${(Math.random() - 0.5) * 60}px`],
              rotate: 360,
            }}
            transition={{
              duration: p.duration + 2,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay,
            }}
          />
        ))}
      </div>
    );
  }

  if (type === "sunny") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Radiating solar flares / light leaks */}
        <motion.div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-400/20 filter blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-orange-400/10 filter blur-3xl"
          animate={{
            scale: [1, 1.2, 0.9, 1],
            opacity: [0.15, 0.25, 0.15, 0.15],
            x: [0, 20, -20, 0],
            y: [0, -20, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    );
  }

  if (type === "cloudy") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Slow drifting cloud shapes */}
        <motion.div
          className="absolute top-10 -left-64 w-[500px] h-[300px] rounded-full bg-slate-400/10 filter blur-[80px]"
          animate={{
            x: ["0vw", "120vw"],
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-20 -right-64 w-[600px] h-[350px] rounded-full bg-zinc-500/10 filter blur-[90px]"
          animate={{
            x: ["0vw", "-120vw"],
          }}
          transition={{
            duration: 80,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    );
  }

  // Mild
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gentle floating dust/light particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-300/15"
          style={{
            left: p.left,
            width: `${p.size + 1}px`,
            height: `${p.size + 1}px`,
            top: "105vh",
          }}
          animate={{
            y: ["0vh", "-110vh"],
            x: ["0px", `${(Math.random() - 0.5) * 40}px`],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: p.duration * 2 + 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

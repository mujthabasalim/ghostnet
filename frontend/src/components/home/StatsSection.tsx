"use client";

import React from "react";
import { motion } from "framer-motion";

const stats = [
  { label: "Nets Retrieved", value: "12,450+", sub: "Tons of ghost gear" },
  { label: "Marine Life Saved", value: "85,000+", sub: "Confirmed releases" },
  { label: "Ocean Monitored", value: "4.2M", sub: "Square Kilometers" },
  { label: "Response Teams", value: "850+", sub: "Global coordination" },
];

export const StatsSection: React.FC = () => {
  return (
    <section className="py-24 px-4 bg-slate-950 text-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [bg-size:40px_40px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
              }}
            >
              <h3 className="text-4xl md:text-6xl font-black mb-2 text-marine-accent tracking-tighter">
                {stat.value}
              </h3>
              <p className="text-lg md:text-xl font-bold mb-1 tracking-tight">
                {stat.label}
              </p>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">
                {stat.sub}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

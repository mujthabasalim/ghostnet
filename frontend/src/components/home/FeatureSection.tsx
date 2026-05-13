"use client";

import React from "react";
import { motion } from "framer-motion";
import { Map, Shield, Waves, Activity, Zap, Globe } from "lucide-react";

const features = [
  {
    title: "Real-time Mapping",
    description:
      "Satellite-integrated AIS data for precise hazard monitoring and net location tracking.",
    icon: Map,
    color: "bg-marine-accent",
    borderColor: "border-marine-accent/20",
  },
  {
    title: "Guardian Shield",
    description:
      "Automated proximity alerts protecting vessels and marine wildlife from entanglement hazards.",
    icon: Shield,
    color: "bg-rose-500",
    borderColor: "border-rose-500/20",
  },
  {
    title: "Mission Coordination",
    description:
      "End-to-end management for rapid retrieval operations with real-time team collaboration.",
    icon: Waves,
    color: "bg-emerald-500",
    borderColor: "border-emerald-500/20",
  },
  {
    title: "Impact Analytics",
    description:
      "Visualizing the data that matters—nets retrieved, species saved, and area cleaned.",
    icon: Activity,
    color: "bg-amber-500",
    borderColor: "border-amber-500/20",
  },
  {
    title: "Swift Response",
    description:
      "Intelligent dispatch algorithms ensuring the closest retrieval teams are notified instantly.",
    icon: Zap,
    color: "bg-indigo-500",
    borderColor: "border-indigo-500/20",
  },
  {
    title: "Global Network",
    description:
      "A decentralized community of marine protectors working across all oceans.",
    icon: Globe,
    color: "bg-cyan-500",
    borderColor: "border-cyan-500/20",
  },
];

export const FeatureSection: React.FC = () => {
  return (
    <section className="py-24 px-4 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-slate-950 mb-6 tracking-tight"
          >
            SMARTER <span className="text-gradient">SOLUTIONS</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium"
          >
            Leveraging state-of-the-art technology to solve one of the ocean's
            most pressing environmental challenges.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card p-8 group border-2 ${feature.borderColor}`}
            >
              <div
                className={`w-14 h-14 ${feature.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}
              >
                <feature.icon size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-950 mb-3 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

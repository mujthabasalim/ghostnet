"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

interface CtaSectionProps {
  session: any;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ session }) => {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] bg-linear-to-br from-marine-950 to-slate-900 p-12 md:p-20 overflow-hidden shadow-2xl shadow-marine-accent/20"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-marine-accent/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-marine-cyan/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-marine-accent/20 rounded-2xl flex items-center justify-center text-marine-accent mb-8">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              READY TO PROTECT <br />
              <span className="text-marine-accent">OUR SEAS?</span>
            </h2>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mb-12 font-medium">
              Join thousands of marine conservationists and professional
              retrieval teams. Start your mission today and make a real
              difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {!session ? (
                <Link
                  href="/auth"
                  className="group flex items-center justify-center gap-2 bg-marine-accent text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all hover:scale-[1.05] hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] active:scale-[0.98]"
                >
                  Create Free Account
                  <ArrowRight
                    size={24}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="group flex items-center justify-center gap-2 bg-marine-accent text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all hover:scale-[1.05] hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] active:scale-[0.98]"
                >
                  Back to Command Center
                  <ArrowRight
                    size={24}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              )}
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 bg-white/10 text-white px-10 py-5 rounded-2xl font-bold text-xl border border-white/20 transition-all hover:bg-white/20 backdrop-blur-sm"
              >
                View Live Map
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

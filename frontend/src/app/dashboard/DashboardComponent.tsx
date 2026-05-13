"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, Ship, Activity } from "lucide-react";
import dynamic from "next/dynamic";
import { useAIS } from "@/hooks/useAIS";

const Map = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-3xl" />
});
import { checkProximity } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function DashboardComponent() {
  const { vessels, loading: aisLoading } = useAIS();
  const [nets, setNets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const statsConfig = [
    {
      name: t('active_hazards'),
      key: "ACTIVE",
      icon: AlertTriangle,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      name: t('in_progress'),
      key: "IN_PROGRESS",
      icon: Activity,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      name: t('missions_completed'),
      key: "RETRIEVED",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      name: t('vessels'),
      key: "VESSELS",
      icon: Ship,
      color: "text-marine-accent",
      bg: "bg-marine-accent/10",
    },
  ];

  useEffect(() => {
    const fetchNets = async () => {
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();
        if (Array.isArray(data)) {
          setNets(data);
        } else {
          console.error("API error or invalid data format:", data);
          setNets([]);
        }
      } catch (err) {
        console.error("Error fetching nets:", err);
        setNets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNets();
    const interval = setInterval(fetchNets, 10000);

    // Real-time Broadcast Listener
    const channel = supabase
      .channel('maritime-alerts')
      .on('broadcast', { event: 'new-hazard' }, (payload) => {
        console.log('New hazard broadcast received:', payload);
        toast.warning(payload.payload.message, {
          description: payload.payload.title,
          duration: 5000,
        });
        fetchNets(); // Refresh data immediately
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const stats = statsConfig.map((config) => {
    let value = "0";
    if (config.key === "VESSELS") {
      value = vessels.length.toString();
    } else {
      value = nets.filter((n) => n.status === config.key).length.toString();
    }
    return { ...config, value };
  });

  const alerts = vessels.flatMap((vessel) => {
    const dangerousNets = checkProximity(vessel, nets);
    return dangerousNets.map((net) => ({
      vesselName: vessel.name,
      netId: net.id,
      distance: "Critical Proximity",
    }));
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-7xl mx-auto py-8 px-4 lg:px-0"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">
          {t('command_center')}
        </h1>
        <p className="text-slate-500 text-lg font-medium">
          {t('situational_awareness')}
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass-card p-6 flex items-center gap-4 hover:shadow-2xl hover:shadow-marine-accent/10 transition-all duration-500 group border-white/60"
            >
              <div
                className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform shadow-sm`}
              >
                <Icon size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  {stat.name}
                </p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 glass-card min-h-[600px] overflow-hidden relative border-white/60 shadow-2xl"
        >
          <div className="absolute top-6 left-6 z-10 flex gap-3">
            <div className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-sm font-bold text-slate-900 flex items-center gap-2 shadow-lg border border-white/50">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              {t('live_ais_feed')}
            </div>
          </div>

          <div className="w-full h-full">
            <Map nets={nets} vessels={vessels} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="glass-card p-6 border-white/60">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              {t('alerts')}
            </h3>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {alerts.length > 0 ? (
                  alerts.map((alert, i) => (
                    <motion.div
                      key={`${alert.netId}-${i}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-4"
                    >
                      <AlertTriangle
                        className="text-rose-500 shrink-0"
                        size={20}
                      />
                      <div>
                        <p className="text-sm font-bold text-rose-900 uppercase tracking-tight">
                          Danger: Entanglement Risk
                        </p>
                        <p className="text-sm text-rose-700 mt-1">
                          Vessel{" "}
                          <span className="font-black">
                            "{alert.vesselName}"
                          </span>{" "}
                          is inside hazard zone {alert.netId.substring(0, 8)}.
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-20 text-center opacity-40">
                    <CheckCircle2
                      className="mx-auto mb-4 text-emerald-500"
                      size={32}
                    />
                    <p className="text-xs uppercase tracking-[0.2em] font-black text-slate-900">
                      {t('no_critical_threats')}
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="glass-card p-6 border-white/60">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              {t('active_missions')}
            </h3>
            <div className="space-y-4">
              {nets
                .filter((n) => n.status === "IN_PROGRESS")
                .slice(0, 3)
                .map((net) => (
                  <div
                    key={net.id}
                    className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-white transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Retrieval GN-{net.id.substring(0, 5)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        Team: {net.team || "Coastal Divers"}
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                      In Progress
                    </div>
                  </div>
                ))}
              {nets.filter((n) => n.status === "IN_PROGRESS").length === 0 && (
                <p className="text-center py-10 text-xs text-slate-400 font-bold uppercase tracking-widest opacity-50">
                  No active missions
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

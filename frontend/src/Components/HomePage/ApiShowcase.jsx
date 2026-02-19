import React, { useRef } from 'react';
import { ExternalLink, Shield, Database, FileText, BarChart, Server } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

const SERVICES = [
  {
    name: "Authentication",
    icon: Shield,
    description: "Authentification sécurisée avec JWT et gestion des rôles",
    port: "5001",
    accent: "emerald",
  },
  {
    name: "Catalogue",
    icon: Database,
    description: "Gestion des formations, filières et modules",
    port: "5003",
    accent: "cyan",
  },
  {
    name: "Questionnaires",
    icon: FileText,
    description: "Création et collecte de questionnaires dynamiques",
    port: "5004",
    accent: "blue",
  },
  {
    name: "Statistiques",
    icon: BarChart,
    description: "Moteur d'analytique, rapports et métriques",
    port: "5005",
    accent: "indigo",
  },
];

const ACCENT = {
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-400" },
  cyan:    { bg: "bg-cyan-500/10",    border: "border-cyan-500/20",    icon: "text-cyan-400" },
  blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/20",    icon: "text-blue-400" },
  indigo:  { bg: "bg-indigo-500/10",  border: "border-indigo-500/20",  icon: "text-indigo-400" },
};

const TECH = [".NET 9", "Docker", "PostgreSQL", "Kafka", "React 19"];

function ApiShowcase() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="relative py-28 bg-slate-950 overflow-hidden">
      {/* Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/5 rounded-full blur-3xl" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
            <Server className="w-3.5 h-3.5" />
            Architecture Microservices
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Architecture backend complète
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            4 microservices .NET 9 indépendants, orchestrés par Docker Compose avec communication via Kafka.
          </p>
        </motion.div>

        {/* Services grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {SERVICES.map((svc, i) => {
            const a = ACCENT[svc.accent];
            return (
              <motion.a
                key={svc.name}
                href={`http://209.38.233.63:${svc.port}/docs`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:bg-slate-900/90 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-11 h-11 rounded-xl ${a.bg} border ${a.border} flex items-center justify-center mb-4`}>
                  <svc.icon className={`w-5 h-5 ${a.icon}`} />
                </div>
                <h3 className="text-white font-semibold mb-1.5 flex items-center gap-2">
                  {svc.name}
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-3">
                  {svc.description}
                </p>
                <span className="text-xs font-mono text-slate-500">
                  Port {svc.port}
                </span>
              </motion.a>
            );
          })}
        </div>

        {/* Tech stack + API Gateway CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-between bg-slate-900/60 border border-slate-800 rounded-2xl px-8 py-6 gap-6"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-400 mr-1">Technologies :</span>
            {TECH.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="flex gap-3 flex-shrink-0">
            <a
              href="https://api.eval-ing.live"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              API Gateway
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://github.com/dahbimoad/eval-ing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-white/5 hover:border-slate-600 transition-all duration-300"
            >
              Code source
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ApiShowcase;
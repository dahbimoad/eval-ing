import React, { useRef } from "react";
import { Layers, ShieldCheck, Database, Workflow } from "lucide-react";
import { motion, useInView } from "framer-motion";

const HIGHLIGHTS = [
  { icon: Layers, value: "4", label: "Microservices indépendants", accent: "emerald" },
  { icon: ShieldCheck, value: "4", label: "Rôles utilisateurs", accent: "cyan" },
  { icon: Database, value: "5", label: "Bases de données", accent: "blue" },
  { icon: Workflow, value: "Full", label: "Pipeline CI/CD Docker", accent: "indigo" },
];

const ACCENT_MAP = {
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", icon: "text-emerald-400" },
  cyan:    { bg: "bg-cyan-500/10",    border: "border-cyan-500/20",    text: "text-cyan-400",    icon: "text-cyan-400" },
  blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/20",    text: "text-blue-400",    icon: "text-blue-400" },
  indigo:  { bg: "bg-indigo-500/10",  border: "border-indigo-500/20",  text: "text-indigo-400",  icon: "text-indigo-400" },
};

function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="about" className="relative py-28 bg-white overflow-hidden">
      {/* Decorative dot pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: text content */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium mb-4">
              À propos du projet
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-6">
              Un projet{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-gradient">
                full-stack
              </span>{' '}
              de A à Z
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                EvalIng est une plateforme complète de digitalisation des évaluations de
                formations d'ingénieurs — conçue avec une architecture
                microservices moderne et pensée pour la performance.
              </p>
              <p>
                Le système gère 4 rôles distincts (Administrateur, Enseignant,
                Étudiant, Professionnel), permet la création de questionnaires
                dynamiques, la collecte de réponses et la génération de
                statistiques détaillées.
              </p>
            </div>

            {/* Tech highlights */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {["React 19 + Tailwind", ".NET 9 + EF Core", "Docker + Kafka", "PostgreSQL"].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {item}
                  </div>
                )
              )}
            </div>
          </motion.div>

          {/* Right: stats grid */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="grid grid-cols-2 gap-5">
              {HIGHLIGHTS.map((stat, i) => {
                const a = ACCENT_MAP[stat.accent];
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 24 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                    className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className={`w-12 h-12 rounded-xl ${a.bg} border ${a.border} flex items-center justify-center mx-auto mb-4`}>
                      <stat.icon className={`w-5 h-5 ${a.icon}`} />
                    </div>
                    <div className={`text-2xl font-bold ${a.text} mb-1`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default About;
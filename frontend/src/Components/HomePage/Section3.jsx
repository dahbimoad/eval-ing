import React, { useRef } from "react";
import { TrendingUp, MessageSquare, BarChart3, Shield, Zap, Globe } from "lucide-react";
import { motion, useInView } from "framer-motion";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Suivi des progrès",
    description:
      "Tableaux de bord interactifs pour suivre l'évolution des étudiants avec des indicateurs de performance en temps réel.",
    accent: "emerald",
  },
  {
    icon: MessageSquare,
    title: "Feedback détaillé",
    description:
      "Système de retours personnalisés avec commentaires structurés et suggestions d'amélioration.",
    accent: "cyan",
  },
  {
    icon: BarChart3,
    title: "Rapports d'évaluation",
    description:
      "Génération automatique de rapports complets avec analyses statistiques et visualisations.",
    accent: "blue",
  },
  {
    icon: Shield,
    title: "Sécurité avancée",
    description:
      "Authentification robuste, contrôle d'accès par rôle et protection complète des données.",
    accent: "indigo",
  },
  {
    icon: Zap,
    title: "Performance optimale",
    description:
      "Architecture microservices pour une réactivité maximale et une scalabilité sans limite.",
    accent: "violet",
  },
  {
    icon: Globe,
    title: "Multi-filières",
    description:
      "Gestion de multiples formations et filières avec des questionnaires adaptés à chaque cursus.",
    accent: "pink",
  },
];

const ACCENTS = {
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-400", glow: "group-hover:shadow-emerald-500/10" },
  cyan:    { bg: "bg-cyan-500/10",    border: "border-cyan-500/20",    icon: "text-cyan-400",    glow: "group-hover:shadow-cyan-500/10" },
  blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/20",    icon: "text-blue-400",    glow: "group-hover:shadow-blue-500/10" },
  indigo:  { bg: "bg-indigo-500/10",  border: "border-indigo-500/20",  icon: "text-indigo-400",  glow: "group-hover:shadow-indigo-500/10" },
  violet:  { bg: "bg-violet-500/10",  border: "border-violet-500/20",  icon: "text-violet-400",  glow: "group-hover:shadow-violet-500/10" },
  pink:    { bg: "bg-pink-500/10",    border: "border-pink-500/20",    icon: "text-pink-400",    glow: "group-hover:shadow-pink-500/10" },
};

function Section3() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="fonctionnalites"
      className="relative py-28 bg-slate-950 overflow-hidden"
    >
      {/* Subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            Fonctionnalités
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Tout ce dont vous avez besoin
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Des outils puissants et intuitifs pour moderniser l'évaluation pédagogique.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, i) => {
            const a = ACCENTS[feat.accent];
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`group relative bg-slate-900/60 border border-slate-800 rounded-2xl p-7 hover:bg-slate-900/90 hover:border-slate-700 hover:shadow-2xl ${a.glow} transition-all duration-400 hover:-translate-y-1`}
              >
                <div className={`w-12 h-12 rounded-xl ${a.bg} border ${a.border} flex items-center justify-center mb-5`}>
                  <feat.icon className={`w-5 h-5 ${a.icon}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Section3;

import React, { useRef } from "react";
import { ClipboardList, Users, BarChart3, ArrowRight } from "lucide-react";
import { motion, useInView } from "framer-motion";

const STEPS = [
  {
    num: "01",
    icon: ClipboardList,
    title: "Créer l'évaluation",
    description:
      "Définissez les critères, choisissez un modèle ou créez-en un sur mesure en quelques clics.",
    accent: "emerald",
  },
  {
    num: "02",
    icon: Users,
    title: "Collecter les réponses",
    description:
      "Étudiants, enseignants et professionnels soumettent leurs réponses en toute simplicité.",
    accent: "cyan",
  },
  {
    num: "03",
    icon: BarChart3,
    title: "Analyser les résultats",
    description:
      "Visualisez les performances en temps réel grâce à des tableaux de bord et rapports détaillés.",
    accent: "blue",
  },
];

const ACCENT_MAP = {
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    icon: "text-emerald-400",
    line: "from-emerald-500",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
    icon: "text-cyan-400",
    line: "from-cyan-500",
  },
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
    icon: "text-blue-400",
    line: "from-blue-500",
  },
};

function Section2() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-28 bg-white overflow-hidden">
      {/* Subtle bg pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium mb-4">
            Comment ça marche
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Trois étapes vers l'excellence
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Un processus fluide, de la création d'évaluation jusqu'à l'analyse des résultats.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {STEPS.map((step, i) => {
            const a = ACCENT_MAP[step.accent];
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative group"
              >
                {/* Connector arrow (hidden on last) */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:flex absolute top-12 -right-6 lg:-right-8 z-10 text-slate-300">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}

                <div className="bg-white border border-slate-100 rounded-2xl p-8 h-full hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100 transition-all duration-400 group-hover:-translate-y-1">
                  {/* Number + Icon */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${a.bg} border ${a.border} flex items-center justify-center`}>
                      <step.icon className={`w-6 h-6 ${a.icon}`} />
                    </div>
                    <span className={`text-4xl font-extrabold ${a.text} opacity-30 select-none`}>
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Section2;
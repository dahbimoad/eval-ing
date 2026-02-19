import React from "react";
import { Link } from 'react-router-dom';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const HIGHLIGHTS = [
  "Gestion multi-rôles (Admin, Enseignant, Étudiant, Professionnel)",
  "Questionnaires dynamiques avec scoring automatique",
  "Architecture microservices complète",
  "Tableaux de bord et statistiques en temps réel",
];

function Section1() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden bg-slate-950"
    >
      {/* Background: subtle radial glow */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-blue-600/8 to-transparent rounded-full blur-3xl" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-32 lg:py-40 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Plateforme d'évaluation intelligente
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight"
            >
              Évaluez. Analysez.{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 text-gradient">
                Transformez.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 text-lg text-slate-400 leading-relaxed max-w-xl"
            >
              Une plateforme full-stack conçue pour digitaliser l'évaluation
              des formations d'ingénieurs — de la création de questionnaires
              jusqu'à l'analyse statistique des résultats.
            </motion.p>

            {/* Highlights */}
            <motion.ul
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8 space-y-3"
            >
              {HIGHLIGHTS.map((text) => (
                <li key={text} className="flex items-center gap-3 text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {text}
                </li>
              ))}
            </motion.ul>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                Commencer maintenant
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#fonctionnalites"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-white/5 hover:border-slate-600 transition-all duration-300"
              >
                <Play className="w-4 h-4" />
                Découvrir
              </a>
            </motion.div>
          </div>

          {/* Right: Abstract visual card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-blue-500/20 rounded-3xl blur-2xl" />

              {/* Main card */}
              <div className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 space-y-6">
                {/* Mock dashboard header */}
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-xs text-slate-500 font-mono">eval-ing / dashboard</span>
                </div>

                {/* Tech stack showcase */}
                <div className="space-y-4">
                  {[
                    { label: 'Frontend', tech: 'React 19 + Tailwind CSS', pct: '100%', color: 'from-emerald-500 to-cyan-500' },
                    { label: 'Backend', tech: '.NET 9 Microservices', pct: '100%', color: 'from-cyan-500 to-blue-500' },
                    { label: 'Infrastructure', tech: 'Docker + Kafka + PostgreSQL', pct: '100%', color: 'from-blue-500 to-indigo-500' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                        <span>{item.label}</span>
                        <span className="text-slate-300 font-medium">{item.tech}</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: item.pct }}
                          transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' }}
                          className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Project highlights */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Microservices', value: '4', color: 'text-emerald-400' },
                    { label: 'Rôles', value: '4', color: 'text-cyan-400' },
                    { label: 'APIs REST', value: '20+', color: 'text-blue-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-slate-800/60 rounded-xl p-3 text-center">
                      <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-[11px] text-slate-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 rounded-full border-2 border-slate-600 flex items-start justify-center p-1.5"
        >
          <div className="w-1.5 h-3 rounded-full bg-emerald-400" />
        </motion.div>
      </div>
    </section>
  );
}

export default Section1;
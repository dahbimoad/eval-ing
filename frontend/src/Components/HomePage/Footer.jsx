import React from "react";
import { Mail, Github, Linkedin } from 'lucide-react';

const LINKS = [
  { label: 'Accueil', href: '#home' },
  { label: 'Fonctionnalités', href: '#fonctionnalites' },
  { label: 'À propos', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

const SOCIALS = [
  { Icon: Github, href: 'https://github.com/dahbimoad', label: 'GitHub' },
  { Icon: Linkedin, href: 'https://www.linkedin.com/in/moad-dahbi/', label: 'LinkedIn' },
];

function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#home" className="flex items-center mb-5">
              <img src="/logo-evaling.svg" alt="EvalIng" className="h-9 w-auto" />
            </a>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6">
              Plateforme full-stack de digitalisation
              des évaluations de formations d'ingénieurs.
            </p>
            <div className="flex items-center gap-3">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Navigation</h4>
            <ul className="space-y-2.5">
              {LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <a href="mailto:dahbimoad1@gmail.com" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                  dahbimoad1@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} EvalIng. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-slate-500">Powered by EvalIng</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

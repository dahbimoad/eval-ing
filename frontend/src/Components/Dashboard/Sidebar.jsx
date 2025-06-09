import React, { useState } from "react";
import { Users, ClipboardList, MessageCircle, BarChart3, GraduationCap, Book, LogOut, ChevronRight, FileText } from 'lucide-react';

function Sidebar() {
  const [activeItem, setActiveItem] = useState('');
  const [hoveredItem, setHoveredItem] = useState('');

  const menuItems = [
    { id: 'ens', icon: Users, label: 'Enseignants', href: '/admin/ens' },
    { id: 'etud', icon: GraduationCap, label: 'Étudiants', href: '/admin/etud' },
    { id: 'pro', icon: Users, label: 'Professionnel', href: '/admin/pro' },
    { id: 'modules', icon: Book, label: 'Modules', href: '/admin/modules' },
    { id: 'formations', icon: GraduationCap, label: 'Filières', href: '/admin/formations' },
    { id: 'questionnaire', icon: ClipboardList, label: 'Questionnaire', href: '/admin/questionnaire' },
    { id: 'publications', icon: FileText, label: 'Publications', href: '/admin/publications' },
    { id: 'statistics', icon: BarChart3, label: 'Statistiques', href: '/admin/statistics' }
  ];

  return (
    <div className="flex h-screen">
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900 text-white w-80 flex flex-col shadow-2xl">
        {/* Overlay pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="p-8 border-b border-white/10">
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                EvalPro
              </h1>
              <p className="text-slate-300 text-sm mt-1">Tableau de bord Admin</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                const isHovered = hoveredItem === item.id;
                
                return (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      className={`
                        group relative flex items-center px-4 py-4 rounded-xl transition-all duration-300 ease-out
                        ${isActive 
                          ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-300 shadow-lg shadow-yellow-400/20' 
                          : 'hover:bg-white/10 hover:shadow-lg hover:shadow-blue-500/20'
                        }
                      `}
                      onClick={() => setActiveItem(item.id)}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem('')}
                    >
                      {/* Background glow */}
                      <div className={`
                        absolute inset-0 rounded-xl transition-opacity duration-300
                        ${isActive ? 'bg-gradient-to-r from-yellow-400/10 to-orange-400/10' : 'opacity-0'}
                      `}></div>
                      
                      {/* Icon */}
                      <div className={`
                        relative z-10 flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300
                        ${isActive 
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 shadow-lg shadow-yellow-400/30' 
                          : 'bg-white/10 text-slate-300 group-hover:bg-white/20 group-hover:text-white'
                        }
                      `}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      {/* Text */}
                      <span className={`
                        relative z-10 ml-4 font-semibold text-base transition-all duration-300
                        ${isActive ? 'text-yellow-300' : 'text-slate-200 group-hover:text-white'}
                      `}>
                        {item.label}
                      </span>
                      
                      {/* Arrow indicator */}
                      <div className={`
                        relative z-10 ml-auto transition-all duration-300 transform
                        ${isActive ? 'text-yellow-300 translate-x-0' : 'text-slate-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}
                      `}>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-r-full shadow-lg shadow-yellow-400/50"></div>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <a href="/login">
              <button
                className="
                  group relative w-full flex items-center justify-center px-6 py-4 
                  bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700
                  text-white font-semibold rounded-xl transition-all duration-300 
                  shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:shadow-xl
                  transform hover:-translate-y-1 active:translate-y-0
                  overflow-hidden
                "
                onMouseEnter={() => setHoveredItem('logout')}
                onMouseLeave={() => setHoveredItem('')}
              >
                {/* Background animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-700/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                
                <LogOut className="relative z-10 mr-3 w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10">Se déconnecter</span>
              </button>
            </a>
            
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
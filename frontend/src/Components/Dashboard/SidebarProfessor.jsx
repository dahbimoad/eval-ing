import React, { useState } from "react";
import { FaClipboardList, FaChartBar, FaSignOutAlt, FaHome } from "react-icons/fa";
import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

function SidebarProfessor() {
    const location = useLocation();
    const [hoveredItem, setHoveredItem] = useState('');

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

    const menuItems = [
        { icon: FaClipboardList, label: "Mes questionnaires", path: "/enseignant/dashboard", id: "questionnaires", color: "text-blue-400" }
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
                    <div className="p-8 border-b border-white/10">
                        <div className="flex items-center justify-center mb-4">
                            <img src="/logo-evaling.svg" alt="EvalIng Logo" className="h-12 w-auto" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                                Espace Enseignant
                            </h1>
                            <p className="text-slate-300 text-sm mt-1">Tableau de bord</p>
                        </div>
                    </div>

                    <nav className="flex-1 p-6">
                        <ul className="space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActiveItem = isActive(item.path);
                                return (
                                    <li key={item.id}>
                                        <Link
                                            to={item.path}
                                            className={`group relative flex items-center px-4 py-4 rounded-xl transition-all duration-300
                                            ${isActiveItem 
                                                ? 'bg-gradient-to-r from-blue-400/20 to-blue-600/20 text-blue-300 shadow-lg' 
                                                : 'hover:bg-white/10 hover:shadow-lg'}
                                            `}
                                            onMouseEnter={() => setHoveredItem(item.id)}
                                            onMouseLeave={() => setHoveredItem('')}
                                        >
                                            <div className={`
                                                relative z-10 flex items-center justify-center w-10 h-10 rounded-lg
                                                ${isActiveItem
                                                    ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-slate-900'
                                                    : 'bg-white/10 text-slate-300'}
                                            `}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className={`ml-4 text-base font-semibold ${isActiveItem ? 'text-blue-300' : 'text-slate-200'}`}>
                                                {item.label}
                                            </span>
                                            <div className={`ml-auto transform ${isActiveItem ? 'text-blue-300 translate-x-0' : 'text-slate-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}>
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                            {isActiveItem && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-r-full shadow-lg"></div>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="p-6 border-t border-white/10">
                        <Link to="/login">
                            <button
                                className="group w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:from-red-600 hover:to-red-700 hover:shadow-xl"
                            >
                                <FaSignOutAlt className="mr-3 w-5 h-5" />
                                Se déconnecter
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SidebarProfessor;

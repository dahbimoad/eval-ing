import React from "react";
import { FaUsers, FaClipboardList, FaComments, FaChartBar, FaFileAlt, FaHome, FaSignOutAlt } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import logo from "../images/HomePage/Eval.png";

function Sidebar() {
    const location = useLocation();
    
    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const menuItems = [
        { icon: FaHome, label: "Tableau de bord", path: "/admin", color: "text-yellow-400" },
        { icon: FaUsers, label: "Enseignants", path: "/admin/ens", color: "text-yellow-400" },
        { icon: FaUsers, label: "Étudiants", path: "/admin/etud", color: "text-yellow-400" },
        { icon: FaUsers, label: "Professionnels", path: "/admin/pro", color: "text-yellow-400" },
        { icon: FaClipboardList, label: "Questionnaires", path: "/admin/questionnaire", color: "text-yellow-400" },
        { icon: FaFileAlt, label: "Publications", path: "/admin/publications", color: "text-yellow-400" },
        { icon: FaChartBar, label: "Statistiques", path: "/admin/statistics", color: "text-yellow-400" },
    ];

    return (
        <div className="flex h-screen">
            <div className="bg-gradient-to-b from-blue-700 to-blue-900 text-white w-64 p-8 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-center mb-10">
                        <img src={logo} alt="Logo" className="w-48 h-auto text-center" />
                    </div>

                    <nav>
                        <ul className="space-y-4 text-lg font-bold" style={{ fontFamily: "Sofia, sans-serif" }}>
                            {menuItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <li key={index}>
                                        <Link
                                            to={item.path}
                                            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                                                isActive(item.path)
                                                    ? 'bg-white/20 shadow-lg'
                                                    : 'hover:bg-white/10'
                                            }`}
                                        >
                                            <Icon className={item.color} size={20} />
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>

                <Link to="/login">
                    <button className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-300 w-full flex items-center justify-center space-x-2 transition-colors">
                        <FaSignOutAlt />
                        <span>Se déconnecter</span>
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default Sidebar;
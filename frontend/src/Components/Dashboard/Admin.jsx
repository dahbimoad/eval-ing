import React from "react";
import { Link } from "react-router-dom";
import { FaUsers, FaChalkboardTeacher, FaBriefcase, FaChartBar, FaClipboardList, FaFileAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";

function Admin() {
    const dashboardCards = [
        {
            title: "Gestion des Questionnaires",
            description: "Créer et gérer les templates de questionnaires",
            icon: <FaClipboardList size={40} />,
            link: "/admin/questionnaire",
            color: "bg-yellow-500",
            stats: "Créer, éditer et publier"
        },
        {
            title: "Publications",
            description: "Voir les questionnaires publiés et les réponses",
            icon: <FaFileAlt size={40} />,
            link: "/admin/publications",
            color: "bg-green-500",
            stats: "Consulter les soumissions"
        },
        {
            title: "Étudiants",
            description: "Gérer les comptes étudiants",
            icon: <FaUsers size={40} />,
            link: "/admin/etud",
            color: "bg-blue-500",
            stats: "Gestion des utilisateurs"
        },
        {
            title: "Enseignants",
            description: "Gérer les comptes enseignants",
            icon: <FaChalkboardTeacher size={40} />,
            link: "/admin/ens",
            color: "bg-purple-500",
            stats: "Gestion des professeurs"
        },
        {
            title: "Professionnels",
            description: "Gérer les comptes professionnels",
            icon: <FaBriefcase size={40} />,
            link: "/admin/pro",
            color: "bg-indigo-500",
            stats: "Gestion des intervenants"
        },
        {
            title: "Statistiques",
            description: "Analyser les résultats des évaluations",
            icon: <FaChartBar size={40} />,
            link: "/admin/statistics",
            color: "bg-red-500",
            stats: "Tableaux de bord et rapports"
        }
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar />
            <div className="flex-1 p-6 overflow-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Tableau de bord administrateur
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Bienvenue dans votre espace d'administration
                    </p>
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboardCards.map((card, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link to={card.link}>
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 h-full">
                                    <div className={`${card.color} text-white p-4 rounded-lg inline-block mb-4`}>
                                        {card.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        {card.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        {card.description}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500">
                                        {card.stats}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Stats */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        Aperçu rapide
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-blue-600">0</p>
                            <p className="text-gray-600 dark:text-gray-400">Questionnaires actifs</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-green-600">0</p>
                            <p className="text-gray-600 dark:text-gray-400">Réponses cette semaine</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-purple-600">0</p>
                            <p className="text-gray-600 dark:text-gray-400">Utilisateurs actifs</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-yellow-600">0</p>
                            <p className="text-gray-600 dark:text-gray-400">Templates créés</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Admin;
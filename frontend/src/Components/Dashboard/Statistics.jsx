// frontend/src/Components/Dashboard/Statistics.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { FaChartBar, FaUsers, FaClipboardList, FaPercentage } from 'react-icons/fa';
import { statisticsService } from '../../services/statisticsApi';
import StatsCard from './StatisticsComponents/StatsCard';
import FormationStats from './StatisticsComponents/FormationStats';
import QuestionnaireDetails from './StatisticsComponents/QuestionnaireDetails';

function Statistics() {
    const [overallStats, setOverallStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadOverallStatistics();
    }, []);

    const loadOverallStatistics = async () => {
        try {
            setLoading(true);
            const data = await statisticsService.getOverallStatistics();
            setOverallStats(data);
        } catch (err) {
            setError('Erreur lors du chargement des statistiques');
            console.error('Error loading overall statistics:', err);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to check if all statistics are empty
    const isDataEmpty = () => {
        return !overallStats || 
               (overallStats.totalQuestionnaires === 0 && 
                overallStats.totalSubmissions === 0 && 
                (!overallStats.formationStatistics || overallStats.formationStatistics.length === 0));
    };

    const tabs = [
        { id: 'overview', label: 'Vue d\'ensemble', icon: <FaChartBar /> },
        { id: 'formations', label: 'Formations', icon: <FaUsers /> },
        { id: 'questionnaires', label: 'Questionnaires', icon: <FaClipboardList /> }
    ];

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                <Sidebar />
                <div className="h-full w-full overflow-auto p-6 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des statistiques...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                <Sidebar />
                <div className="h-full w-full overflow-auto p-6 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
                        <button 
                            onClick={loadOverallStatistics}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar />
            <div className="h-full w-full overflow-auto p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            📊 Tableau de Bord des Statistiques
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Analyse des données d'évaluation des formations
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6">
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-8">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                        }`}
                                    >
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {isDataEmpty() ? (
                                /* Enhanced Empty State for Overview */
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-12">
                                    <div className="text-center">
                                        <div className="text-gray-400 text-9xl mb-8">📊</div>
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                            Tableau de Bord Vide
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-xl mb-6 max-w-2xl mx-auto">
                                            Votre système d'évaluation est prêt à fonctionner ! Commencez par publier des questionnaires pour voir apparaître vos premières statistiques.
                                        </p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                                                <div className="text-blue-500 text-4xl mb-3">📝</div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">1. Créer des Questionnaires</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Concevez vos questionnaires d'évaluation des formations</p>
                                            </div>
                                            
                                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                                                <div className="text-green-500 text-4xl mb-3">🚀</div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">2. Publier et Partager</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Diffusez vos questionnaires auprès des participants</p>
                                            </div>
                                            
                                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                                                <div className="text-purple-500 text-4xl mb-3">📈</div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">3. Analyser les Résultats</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Consultez les statistiques et insights détaillés</p>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 max-w-md mx-auto">
                                            <p className="text-sm font-medium">
                                                💡 Une fois les premières réponses collectées, cette page affichera des métriques détaillées sur les performances de vos formations.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <StatsCard
                                            title="Total Questionnaires"
                                            value={overallStats?.totalQuestionnaires || 0}
                                            icon={<FaClipboardList />}
                                            color="blue"
                                        />
                                        <StatsCard
                                            title="Total Soumissions"
                                            value={overallStats?.totalSubmissions || 0}
                                            icon={<FaUsers />}
                                            color="green"
                                        />
                                        <StatsCard
                                            title="Taux de Completion"
                                            value={`${(overallStats?.overallCompletionRate || 0).toFixed(1)}%`}
                                            icon={<FaPercentage />}
                                            color="yellow"
                                        />
                                        <StatsCard
                                            title="Formations Actives"
                                            value={overallStats?.formationStatistics?.length || 0}
                                            icon={<FaChartBar />}
                                            color="purple"
                                        />
                                    </div>

                                    {/* Formation Statistics */}
                                    <FormationStats formationStatistics={overallStats?.formationStatistics} />
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'formations' && (
                        <div className="space-y-6">
                            <FormationStats formationStatistics={overallStats?.formationStatistics} />
                        </div>
                    )}

                    {activeTab === 'questionnaires' && (
                        <div className="space-y-6">
                            <QuestionnaireDetails />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Statistics;
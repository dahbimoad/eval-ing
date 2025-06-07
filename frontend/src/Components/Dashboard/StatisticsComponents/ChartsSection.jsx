import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { FaChartBar, FaUsers, FaPercentage } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartsSection = ({ overallStats }) => {
  if (!overallStats || !overallStats.formationStatistics || overallStats.formationStatistics.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FaChartBar className="mr-2 text-blue-500" />
          Analyses Graphiques
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <p className="text-gray-500 dark:text-gray-400">
            Les graphiques apparaîtront une fois que des données d'évaluation seront disponibles.
          </p>
        </div>
      </div>
    );
  }

  // Prepare data for Formation Performance Chart
  const formationNames = overallStats.formationStatistics.map(f => 
    f.formationCode || f.formationTitle?.substring(0, 20) || 'Formation'
  );
  const formationScores = overallStats.formationStatistics.map(f => f.averageRating);
  const formationSubmissions = overallStats.formationStatistics.map(f => f.submissionCount);

  // Performance Bar Chart
  const performanceChartData = {
    labels: formationNames,
    datasets: [
      {
        label: 'Note Moyenne (/5)',
        data: formationScores,
        backgroundColor: formationScores.map(score => {
          if (score >= 4.0) return 'rgba(34, 197, 94, 0.8)'; // Green
          if (score >= 3.0) return 'rgba(59, 130, 246, 0.8)'; // Blue
          if (score >= 2.0) return 'rgba(251, 191, 36, 0.8)'; // Yellow
          return 'rgba(239, 68, 68, 0.8)'; // Red
        }),
        borderColor: formationScores.map(score => {
          if (score >= 4.0) return 'rgba(34, 197, 94, 1)';
          if (score >= 3.0) return 'rgba(59, 130, 246, 1)';
          if (score >= 2.0) return 'rgba(251, 191, 36, 1)';
          return 'rgba(239, 68, 68, 1)';
        }),
        borderWidth: 2,
        borderRadius: 4,
      }
    ],
  };

  const performanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const formation = overallStats.formationStatistics[context.dataIndex];
            return [
              `Note: ${context.parsed.y.toFixed(1)}/5`,
              `Participants: ${formation.submissionCount}`,
              `Formation: ${formation.formationTitle || formation.formationCode}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 0.5,
        },
        title: {
          display: true,
          text: 'Note Moyenne',
        }
      },
      x: {
        title: {
          display: true,
          text: 'Formations',
        }
      }
    },
  };

  // Performance Categories Distribution
  const performanceCategories = {
    excellent: overallStats.formationStatistics.filter(f => f.averageRating >= 4.1).length,
    good: overallStats.formationStatistics.filter(f => f.averageRating >= 3.1 && f.averageRating < 4.1).length,
    average: overallStats.formationStatistics.filter(f => f.averageRating >= 2.1 && f.averageRating < 3.1).length,
    poor: overallStats.formationStatistics.filter(f => f.averageRating >= 1.1 && f.averageRating < 2.1).length,
    veryPoor: overallStats.formationStatistics.filter(f => f.averageRating < 1.1).length,
  };

  const categoriesChartData = {
    labels: ['Excellent (4.1-5.0)', 'Bon (3.1-4.0)', 'Moyen (2.1-3.0)', 'Faible (1.1-2.0)', 'Très Faible (0-1.0)'],
    datasets: [
      {
        label: 'Nombre de Formations',
        data: [
          performanceCategories.excellent,
          performanceCategories.good,
          performanceCategories.average,
          performanceCategories.poor,
          performanceCategories.veryPoor
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Green - Excellent
          'rgba(59, 130, 246, 0.8)',   // Blue - Good  
          'rgba(251, 191, 36, 0.8)',   // Yellow - Average
          'rgba(251, 146, 60, 0.8)',   // Orange - Poor
          'rgba(239, 68, 68, 0.8)',    // Red - Very Poor
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      }
    ],
  };

  const categoriesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = overallStats.formationStatistics.length;
            const percentage = total > 0 ? ((context.parsed.y / total) * 100).toFixed(1) : 0;
            return [
              `Formations: ${context.parsed.y}`,
              `Pourcentage: ${percentage}%`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Nombre de Formations',
        }
      },
      x: {
        title: {
          display: true,
          text: 'Catégories de Performance',
        }
      }
    },
  };

  // Completion Rate Donut Chart
  const completionRate = overallStats.overallCompletionRate || 0;
  const incompletionRate = 100 - completionRate;

  const donutChartData = {
    labels: ['Complétées', 'Non complétées'],
    datasets: [
      {
        data: [completionRate, incompletionRate],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(156, 163, 175, 0.3)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderWidth: 2,
      }
    ],
  };

  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.toFixed(1)}%`;
          }
        }
      }
    },
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <FaChartBar className="mr-2 text-blue-500" />
          Analyses Graphiques des Performances
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                <FaChartBar className="mr-2 text-green-500" />
                Performance par Formation
              </h4>
              <div className="h-64">
                <Bar data={performanceChartData} options={performanceChartOptions} />
              </div>
            </div>
          </div>

          {/* Completion Rate Donut */}
          <div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                <FaPercentage className="mr-2 text-yellow-500" />
                Taux de Completion Global
              </h4>
              <div className="h-64">
                <Doughnut data={donutChartData} options={donutChartOptions} />
              </div>
              <div className="text-center mt-4">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completionRate.toFixed(1)}%
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Évaluations complétées
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Categories Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FaChartBar className="mr-2 text-purple-500" />
          Répartition des Performances
        </h4>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="h-64">
            <Bar data={categoriesChartData} options={categoriesChartOptions} />
          </div>
        </div>
        
        {/* Performance Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {performanceCategories.excellent}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Excellent
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {performanceCategories.good}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Bon
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {performanceCategories.average}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">
              Moyen
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {performanceCategories.poor}
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-400">
              Faible
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {performanceCategories.veryPoor}
            </div>
            <div className="text-sm text-red-600 dark:text-red-400">
              Très Faible
            </div>
          </div>
        </div>
        
        {/* Quality Insights */}
        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <h5 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">📊 Insights Qualité</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-indigo-700 dark:text-indigo-300">Formations de qualité (≥3.1/5): </span>
              <span className="font-bold text-indigo-900 dark:text-indigo-100">
                {performanceCategories.excellent + performanceCategories.good} / {overallStats.formationStatistics.length}
              </span>
            </div>
            <div>
              <span className="text-indigo-700 dark:text-indigo-300">Nécessitent amélioration (≤3.0/5): </span>
              <span className="font-bold text-indigo-900 dark:text-indigo-100">
                {performanceCategories.average + performanceCategories.poor + performanceCategories.veryPoor} / {overallStats.formationStatistics.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection; 
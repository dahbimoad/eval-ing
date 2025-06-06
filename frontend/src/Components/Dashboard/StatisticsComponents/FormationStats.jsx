import React from 'react';
import { FaGraduationCap, FaChartLine } from 'react-icons/fa';

const FormationStats = ({ formationStatistics }) => {
  if (!formationStatistics || formationStatistics.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <FaGraduationCap className="mr-2 text-blue-500" />
          Statistiques par Formation
        </h3>
        <div className="text-center py-16">
          <div className="text-gray-400 text-8xl mb-6">🎓</div>
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Aucune donnée de formation disponible
          </h4>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            Aucune formation avec des évaluations n'a été trouvée dans la base de données.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Publiez des questionnaires d'évaluation et collectez des réponses pour voir les statistiques par formation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <FaGraduationCap className="mr-2 text-blue-500" />
        Statistiques par Formation
        <span className="ml-3 text-sm bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 px-3 py-1 rounded-full">
          {formationStatistics.length} {formationStatistics.length <= 1 ? 'formation' : 'formations'}
        </span>
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Code Formation
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Titre
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Soumissions
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Note Moyenne
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {formationStatistics.map((formation, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {formation.formationCode}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {formation.formationTitle}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {formation.submissionCount}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    formation.averageRating >= 4 
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : formation.averageRating >= 3
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                  }`}>
                    {formation.averageRating.toFixed(1)}/5
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FormationStats; 
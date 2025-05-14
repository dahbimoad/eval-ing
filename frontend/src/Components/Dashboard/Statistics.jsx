import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { FaChartBar, FaUserGraduate, FaChalkboardTeacher, FaBuilding } from "react-icons/fa";

// Mock data for statistics
const mockStats = {
  summary: {
    totalStudents: 350,
    totalTeachers: 45,
    totalProfessionals: 28,
    completedEvaluations: 892,
  },
  studentsByMajor: [
    { major: "GINF", count: 85 },
    { major: "GIL", count: 75 },
    { major: "GSEA", count: 60 },
    { major: "G2I", count: 55 },
    { major: "Cyber", count: 45 },
    { major: "GSR", count: 30 },
  ],
  evaluationsByMonth: [
    { month: "Janvier", count: 68 },
    { month: "Février", count: 74 },
    { month: "Mars", count: 92 },
    { month: "Avril", count: 85 },
    { month: "Mai", count: 110 },
    { month: "Juin", count: 45 },
    { month: "Juillet", count: 12 },
    { month: "Août", count: 5 },
    { month: "Septembre", count: 78 },
    { month: "Octobre", count: 95 },
    { month: "Novembre", count: 88 },
    { month: "Décembre", count: 62 },
  ],
  averageRatings: [
    { category: "Qualité des cours", rating: 4.2 },
    { category: "Clarté des explications", rating: 3.8 },
    { category: "Disponibilité des enseignants", rating: 4.5 },
    { category: "Pertinence des évaluations", rating: 4.0 },
    { category: "Adéquation avec les besoins professionnels", rating: 3.7 },
  ]
};

function Statistics() {
  const [activeTab, setActiveTab] = useState("summary");
  
  const renderBarChart = (data, nameKey, valueKey, maxValue) => {
    return (
      <div className="space-y-4 mt-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{item[nameKey]}</span>
              <span className="text-sm font-medium">{item[valueKey]}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${(item[valueKey] / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderContent = () => {
    switch(activeTab) {
      case "summary":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 rounded-lg shadow-md text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Nombre total d'étudiants</p>
                  <h3 className="text-3xl font-bold mt-1">{mockStats.summary.totalStudents}</h3>
                </div>
                <FaUserGraduate className="text-4xl opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 p-6 rounded-lg shadow-md text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Nombre total d'enseignants</p>
                  <h3 className="text-3xl font-bold mt-1">{mockStats.summary.totalTeachers}</h3>
                </div>
                <FaChalkboardTeacher className="text-4xl opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-700 p-6 rounded-lg shadow-md text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Nombre total de professionnels</p>
                  <h3 className="text-3xl font-bold mt-1">{mockStats.summary.totalProfessionals}</h3>
                </div>
                <FaBuilding className="text-4xl opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-6 rounded-lg shadow-md text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Évaluations complétées</p>
                  <h3 className="text-3xl font-bold mt-1">{mockStats.summary.completedEvaluations}</h3>
                </div>
                <FaChartBar className="text-4xl opacity-80" />
              </div>
            </div>
          </div>
        );
      
      case "students":
        const maxStudents = Math.max(...mockStats.studentsByMajor.map(s => s.count));
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Distribution des étudiants par filière</h3>
            {renderBarChart(mockStats.studentsByMajor, "major", "count", maxStudents)}
          </div>
        );
      
      case "evaluations":
        const maxEvals = Math.max(...mockStats.evaluationsByMonth.map(e => e.count));
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Nombre d'évaluations par mois</h3>
            {renderBarChart(mockStats.evaluationsByMonth, "month", "count", maxEvals)}
          </div>
        );
      
      case "ratings":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Évaluations moyennes par catégorie</h3>
            <div className="space-y-4 mt-4">
              {mockStats.averageRatings.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-sm font-medium">{item.rating.toFixed(1)}/5.0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-yellow-400 h-2.5 rounded-full" 
                      style={{ width: `${(item.rating / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="h-full w-full overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              <span className="text-yellow-500">Tableau de bord</span> des statistiques
            </h1>
            <p className="text-gray-600">
              Consultez les statistiques détaillées de l'évaluation des formations
            </p>
          </div>
          
          {/* Navigation */}
          <div className="flex space-x-1 rounded-xl bg-gray-200 p-1 mb-8">
            <button
              className={`w-full rounded-lg py-2.5 text-sm font-medium ${
                activeTab === "summary" 
                  ? "bg-white text-blue-700 shadow" 
                  : "text-gray-700 hover:bg-white/50"
              }`}
              onClick={() => setActiveTab("summary")}
            >
              Résumé
            </button>
            <button
              className={`w-full rounded-lg py-2.5 text-sm font-medium ${
                activeTab === "students" 
                  ? "bg-white text-blue-700 shadow" 
                  : "text-gray-700 hover:bg-white/50"
              }`}
              onClick={() => setActiveTab("students")}
            >
              Étudiants
            </button>
            <button
              className={`w-full rounded-lg py-2.5 text-sm font-medium ${
                activeTab === "evaluations" 
                  ? "bg-white text-blue-700 shadow" 
                  : "text-gray-700 hover:bg-white/50"
              }`}
              onClick={() => setActiveTab("evaluations")}
            >
              Évaluations
            </button>
            <button
              className={`w-full rounded-lg py-2.5 text-sm font-medium ${
                activeTab === "ratings" 
                  ? "bg-white text-blue-700 shadow" 
                  : "text-gray-700 hover:bg-white/50"
              }`}
              onClick={() => setActiveTab("ratings")}
            >
              Notes
            </button>
          </div>
          
          {/* Content */}
          {renderContent()}
          
          {/* Note about mock data */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Ces données sont des exemples pour la visualisation. Elles seront remplacées par des données réelles provenant de l'API backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics; 
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FaEye, FaDownload, FaCalendar, FaUsers, FaChartBar } from "react-icons/fa";
import { motion } from "framer-motion";

import Sidebar from "./Sidebar";
import { publicationService } from "../../services/publicationService";
import { useTemplates } from "../../hooks/useTemplates";

export default function QuestionnairePublications() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  
  const { templates, loadTemplates } = useTemplates();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await loadTemplates();
      const response = await publicationService.getAll();
      
      // Handle different response structures
      let publicationsData = [];
      if (Array.isArray(response.data)) {
        publicationsData = response.data;
      } else if (response.data && Array.isArray(response.data.items)) {
        publicationsData = response.data.items;
      } else if (response.data && Array.isArray(response.data.publications)) {
        publicationsData = response.data.publications;
      } else if (response.data && typeof response.data === 'object') {
        // If it's an object but not an array, try to extract array from common property names
        const possibleArrayProps = ['value', 'result', 'data', 'list'];
        for (const prop of possibleArrayProps) {
          if (Array.isArray(response.data[prop])) {
            publicationsData = response.data[prop];
            break;
          }
        }
      }
      
      console.log('🔧 Publications data received:', publicationsData); // Debug log
      console.log('🔧 First publication sample:', publicationsData[0]); // Debug log
      setPublications(publicationsData);
    } catch (error) {
      console.error('Error loading publications:', error);
      toast.error("Erreur lors du chargement des publications");
      setPublications([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (publicationId) => {
    setLoadingSubmissions(true);
    try {
      const response = await publicationService.getSubmissions(publicationId);
      
      // Handle different response structures for submissions
      let submissionsData = [];
      if (Array.isArray(response.data)) {
        submissionsData = response.data;
      } else if (response.data && Array.isArray(response.data.items)) {
        submissionsData = response.data.items;
      } else if (response.data && Array.isArray(response.data.submissions)) {
        submissionsData = response.data.submissions;
      }
      
      setSubmissions(submissionsData);
      setSelectedPublication(publicationId);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error("Erreur lors du chargement des soumissions");
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const getTemplateInfo = (templateCode) => {
    return templates.find(t => t.templateCode === templateCode);
  };

  const getStatusColor = (publication) => {
    const now = new Date();
    const start = new Date(publication.startAt);
    const end = new Date(publication.endAt);
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return "bg-red-100 text-red-800"; // Invalid dates
    }
    
    if (now < start) return "bg-yellow-100 text-yellow-800";
    if (now > end) return "bg-gray-100 text-gray-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (publication) => {
    const now = new Date();
    const start = new Date(publication.startAt);
    const end = new Date(publication.endAt);
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return "Dates invalides";
    }
    
    if (now < start) return "À venir";
    if (now > end) return "Terminé";
    return "En cours";
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return "Date invalide";
    }
    return date.toLocaleDateString();
  };

  const exportSubmissions = async (publicationId) => {
    try {
      // This would typically trigger a download
      toast.success("Export des soumissions en cours...");
    } catch (error) {
      toast.error("Erreur lors de l'export");
    }
  };

  // Ensure publications is always an array
  const publicationsList = Array.isArray(publications) ? publications : [];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">
        <ToastContainer />

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Publications des Questionnaires
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les questionnaires publiés et consultez les réponses
          </p>
        </div>

        {/* Publications List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : publicationsList.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Aucune publication active pour le moment.
            </p>
            <Link
              to="/admin/questionnaire"
              className="text-yellow-500 hover:text-yellow-600 mt-4 inline-block"
            >
              Créer et publier un questionnaire
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {publicationsList.map((pub) => {
              const template = getTemplateInfo(pub.templateCode);
              return (
                <motion.div
                  key={pub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {pub.title || template?.title || "Template inconnu"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Code: {pub.templateCode || "N/A"}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(pub)}`}>
                      {getStatusText(pub)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FaCalendar />
                      <span>
                        Du {formatDate(pub.startAt)} au {formatDate(pub.endAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FaUsers />
                      <span>{pub.submissionCount || 0} réponses</span>
                    </div>
                    {pub.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        {pub.description}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => loadSubmissions(pub.id)}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <FaEye /> Voir les réponses
                    </button>
                    <Link
                      to={`/admin/statistics?publicationId=${pub.id}`}
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <FaChartBar /> Statistiques
                    </Link>
                    <button
                      onClick={() => exportSubmissions(pub.id)}
                      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      title="Exporter"
                    >
                      <FaDownload />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Submissions Modal */}
        {selectedPublication && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Soumissions</h2>
                <button
                  onClick={() => setSelectedPublication(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {loadingSubmissions ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                </div>
              ) : submissions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Aucune soumission pour cette publication.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Utilisateur</th>
                        <th className="text-left p-2">Rôle</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Score</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub) => (
                        <tr key={sub.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="p-2">{sub.userName || "Anonyme"}</td>
                          <td className="p-2">{sub.userRole}</td>
                          <td className="p-2">{new Date(sub.submittedAt).toLocaleString()}</td>
                          <td className="p-2">{sub.score ? `${sub.score}%` : "-"}</td>
                          <td className="p-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              Détails
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
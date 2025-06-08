import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { 
  FaChartBar, FaCalendar, FaUsers, FaSearch, 
  FaClock, FaCheckCircle, FaTimesCircle, FaEdit,
  FaExternalLinkAlt, FaSortUp, FaSortDown, FaSort, FaSyncAlt
} from "react-icons/fa";
import { motion } from "framer-motion";

import Sidebar from "./Sidebar";
import { publicationService } from "../../services/publicationService";
import { useTemplates } from "../../hooks/useTemplates";
import { statisticsService } from "../../services/statisticsApi";

export default function QuestionnairePublications() {
  const navigate = useNavigate();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("startAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dateFilter, setDateFilter] = useState("all");

  
  const { templates, loadTemplates } = useTemplates();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await loadTemplates();
      await loadPublications();
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const loadPublications = async () => {
    try {
      const response = await publicationService.getAll();
      
      // Handle different response structures
      let publicationsData = [];
      if (Array.isArray(response.data)) {
        publicationsData = response.data;
      } else if (response.data && Array.isArray(response.data.items)) {
        publicationsData = response.data.items;
      } else if (response.data && Array.isArray(response.data.publications)) {
        publicationsData = response.data.publications;
      }
      
      // Enrich publications with submission counts
      const enrichedPublications = await Promise.all(
        publicationsData.map(async (pub) => {
          try {
            const submissionsResponse = await publicationService.getSubmissions(pub.id);
            const submissionsCount = Array.isArray(submissionsResponse.data) 
              ? submissionsResponse.data.length 
              : 0;
            return { ...pub, submissionCount: submissionsCount };
          } catch (error) {
            console.warn(`Failed to load submissions for publication ${pub.id}:`, error);
            return { ...pub, submissionCount: 0 };
          }
        })
      );
      
      setPublications(enrichedPublications);
    } catch (error) {
      console.error('Error loading publications:', error);
      setPublications([]);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await loadPublications();
      toast.success("Données actualisées");
    } catch (error) {
      toast.error("Erreur lors de l'actualisation");
    } finally {
      setRefreshing(false);
    }
  };

  const getTemplateInfo = (templateCode) => {
    return templates.find(t => t.templateCode === templateCode);
  };

  const getStatusInfo = (publication) => {
    const now = new Date();
    const start = new Date(publication.startAt);
    const end = new Date(publication.endAt);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { 
        status: "invalid", 
        text: "Dates invalides", 
        color: "bg-red-100 text-red-800",
        icon: <FaTimesCircle />
      };
    }
    
    if (now < start) {
      return { 
        status: "upcoming", 
        text: "À venir", 
        color: "bg-yellow-100 text-yellow-800",
        icon: <FaClock />
      };
    }
    if (now > end) {
      return { 
        status: "completed", 
        text: "Terminé", 
        color: "bg-gray-100 text-gray-800",
        icon: <FaCheckCircle />
      };
    }
    return { 
      status: "active", 
      text: "En cours", 
      color: "bg-green-100 text-green-800",
      icon: <FaCheckCircle />
    };
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Date invalide";
    return date.toLocaleDateString("fr-FR", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort className="opacity-50" />;
    return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };



  const navigateToStatistics = (publicationId, templateCode) => {
    // Navigate to statistics with specific publication filter
    navigate(`/admin/statistics?tab=questionnaires&publicationId=${publicationId}&templateCode=${templateCode}`);
  };



  // Filter and sort publications
  const filteredAndSortedPublications = publications
    .filter(pub => {
      const template = getTemplateInfo(pub.templateCode);
      const title = pub.title || template?.title || "";
      const code = pub.templateCode || "";
      
      // Text search
      const matchesSearch = !searchTerm || 
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const statusInfo = getStatusInfo(pub);
      const matchesStatus = statusFilter === "all" || statusInfo.status === statusFilter;
      
      // Date filter
      let matchesDate = true;
      if (dateFilter !== "all") {
        const now = new Date();
        const start = new Date(pub.startAt);
        const end = new Date(pub.endAt);
        
        switch (dateFilter) {
          case "this_week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = start >= weekAgo || end >= weekAgo;
            break;
          case "this_month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = start >= monthAgo || end >= monthAgo;
            break;
          case "expired":
            matchesDate = end < now;
            break;
          default:
            matchesDate = true;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'title':
          const aTemplate = getTemplateInfo(a.templateCode);
          const bTemplate = getTemplateInfo(b.templateCode);
          aVal = (a.title || aTemplate?.title || "").toLowerCase();
          bVal = (b.title || bTemplate?.title || "").toLowerCase();
          break;
        case 'startAt':
        case 'endAt':
          aVal = new Date(a[sortBy]);
          bVal = new Date(b[sortBy]);
          break;
        case 'submissions':
          aVal = a.submissionCount || 0;
          bVal = b.submissionCount || 0;
          break;
        case 'status':
          aVal = getStatusInfo(a).status;
          bVal = getStatusInfo(b).status;
          break;
        default:
          aVal = a[sortBy];
          bVal = b[sortBy];
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const publicationStats = {
    total: publications.length,
    active: publications.filter(p => getStatusInfo(p).status === 'active').length,
    upcoming: publications.filter(p => getStatusInfo(p).status === 'upcoming').length,
    completed: publications.filter(p => getStatusInfo(p).status === 'completed').length,
    totalSubmissions: publications.reduce((sum, p) => sum + (p.submissionCount || 0), 0)
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">
        <ToastContainer />

        {/* Enhanced Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <FaChartBar className="text-blue-600" />
            Publications des Questionnaires
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gérez vos questionnaires publiés et accédez aux analyses détaillées
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
                Actualiser
              </button>
              <Link
                to="/admin/questionnaire"
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
              >
                <FaEdit />
                Créer un questionnaire
              </Link>
              <Link
                to="/admin/statistics"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <FaChartBar />
                Vue d'ensemble des statistiques
                <FaExternalLinkAlt className="text-sm" />
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{publicationStats.total}</p>
                </div>
                <FaChartBar className="text-blue-500 text-xl" />
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Actifs</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{publicationStats.active}</p>
                </div>
                <FaCheckCircle className="text-green-500 text-xl" />
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">À venir</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{publicationStats.upcoming}</p>
                </div>
                <FaClock className="text-yellow-500 text-xl" />
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Terminés</p>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{publicationStats.completed}</p>
                </div>
                <FaTimesCircle className="text-gray-500 text-xl" />
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Réponses</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{publicationStats.totalSubmissions}</p>
                </div>
                <FaUsers className="text-purple-500 text-xl" />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par titre ou code..."
                  className="input pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">En cours</option>
              <option value="upcoming">À venir</option>
              <option value="completed">Terminés</option>
            </select>

            <select
              className="input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">Toutes les dates</option>
              <option value="this_week">Cette semaine</option>
              <option value="this_month">Ce mois</option>
              <option value="expired">Expirés</option>
            </select>
          </div>


        </div>

        {/* Publications List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            <p className="ml-4 text-gray-600 dark:text-gray-400">Chargement des publications...</p>
          </div>
        ) : filteredAndSortedPublications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow text-center">
            {publications.length === 0 ? (
              <>
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Aucune publication pour le moment
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Commencez par créer et publier votre premier questionnaire d'évaluation.
            </p>
            <Link
              to="/admin/questionnaire"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                >
                  <FaEdit />
                  Créer un questionnaire
                </Link>
              </>
            ) : (
              <>
                <div className="text-gray-400 text-4xl mb-4">🔍</div>
                <p className="text-gray-500 dark:text-gray-400">
                  Aucune publication ne correspond à vos critères de recherche.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setDateFilter("all");
                  }}
                  className="mt-4 text-yellow-500 hover:text-yellow-600"
                >
                  Effacer les filtres
                </button>
              </>
            )}
              </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-end">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredAndSortedPublications.length} publication(s)
                </div>
              </div>
            </div>

            {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('title')}
                        className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        Questionnaire {getSortIcon('title')}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        Statut {getSortIcon('status')}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('startAt')}
                        className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        Période {getSortIcon('startAt')}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('submissions')}
                        className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        Réponses {getSortIcon('submissions')}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                      </tr>
                    </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAndSortedPublications.map((pub) => {
                    const template = getTemplateInfo(pub.templateCode);
                    const statusInfo = getStatusInfo(pub);
                    
                    return (
                      <motion.tr
                        key={pub.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {pub.title || template?.title || "Template inconnu"}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Code: {pub.templateCode || "N/A"}
                            </div>
                            {pub.formationTitle && (
                              <div className="text-xs text-gray-400">
                                Formation: {pub.formationTitle}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusInfo.color}`}>
                            {statusInfo.icon}
                            {statusInfo.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center gap-1 mb-1">
                            <FaCalendar className="text-gray-400 text-xs" />
                            <span>Du {formatDate(pub.startAt)}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            au {formatDate(pub.endAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <FaUsers className="text-gray-400 text-xs" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {pub.submissionCount || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => navigateToStatistics(pub.id, pub.templateCode)}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors flex items-center gap-1"
                            title="Voir les statistiques détaillées"
                          >
                            <FaChartBar />
                            Statistiques
                            </button>
                          </td>
                      </motion.tr>
                    );
                  })}
                    </tbody>
                  </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
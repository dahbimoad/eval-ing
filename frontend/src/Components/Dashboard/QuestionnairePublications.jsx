import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { 
  FaChartBar, FaCalendar, FaUsers, FaSearch, 
  FaClock, FaCheckCircle, FaTimesCircle, FaEdit,
  FaExternalLinkAlt, FaSortUp, FaSortDown, FaSort, FaSyncAlt,
  FaEye, FaRocket, FaChartLine
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

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
        color: "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300",
        icon: <FaTimesCircle />
      };
    }
    
    if (now < start) {
      return { 
        status: "upcoming", 
        text: "À venir", 
        color: "bg-gradient-to-r from-amber-100 to-yellow-200 text-amber-800 border-amber-300",
        icon: <FaClock />
      };
    }
    if (now > end) {
      return { 
        status: "completed", 
        text: "Terminé", 
        color: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300",
        icon: <FaCheckCircle />
      };
    }
    return { 
      status: "active", 
      text: "En cours", 
      color: "bg-gradient-to-r from-emerald-100 to-green-200 text-emerald-800 border-emerald-300",
      icon: <FaRocket />
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
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">
        <ToastContainer />

        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 p-8 rounded-2xl shadow-lg border border-blue-200 dark:border-gray-600 mb-6 backdrop-blur-sm"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
                <FaChartBar className="text-blue-600" />
                Publications des Questionnaires
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Gérez vos questionnaires publiés et accédez aux analyses détaillées
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-700 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-500 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
                Actualiser
              </motion.button>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/admin/questionnaire"
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <FaEdit />
                  Créer un questionnaire
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Link
                    to="/admin/statistics"
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <FaChartLine />
                    Vue d'ensemble des statistiques
                    <FaExternalLinkAlt className="text-sm" />
                  </Link>
              </motion.div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-blue-200 dark:border-blue-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total</p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{publicationStats.total}</p>
                </div>
                <FaChartBar className="text-blue-500 text-2xl" />
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/30 dark:to-green-800/30 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-emerald-200 dark:border-emerald-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Actifs</p>
                  <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{publicationStats.active}</p>
                </div>
                <FaRocket className="text-emerald-500 text-2xl" />
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-800/30 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-amber-200 dark:border-amber-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">À venir</p>
                  <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{publicationStats.upcoming}</p>
                </div>
                <FaClock className="text-amber-500 text-2xl" />
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Terminés</p>
                  <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{publicationStats.completed}</p>
                </div>
                <FaCheckCircle className="text-gray-500 text-2xl" />
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-800/30 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-purple-200 dark:border-purple-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Réponses</p>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{publicationStats.totalSubmissions}</p>
                </div>
                <FaUsers className="text-purple-500 text-2xl" />
              </div>
            </motion.div>
          </div>

          {/* Enhanced Filters and Search */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder="Rechercher par titre ou code..."
                  className="w-full pl-14 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <select
              className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100 shadow-sm transition-all duration-300"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">En cours</option>
              <option value="upcoming">À venir</option>
              <option value="completed">Terminés</option>
            </select>

            <select
              className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100 shadow-sm transition-all duration-300"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">Toutes les dates</option>
              <option value="this_week">Cette semaine</option>
              <option value="this_month">Ce mois</option>
              <option value="expired">Expirés</option>
            </select>
          </div>
        </motion.div>

        {/* Publications List */}
        <AnimatePresence>
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-64"
            >
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <p className="text-lg text-gray-600 dark:text-gray-400">Chargement des publications...</p>
              </div>
            </motion.div>
          ) : filteredAndSortedPublications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-12 rounded-2xl shadow-lg text-center border border-gray-200 dark:border-gray-700"
            >
              {publications.length === 0 ? (
                <>
                  <div className="text-gray-400 text-8xl mb-6">📊</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Aucune publication pour le moment
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
                    Commencez par créer et publier votre premier questionnaire d'évaluation.
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/admin/questionnaire"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl transition-all duration-300 shadow-lg"
                    >
                      <FaEdit />
                      Créer un questionnaire
                    </Link>
                  </motion.div>
                </>
              ) : (
                <>
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Aucune publication ne correspond à vos critères de recherche.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setDateFilter("all");
                    }}
                    className="mt-4 px-6 py-2 text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/30 rounded-lg transition-all duration-300"
                  >
                    Effacer les filtres
                  </motion.button>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              {/* Table Header */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Publications de questionnaires
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                    {filteredAndSortedPublications.length} publication(s)
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('title')}
                          className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                        >
                          Questionnaire {getSortIcon('title')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                        >
                          Statut {getSortIcon('status')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('startAt')}
                          className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                        >
                          Période {getSortIcon('startAt')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('submissions')}
                          className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                        >
                          Réponses {getSortIcon('submissions')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredAndSortedPublications.map((pub, index) => {
                      const template = getTemplateInfo(pub.templateCode);
                      const statusInfo = getStatusInfo(pub);
                      
                      return (
                        <motion.tr
                          key={pub.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300"
                        >
                          <td className="px-6 py-5">
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                {pub.title || template?.title || "Template inconnu"}
                              </div>
                              <div className="text-sm text-blue-600 dark:text-blue-400">
                                Code: {pub.templateCode || "N/A"}
                              </div>
                              {pub.formationTitle && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Formation: {pub.formationTitle}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-full border ${statusInfo.color}`}>
                              {statusInfo.icon}
                              {statusInfo.text}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-900 dark:text-white">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <FaCalendar className="text-gray-400 text-xs" />
                                <span className="font-medium">Du {formatDate(pub.startAt)}</span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 ml-5">
                                au {formatDate(pub.endAt)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <FaUsers className="text-blue-500 text-sm" />
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {pub.submissionCount || 0}
                              </span>
                              <span className="text-xs text-gray-500">réponses</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => navigateToStatistics(pub.id, pub.templateCode)}
                              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-sm rounded-lg transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
                              title="Voir les statistiques détaillées"
                            >
                              <FaEye />
                              Statistiques
                            </motion.button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 
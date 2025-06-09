import React, { useEffect, useState } from "react";
import { useProfessorQuestionnaires } from "../../hooks/useProfessorQuestionnaires";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  FaClipboardList, 
  FaCheck, 
  FaQuestionCircle,
  FaSpinner,
  FaExclamationCircle,
  FaChartBar,
  FaCalendarAlt,
  FaFileAlt,
  FaTasks
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { BookOpen, Send, Users, TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react";
import SidebarProfessor from "./SidebarProfessor";

export default function ProfessorDashboard() {
  const { questionnaires, loading } = useProfessorQuestionnaires();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    // Show success message if redirected after submission
    if (searchParams.get('submitted') === 'true') {
      toast.success("Questionnaire soumis avec succès ! 🎉", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toast.info("Bienvenue dans votre espace professeur 👋", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [searchParams]);

  // Filter questionnaires based on search and status
  const filteredQuestionnaires = questionnaires.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase());
    // You can add status filtering logic here based on your backend data
    return matchesSearch;
  });

  const getQuestionnaireStats = (questionnaire) => {
    const totalQuestions = questionnaire.sections?.reduce((acc, section) => 
      acc + (section.questions?.length || 0), 0) || 0;
    const totalSections = questionnaire.sections?.length || 0;
    
    return { totalQuestions, totalSections };
  };

  const getQuestionTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'likert': return <FaChartBar className="w-4 h-4" />;
      case 'binary': return <FaQuestionCircle className="w-4 h-4" />;
      case 'text': return <FaFileAlt className="w-4 h-4" />;
      default: return <FaTasks className="w-4 h-4" />;
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    hover: { y: -5, scale: 1.02 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex lg:flex-row flex-col min-h-screen">
          <div className="lg:block hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-80">
            <SidebarProfessor />
          </div>
          <div className="flex-1 lg:ml-80 flex items-center justify-center p-4">
            <div className="text-center bg-white p-8 lg:p-12 rounded-2xl shadow-2xl max-w-md w-full">
              <div className="animate-spin rounded-full h-12 w-12 lg:h-16 lg:w-16 border-b-2 border-blue-600 mx-auto mb-4 lg:mb-6"></div>
              <h2 className="text-lg lg:text-xl font-semibold text-slate-800 mb-2">Chargement des questionnaires</h2>
              <p className="text-sm lg:text-base text-slate-600">Veuillez patienter...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex lg:flex-row flex-col min-h-screen">
        {/* Sidebar - Fixed on desktop, hidden on mobile */}
        <div className="lg:block hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-80">
          <SidebarProfessor />
        </div>
        
        <div className="flex-1 lg:ml-80">
          {/* Header */}
          <div className="bg-white shadow-lg border-b border-slate-200 p-4 lg:p-8 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text">
                    Tableau de bord enseignant
                  </h1>
                  <p className="text-slate-600 mt-1 lg:mt-2 text-sm lg:text-base">
                    Consultez et remplissez les questionnaires qui vous sont assignés
                  </p>
                </div>
                <div className="flex items-center space-x-3 lg:space-x-4">
                  <div className="bg-blue-100 text-blue-600 p-2 lg:p-3 rounded-xl">
                    <BookOpen className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <div className="text-sm lg:text-base">
                    <div className="font-semibold text-slate-800">{questionnaires.length}</div>
                    <div className="text-slate-600 text-xs lg:text-sm">Questionnaire{questionnaires.length > 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          {questionnaires.length > 0 && (
            <div className="bg-white border-b border-slate-200 p-4 lg:p-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="      Rechercher un questionnaire..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 lg:py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all text-sm lg:text-base"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <BookOpen className="w-4 h-4 lg:w-5 lg:h-5" />
                      </div>
                    </div>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 lg:py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all text-sm lg:text-base bg-white"
                  >
                    <option value="all">Tous les questionnaires</option>
                    <option value="pending">À compléter</option>
                    <option value="completed">Terminés</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="p-4 lg:p-8 pb-16">
            <div className="max-w-7xl mx-auto">
              {questionnaires.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 lg:py-16"
                >
                  <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 max-w-md mx-auto">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FaClipboardList className="w-10 h-10 lg:w-12 lg:h-12 text-slate-400" />
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-slate-800 mb-4">
                      Aucun questionnaire disponible
                    </h3>
                    <p className="text-slate-600 text-sm lg:text-base">
                      Il n'y a actuellement aucun questionnaire assigné à votre compte. 
                      Veuillez contacter votre administrateur si vous pensez qu'il s'agit d'une erreur.
                    </p>
                  </div>
                </motion.div>
              ) : filteredQuestionnaires.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                      Aucun résultat trouvé
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Aucun questionnaire ne correspond à votre recherche.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
                >
                  <AnimatePresence>
                    {filteredQuestionnaires.map((questionnaire, index) => {
                      const stats = getQuestionnaireStats(questionnaire);
                      
                      return (
                        <motion.div
                          key={questionnaire.templateCode}
                          variants={cardVariants}
                          whileHover="hover"
                          layout
                          className="group"
                        >
                          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden h-full hover:shadow-2xl transition-all duration-300">
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                              <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                    <FaClipboardList className="w-6 h-6" />
                                  </div>
                                  <div className="text-right">
                                    <div className="text-white/80 text-xs font-medium">VERSION</div>
                                    <div className="text-lg font-bold">{questionnaire.version}</div>
                                  </div>
                                </div>
                                <h3 className="text-xl lg:text-2xl font-bold mb-2 break-words">
                                  {questionnaire.title}
                                </h3>
                                <p className="text-blue-100 text-sm">
                                  Code: {questionnaire.templateCode}
                                </p>
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6 flex-1 flex flex-col">
                              {/* Stats */}
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="text-center p-3 bg-slate-50 rounded-xl">
                                  <div className="text-2xl font-bold text-slate-800">{stats.totalSections}</div>
                                  <div className="text-xs text-slate-600">Section{stats.totalSections > 1 ? 's' : ''}</div>
                                </div>
                                <div className="text-center p-3 bg-blue-50 rounded-xl">
                                  <div className="text-2xl font-bold text-blue-600">{stats.totalQuestions}</div>
                                  <div className="text-xs text-blue-600">Question{stats.totalQuestions > 1 ? 's' : ''}</div>
                                </div>
                              </div>

                              {/* Question Types Preview */}
                              {questionnaire.sections && questionnaire.sections.length > 0 && (
                                <div className="mb-6">
                                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Types de questions:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {Array.from(new Set(
                                      questionnaire.sections.flatMap(section => 
                                        section.questions?.map(q => q.type) || []
                                      )
                                    )).map(type => (
                                      <div
                                        key={type}
                                        className="flex items-center space-x-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-lg text-xs"
                                      >
                                        {getQuestionTypeIcon(type)}
                                        <span className="capitalize">{type}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Action Button */}
                              <div className="mt-auto">
                                <button
                                  onClick={() => navigate(`/enseignant/questionnaire/${questionnaire.templateCode}`)}
                                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-105 flex items-center justify-center space-x-2"
                                >
                                  <Send className="w-4 h-4" />
                                  <span>Remplir le questionnaire</span>
                                </button>
                              </div>
                            </div>

                            {/* Status Indicator - Repositioned */}
                            <div className="absolute top-4 right-4">
                             
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
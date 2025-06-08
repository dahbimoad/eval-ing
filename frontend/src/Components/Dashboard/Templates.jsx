// src/Components/Dashboard/Templates.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FaPlus, FaTrash, FaArrowRight, FaSearch, FaFilter, FaCopy, FaEye } from "react-icons/fa";
import { motion } from "framer-motion";

import Sidebar from "./Sidebar";
import { useTemplates } from "../../hooks/useTemplates";
import { useFilieres } from "../../hooks/useFilieres";
import { publicationService } from "../../services/publicationService";

export default function Templates() {
  /* ─── template hook ─── */
  const {
    templates,
    loading: tplLoading,
    loadTemplates,
    addTemplate,
    removeTemplate
  } = useTemplates();

  /* ─── filière hook ─── */
  const {
    filieres,
    loading: filLoading
  } = useFilieres();

  /* ─── local state ─── */
  const [showNew, setShowNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [publications, setPublications] = useState([]);
  const [form, setForm] = useState({
    templateCode: "",
    filiereId: "",
    role: "Professor",
    title: ""
  });

  /* ─── initial load ─── */
  useEffect(() => {
    loadTemplates();
    loadPublications();
  }, [loadTemplates]);

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
      
      setPublications(publicationsData);
    } catch (error) {
      console.error("Error loading publications:", error);
      setPublications([]);
    }
  };

  /* ─── handlers ─── */
  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Validate filière selection
    if (!form.filiereId || form.filiereId === "") {
      toast.error("Veuillez sélectionner une filière");
      return;
    }
    
    // payload shape expected by API:
    const payload = {
      templateCode: form.templateCode.trim(),
      filiereId: Number(form.filiereId),
      role: form.role,
      title: form.title.trim()
    };
    
    // Additional validation
    if (!payload.templateCode) {
      toast.error("Le code du template est obligatoire");
      return;
    }
    if (!payload.title) {
      toast.error("Le titre est obligatoire");
      return;
    }
    if (isNaN(payload.filiereId) || payload.filiereId <= 0) {
      toast.error("Filière invalide");
      return;
    }
    
    console.log('🔧 Creating template with payload:', payload); // Debug log
    
    const ok = await addTemplate(payload);
    if (ok !== false) {
      setShowNew(false);
      setForm({ templateCode: "", filiereId: "", role: "Professor", title: "" });
      toast.success("Template créé avec succès!");
    }
  };

  const handleDuplicate = async (template) => {
    const newCode = `${template.templateCode}_copy_${Date.now()}`;
    const payload = {
      templateCode: newCode,
      filiereId: template.filiereId,
      role: template.role,
      title: `${template.title} (Copie)`
    };
    await addTemplate(payload);
  };

  // Filter templates - ensure templates is always an array
  const templatesList = Array.isArray(templates) ? templates : [];
  const filteredTemplates = templatesList.filter(tpl => {
    const matchesSearch = tpl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tpl.templateCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || tpl.status === filterStatus;
    const matchesRole = filterRole === "all" || tpl.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Get publication info for a template
  const getPublicationInfo = (templateId) => {
    return publications.find(pub => pub.templateId === templateId);
  };

  // Ensure filieres is always an array
  const filieresList = Array.isArray(filieres) ? filieres : [];
  const list = Array.isArray(filteredTemplates) ? filteredTemplates : [];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">
        <ToastContainer />

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gestion des Questionnaires
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Créez et gérez vos templates de questionnaires d'évaluation
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNew(true)}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-lg"
            >
              <FaPlus size={16} /> Nouveau Template
            </motion.button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4">
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
            
            <div className="flex gap-2">
              <select
                className="input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="Draft">Brouillon</option>
                <option value="Published">Publié</option>
              </select>
              
              <select
                className="input"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">Tous les rôles</option>
                <option value="Professor">Professeur</option>
                <option value="Professional">Professionnel</option>
                <option value="Student">Étudiant</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Templates</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{templatesList.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Brouillons</h3>
            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {templatesList.filter(t => t.status === "Draft").length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Publiés</h3>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {templatesList.filter(t => t.status === "Published").length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Publications actives</h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">{publications.length}</p>
          </div>
        </div>

        {/* List */}
        {tplLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : list.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || filterStatus !== "all" || filterRole !== "all" 
                ? "Aucun template ne correspond à vos critères de recherche."
                : "Aucun template créé pour le moment."}
            </p>
            {!searchTerm && filterStatus === "all" && filterRole === "all" && (
              <button
                onClick={() => setShowNew(true)}
                className="text-yellow-500 hover:text-yellow-600"
              >
                Créer votre premier template
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((tpl) => {
              const pubInfo = getPublicationInfo(tpl.id);
              return (
                <motion.div
                  key={tpl.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {tpl.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        tpl.status === "Published"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {tpl.status === "Published" ? "Publié" : "Brouillon"}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                    <p><strong>Code:</strong> {tpl.templateCode}</p>
                    <p><strong>Filière:</strong> {filieresList.find(f => f.id === tpl.filiereId)?.title || tpl.filiereId}</p>
                    <p><strong>Rôle:</strong> {tpl.role}</p>
                    {pubInfo && (
                      <p className="text-blue-600 dark:text-blue-400">
                        <strong>Publication active</strong> jusqu'au {new Date(pubInfo.endDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/questionnaire/${tpl.id}/edit`}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      {tpl.status === "Draft" ? (
                        <>
                          <FaArrowRight /> Éditer
                        </>
                      ) : (
                        <>
                          <FaEye /> Consulter
                        </>
                      )}
                    </Link>
                    
                    <button
                      onClick={() => handleDuplicate(tpl)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                      title="Dupliquer"
                    >
                      <FaCopy />
                    </button>
                    
                    {tpl.status === "Draft" && (
                      <button
                        onClick={() => {
                          if (window.confirm("Êtes-vous sûr de vouloir supprimer ce template ?")) {
                            removeTemplate(tpl.id);
                          }
                        }}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* New Template Modal */}
        {showNew && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4">Créer un nouveau template</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Code du template</label>
                  <input
                    className="input w-full"
                    placeholder="Ex: EVAL_GI_2024"
                    value={form.templateCode}
                    onChange={(e) =>
                      setForm({ ...form, templateCode: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Code unique pour identifier ce template
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Titre</label>
                  <input
                    className="input w-full"
                    placeholder="Ex: Évaluation Formation Génie Informatique"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Filière</label>
                  <select
                    className="input w-full"
                    value={form.filiereId}
                    onChange={(e) =>
                      setForm({ ...form, filiereId: e.target.value })
                    }
                    disabled={filLoading}
                    required
                  >
                    <option value="">Sélectionnez une filière</option>
                    {filieresList.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.code} – {f.title}
                      </option>
                    ))}
                  </select>
                  {filLoading && (
                    <p className="text-xs text-gray-500 mt-1">
                      Chargement des filières...
                    </p>
                  )}
                  {!filLoading && filieresList.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      Aucune filière disponible
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Rôle cible</label>
                  <select
                    className="input w-full"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="Professor">Professeur</option>
                    <option value="Professional">Professionnel</option>
                    <option value="Student">Étudiant</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Qui répondra à ce questionnaire ?
                  </p>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowNew(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                  >
                    Créer le template
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

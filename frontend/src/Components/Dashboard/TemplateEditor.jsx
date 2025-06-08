// src/Components/Dashboard/TemplateEditor.jsx
import React, { useEffect, useState }  from "react";
import { useParams, useNavigate }      from "react-router-dom";
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaArrowUp, FaArrowDown, FaRocket, FaCode, FaCogs, FaGraduationCap, FaBook, FaQuestionCircle } from "react-icons/fa";
import { motion, AnimatePresence }     from "framer-motion";
import { ToastContainer, toast }       from "react-toastify";

import Sidebar                         from "./Sidebar";
import { useTemplates }                from "../../hooks/useTemplates";
import {
  createSection,
  updateSection,
  deleteSection   as apiDeleteSection,
  createQuestion,
  updateQuestion,
  deleteQuestion  as apiDeleteQuestion,
  getSections
} from "../../services/templateService";
import { publicationService } from "../../services/publicationService";

/* ------------------------------------------------------------------ */

export default function TemplateEditor() {
  const { id }  = useParams();            // template ID from URL
  const nav     = useNavigate();

  /* main hook -------------------------------------------------------- */
  const {
    templates,
    loadTemplates,
  } = useTemplates();

  /* local state ------------------------------------------------------ */
  const [tpl,       setTpl]       = useState(null);    // template object
  const [sections,  setSections]  = useState([]);      // list of sections
  const [newTitle,  setNewTitle]  = useState("");      // new section title
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishForm, setPublishForm] = useState({
    startDate: "",
    endDate: ""
  });

  // Set default dates when modal opens
  useEffect(() => {
    if (showPublishModal && !publishForm.startDate) {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      setPublishForm({
        startDate: tomorrow.toISOString().slice(0, 16), // Format for datetime-local
        endDate: nextWeek.toISOString().slice(0, 16)
      });
    }
  }, [showPublishModal]);

  /* initial data ----------------------------------------------------- */
  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  /* whenever list of templates changes, grab this one */
  useEffect(() => {
    const current = templates.find(t => t.id === +id);
    setTpl(current || null);
  }, [templates, id]);

  /* whenever template is resolved, fetch its sections */
  useEffect(() => {
    if (!tpl) return;
    (async () => {
      try {
        const { data } = await getSections(tpl.id);
        setSections(data);
      } catch (error) {
        console.error('❌ Error loading sections:', error);
        toast.error("Impossible de charger les sections");
      }
    })();
  }, [tpl]);

  /* helpers ---------------------------------------------------------- */
  const addSection = async () => {
    if (!newTitle.trim()) {
      toast.error("Veuillez saisir un titre pour la section");
      return;
    }
    if (!tpl) {
      toast.error("Template introuvable");
      return;
    }

    const payload = { title: newTitle, displayOrder: sections.length + 1 };
    console.log('🔧 Creating section with payload:', payload, 'for template:', tpl.id);

    try {
      const response = await createSection(tpl.id, payload);
      console.log('✅ Section created:', response);
      
      // Refresh sections
      const sectionsResponse = await getSections(tpl.id);
      console.log('✅ Sections refreshed:', sectionsResponse.data);
      setSections(sectionsResponse.data);
      
      setNewTitle("");
      toast.success("Section ajoutée avec succès!");
    } catch (error) {
      console.error('❌ Error creating section:', error);
      toast.error("Erreur lors de l'ajout de section: " + (error.response?.data?.message || error.message));
    }
  };

  const removeSection = async (sectionId) => {
    if (!tpl) return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette section et toutes ses questions ?")) return;

    await apiDeleteSection(tpl.id, sectionId)
      .then(() => setSections(sections.filter(s => s.id !== sectionId)))
      .catch(() => toast.error("Suppression impossible"));
  };

  const updateSectionOrder = async (sectionId, direction) => {
    const index = sections.findIndex(s => s.id === sectionId);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections.length - 1)) return;

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap sections
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    
    // Update display orders
    newSections.forEach((section, idx) => {
      section.displayOrder = idx + 1;
    });
    
    // Update frontend immediately
    setSections(newSections);
    
    // Update backend sequentially to avoid constraint violations
    try {
      // Use a temporary high value first to avoid constraint conflicts
      const tempDisplayOrder = 9999;
      
      // Step 1: Set first section to temporary value
      await updateSection(tpl.id, newSections[index].id, { 
        title: newSections[index].title, 
        displayOrder: tempDisplayOrder 
      });
      
      // Step 2: Update second section to its final position
      await updateSection(tpl.id, newSections[targetIndex].id, { 
        title: newSections[targetIndex].title, 
        displayOrder: newSections[targetIndex].displayOrder 
      });
      
      // Step 3: Update first section to its final position
      await updateSection(tpl.id, newSections[index].id, { 
        title: newSections[index].title, 
        displayOrder: newSections[index].displayOrder 
      });
      
      toast.success("Ordre des sections mis à jour");
    } catch (error) {
      console.error("❌ Error updating section order:", error);
      toast.error("Erreur lors de la mise à jour de l'ordre");
      // Revert the frontend changes
      refreshSection();
    }
  };

  const addQuestion = async (sectionId, q) => {
    if (!tpl) return;
    
    // Map frontend form data to backend DTO format
    const questionRequest = {
      Wording: q.wording,
      Type: mapQuestionType(q.type),
      MaxLength: q.type === "Text" ? 500 : null // Set default max length for text questions
    };
    
    console.log("🔧 Creating question with data:", questionRequest);
    
    await createQuestion(tpl.id, sectionId, questionRequest)
      .then(() => {
        toast.success("Question ajoutée avec succès!");
        refreshSection(sectionId);
      })
      .catch((error) => {
        console.error("❌ Question creation failed:", error);
        toast.error("Ajout de question impossible");
      });
  };

  // Helper function to map frontend question types to backend enum values
  const mapQuestionType = (frontendType) => {
    switch (frontendType) {
      case "Likert":
        return 1; // QuestionType.Likert
      case "Binary":
        return 2; // QuestionType.Binary
      case "Text":
        return 3; // QuestionType.Text
      default:
        return 1; // Default to Likert
    }
  };

  const removeQuestion = async (sectionId, qId) => {
    if (!tpl) return;
    await apiDeleteQuestion(tpl.id, sectionId, qId)
      .then(() => refreshSection(sectionId))
      .catch(() => toast.error("Suppression impossible"));
  };

  const refreshSection = async (sectionId) => {
    try {
      const { data } = await getSections(tpl.id);            // quickest: reload all
      setSections(data);
    } catch (error) {
      console.error('❌ Error refreshing sections:', error);
      toast.error("Erreur lors du rafraîchissement des sections");
    }
  };

  const handlePublish = async () => {
    if (!publishForm.startDate || !publishForm.endDate) {
      toast.error("Veuillez remplir les dates de début et de fin");
      return;
    }

    // Convert dates to ISO format and validate
    const startDate = new Date(publishForm.startDate);
    const endDate = new Date(publishForm.endDate);
    
    if (endDate <= startDate) {
      toast.error("La date de fin doit être après la date de début");
      return;
    }
    
    const publishData = {
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString()
    };
    
    console.log('🔧 Publishing with data:', publishData);

    try {
      await publicationService.publish(tpl.id, publishData);
      toast.success("Questionnaire publié avec succès !");
      setShowPublishModal(false);
      nav("/admin/questionnaire");
    } catch (error) {
      console.error("❌ Publication error:", error);
      toast.error(`Erreur lors de la publication: ${error.response?.data?.message || error.message}`);
    }
  };

  const validateTemplate = () => {
    if (sections.length === 0) {
      toast.error("Le questionnaire doit contenir au moins une section");
      return false;
    }
    
    const hasEmptySections = sections.some(s => {
      const questions = s.questions || s.Questions || [];
      return questions.length === 0;
    });
    if (hasEmptySections) {
      toast.error("Toutes les sections doivent contenir au moins une question");
      return false;
    }
    
    return true;
  };

  const getRoleInfo = (role) => {
    switch (role) {
      case "Étudiant":
        return { color: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300", icon: <FaGraduationCap /> };
      case "Enseignant":
        return { color: "bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 border-green-300", icon: <FaCogs /> };
      case "Professionnel":
        return { color: "bg-gradient-to-r from-purple-100 to-indigo-200 text-purple-800 border-purple-300", icon: <FaRocket /> };
      default:
        return { color: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300", icon: <FaCode /> };
    }
  };

  const getStatusInfo = (status) => {
    if (status === "Published" || status === "published" || status === 1) {
      return { color: "bg-gradient-to-r from-emerald-100 to-green-200 text-emerald-800 border-emerald-300", text: "Publié", icon: "✓" };
    }
    return { color: "bg-gradient-to-r from-amber-100 to-yellow-200 text-amber-800 border-amber-300", text: "Brouillon", icon: "📝" };
  };

  /* render ----------------------------------------------------------- */
  if (!tpl) return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Sidebar />
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Chargement du questionnaire...</p>
        </div>
      </div>
    </div>
  );

  const roleInfo = getRoleInfo(tpl.role);
  const statusInfo = getStatusInfo(tpl.status);

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
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                {tpl.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FaCode className="text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">Code: <strong>{tpl.templateCode}</strong></span>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border ${roleInfo.color}`}>
                  {roleInfo.icon}
                  {tpl.role}
                </span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border ${statusInfo.color}`}>
                  {statusInfo.icon}
                  {statusInfo.text}
                </span>
              </div>
            </div>

            {(tpl.status === "Draft" || tpl.status === "draft" || tpl.status === 0) && (
              <motion.button
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  console.log('🔧 Template status for publish check:', tpl.status);
                  if (validateTemplate()) {
                    setShowPublishModal(true);
                  }
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <FaRocket />
                Publier le questionnaire
              </motion.button>
            )}
            
            {(tpl.status === "Published" || tpl.status === "published" || tpl.status === 1) && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-green-200 text-emerald-800 px-6 py-3 rounded-xl border border-emerald-300">
                <span className="text-green-600">✓</span>
                <span className="font-semibold">Publié</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Enhanced Statistics Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl mb-6 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 text-white p-3 rounded-full">
                  <FaBook />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sections</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{sections.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 text-white p-3 rounded-full">
                  <FaQuestionCircle />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Questions</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {sections.reduce((acc, s) => acc + ((s.questions || s.Questions)?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* all sections ---------------------------------------------- */}
        <AnimatePresence>
          {sections.map((sec, index) => (
            <SectionCard
              key={sec.id}
              section={sec}
              index={index}
              totalSections={sections.length}
              onDelete={() => removeSection(sec.id)}
              onUpdateOrder={(direction) => updateSectionOrder(sec.id, direction)}
              onAddQuestion={payload => addQuestion(sec.id, payload)}
              onDeleteQuestion={qId => removeQuestion(sec.id, qId)}
              templateId={tpl.id}
            />
          ))}
        </AnimatePresence>

        {/* Enhanced Add Section Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-gradient-to-r from-white via-amber-50 to-yellow-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 p-6 rounded-2xl shadow-lg border border-amber-200 dark:border-amber-800"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white p-2 rounded-full">
              <FaPlus />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-yellow-700 bg-clip-text text-transparent">
              Ajouter une nouvelle section
            </h3>
          </div>
          <div className="flex gap-3">
            <input
              className="flex-1 px-4 py-3 border border-amber-300 dark:border-amber-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all duration-300"
              placeholder="Titre de la nouvelle section"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addSection()}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addSection}
              className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <FaPlus/> Ajouter
            </motion.button>
          </div>
        </motion.div>

        {/* Enhanced Publish Modal */}
        <AnimatePresence>
          {showPublishModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-white via-green-50 to-emerald-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 p-8 rounded-2xl w-96 max-w-full shadow-2xl border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-3 rounded-full">
                    <FaRocket />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                    Publier le questionnaire
                  </h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Date de début</label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-3 border border-green-300 dark:border-green-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-300"
                      value={publishForm.startDate}
                      onChange={(e) => setPublishForm({...publishForm, startDate: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Date de fin</label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-3 border border-green-300 dark:border-green-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-300"
                      value={publishForm.endDate}
                      onChange={(e) => setPublishForm({...publishForm, endDate: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPublishModal(false)}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-xl transition-all duration-300"
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePublish}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Publier
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* helper component – a single section + its questions                */
function SectionCard({ section, index, totalSections, onDelete, onUpdateOrder, onAddQuestion, onDeleteQuestion, templateId }) {
  const [showAdd, setShowAdd]   = useState(false);
  const [editingSection, setEditingSection] = useState(false);
  const [sectionTitle, setSectionTitle] = useState(section.title);
  const [qForm,   setQForm]     = useState({ 
    wording: "", 
    type: "Likert",
    isRequired: true,
    displayOrder: ((section.questions || section.Questions)?.length || 0) + 1
  });

  const submitQ = async () => {
    if (!qForm.wording.trim()) return;
    await onAddQuestion(qForm);
    setQForm({ 
      wording: "", 
      type: "Likert",
      isRequired: true,
      displayOrder: ((section.questions || section.Questions)?.length || 0) + 2
    });
    setShowAdd(false);
  };

  const handleUpdateSection = async () => {
    if (!sectionTitle.trim()) {
      toast.error("Le titre de la section ne peut pas être vide");
      return;
    }
    
    const updateData = { 
      title: sectionTitle.trim(), 
      displayOrder: section.displayOrder || 1
    };
    
    console.log('🔧 Updating section with data:', updateData);
    
    try {
      await updateSection(templateId, section.id, updateData);
      section.title = sectionTitle;
      setEditingSection(false);
      toast.success("Section mise à jour");
    } catch (error) {
      console.error("❌ Error updating section:", error);
      console.error("❌ Error details:", error.response?.data);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-white via-slate-50 to-blue-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-gray-600 mb-6"
    >
      {/* Enhanced header ---------------------------------------------- */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Section {index + 1}
          </div>
          {editingSection ? (
            <div className="flex items-center gap-3 flex-1">
              <input
                className="flex-1 px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUpdateSection()}
              />
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleUpdateSection} 
                className="text-green-600 hover:text-green-700 bg-green-100 dark:bg-green-900/20 p-2 rounded-full" 
                title="Sauvegarder"
              >
                <FaSave />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setSectionTitle(section.title);
                  setEditingSection(false);
                }} 
                className="text-gray-500 hover:text-gray-700 bg-gray-100 dark:bg-gray-900/20 p-2 rounded-full" 
                title="Annuler"
              >
                <FaTimes />
              </motion.button>
            </div>
          ) : (
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
              {section.title}
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setEditingSection(true)} 
                className="text-blue-500 hover:text-blue-600 bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full" 
                title="Modifier"
              >
                <FaEdit size={14} />
              </motion.button>
            </h2>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {index > 0 && (
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onUpdateOrder('up')} 
              className="text-gray-500 hover:text-gray-700 bg-gray-100 dark:bg-gray-900/20 p-2 rounded-full" 
              title="Monter"
            >
              <FaArrowUp />
            </motion.button>
          )}
          {index < totalSections - 1 && (
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onUpdateOrder('down')} 
              className="text-gray-500 hover:text-gray-700 bg-gray-100 dark:bg-gray-900/20 p-2 rounded-full" 
              title="Descendre"
            >
              <FaArrowDown />
            </motion.button>
          )}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDelete} 
            className="text-red-500 hover:text-red-600 bg-red-100 dark:bg-red-900/20 p-2 rounded-full" 
            title="Supprimer"
          >
            <FaTrash/>
          </motion.button>
        </div>
      </div>

      {/* questions list --------------------------------------------- */}
      <div className="space-y-2 mb-4">
        {(section.questions || section.Questions || []).map((q, qIndex) => (
          <QuestionItem 
            key={q.id || q.Id} 
            question={q} 
            index={qIndex}
            onDelete={() => onDeleteQuestion(q.id || q.Id)}
            templateId={templateId}
            sectionId={section.id || section.Id}
          />
        ))}
      </div>

      {/* Enhanced add-question area ---------------------------------- */}
      <AnimatePresence mode="wait">
        {showAdd ? (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 rounded-full">
                <FaQuestionCircle />
              </div>
              <h4 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
                Nouvelle question
              </h4>
            </div>
            <div className="space-y-4">
              <input
                className="w-full px-4 py-3 border border-indigo-300 dark:border-indigo-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-300"
                placeholder="Intitulé de la question"
                value={qForm.wording}
                onChange={e => setQForm({...qForm, wording:e.target.value})}
              />
              <div className="flex gap-4">
                <select
                  className="flex-1 px-4 py-3 border border-indigo-300 dark:border-indigo-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-300"
                  value={qForm.type}
                  onChange={e => setQForm({...qForm, type:e.target.value})}
                >
                  <option value="Likert">Échelle de Likert (1-5)</option>
                  <option value="Binary">Binaire (Oui/Non)</option>
                  <option value="Text">Texte libre</option>
                </select>
                <label className="flex items-center gap-2 bg-white dark:bg-gray-700 px-4 py-3 rounded-xl border border-indigo-300 dark:border-indigo-700">
                  <input
                    type="checkbox"
                    checked={qForm.isRequired}
                    onChange={e => setQForm({...qForm, isRequired: e.target.checked})}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Obligatoire</span>
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAdd(false)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-xl transition-all duration-300"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={submitQ}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <FaPlus/> Ajouter
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowAdd(true)}
            className="w-full py-4 border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-xl text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
          >
            <FaPlus />
            Ajouter une question
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* Question Item Component */
function QuestionItem({ question, index, onDelete, templateId, sectionId }) {
  const [editing, setEditing] = useState(false);
  const [qData, setQData] = useState({
    wording: question.wording,
    type: question.type,
    isRequired: question.isRequired
  });

  const handleUpdate = async () => {
    try {
      // Map frontend form data to backend DTO format
      const questionRequest = {
        Wording: qData.wording,
        Type: mapQuestionType(qData.type),
        MaxLength: qData.type === "Text" ? 500 : null
      };
      
      await updateQuestion(templateId, sectionId, question.id, questionRequest);
      question.wording = qData.wording;
      question.type = qData.type;
      question.isRequired = qData.isRequired;
      setEditing(false);
      toast.success("Question mise à jour");
    } catch (error) {
      console.error("❌ Question update failed:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  // Helper function to map frontend question types to backend enum values
  const mapQuestionType = (frontendType) => {
    switch (frontendType) {
      case "Likert":
        return 1; // QuestionType.Likert
      case "Binary":
        return 2; // QuestionType.Binary
      case "Text":
        return 3; // QuestionType.Text
      default:
        return 1; // Default to Likert
    }
  };

  const getTypeInfo = (type) => {
    switch (type) {
      case "Likert":
        return { color: "bg-blue-100 text-blue-800 border-blue-300", text: "Échelle 1-5" };
      case "Binary":
        return { color: "bg-green-100 text-green-800 border-green-300", text: "Oui/Non" };
      case "Text":
        return { color: "bg-purple-100 text-purple-800 border-purple-300", text: "Texte libre" };
      default:
        return { color: "bg-gray-100 text-gray-800 border-gray-300", text: type };
    }
  };

  if (editing) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800"
      >
        <div className="space-y-4">
          <input
            className="w-full px-4 py-3 border border-yellow-300 dark:border-yellow-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
            value={qData.wording}
            onChange={(e) => setQData({...qData, wording: e.target.value})}
          />
          <div className="flex gap-3">
            <select
              className="flex-1 px-4 py-3 border border-yellow-300 dark:border-yellow-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
              value={qData.type}
              onChange={(e) => setQData({...qData, type: e.target.value})}
            >
              <option value="Likert">Échelle de Likert</option>
              <option value="Binary">Binaire</option>
              <option value="Text">Texte libre</option>
            </select>
            <label className="flex items-center gap-2 bg-white dark:bg-gray-700 px-4 py-3 rounded-xl border border-yellow-300 dark:border-yellow-700">
              <input
                type="checkbox"
                checked={qData.isRequired}
                onChange={(e) => setQData({...qData, isRequired: e.target.checked})}
                className="rounded text-yellow-600 focus:ring-yellow-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Obligatoire</span>
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditing(false)}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-xl transition-all duration-300"
            >
              Annuler
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpdate}
              className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Sauvegarder
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  const typeInfo = getTypeInfo(question.type);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 via-slate-50 to-gray-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-600"
    >
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">{question.wording}</p>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Q{index + 1}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${typeInfo.color}`}>
            {typeInfo.text}
          </span>
          {question.isRequired && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-300">
              Obligatoire
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setEditing(true)}
          className="text-blue-500 hover:text-blue-600 bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full"
          title="Modifier"
        >
          <FaEdit size={14} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onDelete}
          className="text-red-500 hover:text-red-600 bg-red-100 dark:bg-red-900/20 p-2 rounded-full"
          title="Supprimer"
        >
          <FaTrash size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
}

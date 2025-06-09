import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProfessorQuestionnaireDetails } from "../../hooks/useProfessorQuestionnaireDetails";
import { useProfessorQuestionnaires } from "../../hooks/useProfessorQuestionnaires";
import { 
  FaChevronLeft, 
  FaClipboardList, 
  FaCheck, 
  FaExclamationTriangle,
  FaSpinner,
  FaStar
} from "react-icons/fa";
import { CheckCircle, BookOpen, Send, AlertTriangle } from "lucide-react";
import SidebarProfessor from "./SidebarProfessor";

export default function AnswerQuestionnaire() {
  const { templateCode } = useParams();
  const { template, loading } = useProfessorQuestionnaireDetails(templateCode);
  const { submitAnswers } = useProfessorQuestionnaires();
  const [responses, setResponses] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleChange = (qId, value) => {
    setResponses((prev) => ({ ...prev, [qId]: value }));
    // Clear validation error when user provides input
    if (validationErrors[qId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[qId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    template.sections.forEach(section => {
      section.questions.forEach(question => {
        if (question.required && (!responses[question.id] && responses[question.id] !== 0)) {
          errors[question.id] = "Cette question est obligatoire";
        }
      });
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateProgress = () => {
    const totalQuestions = template?.sections?.reduce((acc, section) => acc + section.questions.length, 0) || 0;
    const answeredQuestions = Object.keys(responses).length;
    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(responses).map(([questionId, value]) => ({
          questionId: parseInt(questionId),
          valueNumber: typeof value === "number" ? value : null,
          valueText: typeof value === "string" ? value : null
        }))
      };

      await submitAnswers(templateCode, payload);
      setSubmitted(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/enseignant/dashboard?submitted=true");
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getLikertLabel = (value) => {
    const labels = {
      1: "Très insatisfaisant",
      2: "Insatisfaisant", 
      3: "Neutre",
      4: "Satisfaisant",
      5: "Très satisfaisant"
    };
    return labels[value];
  };

  const getLikertColor = (value) => {
    const colors = {
      1: "from-red-500 to-red-600",
      2: "from-orange-500 to-orange-600",
      3: "from-yellow-500 to-yellow-600",
      4: "from-blue-500 to-blue-600",
      5: "from-green-500 to-green-600"
    };
    return colors[value];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex lg:flex-row flex-col">
        <div className="lg:block hidden">
          <SidebarProfessor />
        </div>
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
          <div className="text-center bg-white p-8 lg:p-12 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="animate-spin rounded-full h-12 w-12 lg:h-16 lg:w-16 border-b-2 border-blue-600 mx-auto mb-4 lg:mb-6"></div>
            <h2 className="text-lg lg:text-xl font-semibold text-slate-800 mb-2">Chargement du questionnaire</h2>
            <p className="text-sm lg:text-base text-slate-600">Veuillez patienter...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex lg:flex-row flex-col">
        <div className="lg:block hidden">
          <SidebarProfessor />
        </div>
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
          <div className="text-center bg-white p-8 lg:p-12 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
              <AlertTriangle className="w-8 h-8 lg:w-10 lg:h-10 text-red-600" />
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-4">Questionnaire introuvable</h2>
            <p className="text-sm lg:text-base text-slate-600 mb-6">
              Le questionnaire demandé n'existe pas ou n'est plus disponible.
            </p>
            <button
              onClick={() => navigate("/enseignant/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-lg font-medium transition-colors text-sm lg:text-base"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  // Success screen after submission
  if (submitted) {
    return (
      <div className="min-h-screen flex lg:flex-row flex-col">
        <div className="lg:block hidden">
          <SidebarProfessor />
        </div>
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
          <div className="text-center bg-white p-8 lg:p-12 rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
              <CheckCircle className="w-10 h-10 lg:w-12 lg:h-12 text-green-600" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-4">
              Questionnaire soumis avec succès !
            </h2>
            <p className="text-base lg:text-lg text-slate-600 mb-6 leading-relaxed">
              Merci d'avoir pris le temps de répondre à ce questionnaire. 
              Vos réponses ont été enregistrées avec succès.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-700 font-medium text-sm lg:text-base">
                🔄 Redirection vers le tableau de bord en cours...
              </p>
              <p className="text-blue-600 text-xs lg:text-sm mt-1">
                Vous serez automatiquement redirigé dans quelques secondes
              </p>
            </div>
            <button
              onClick={() => navigate("/enseignant/dashboard?submitted=true")}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm lg:text-base"
            >
              Aller au tableau de bord maintenant
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex lg:flex-row flex-col min-h-screen">
        {/* Sidebar - Hidden on mobile, fixed on desktop */}
        <div className="lg:block hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-80">
          <SidebarProfessor />
        </div>
        
        <div className="flex-1 lg:ml-80 flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-lg border-b border-slate-200 p-4 lg:p-6 sticky top-0 z-40">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => navigate("/enseignant/dashboard")}
                className="flex items-center text-slate-600 hover:text-slate-800 transition-colors group"
              >
                <FaChevronLeft className="mr-2 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">Retour au tableau de bord</span>
                <span className="sm:hidden">Retour</span>
              </button>
              
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Questionnaire</span>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs lg:text-sm text-slate-600 mb-2">
                <span className="font-medium">Progression du questionnaire</span>
                <span className="font-semibold">{Math.round(progress)}% complété</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 lg:h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 lg:h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 lg:p-8 pb-16">
            <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
              
              {/* Questionnaire Header */}
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl p-6 lg:p-8 border border-slate-100">
                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 lg:p-4 rounded-xl lg:rounded-2xl shadow-lg flex-shrink-0">
                    <FaClipboardList className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-3 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text">
                      {template.title}
                    </h1>
                    <p className="text-slate-600 leading-relaxed text-base lg:text-lg">
                      Merci de prendre le temps de répondre à ce questionnaire. Vos réponses sont importantes pour améliorer la qualité de l'enseignement.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sections */}
              {template.sections.map((section, sectionIndex) => (
                <div key={section.id} className="bg-white rounded-xl lg:rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                  {/* Section Header */}
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 lg:p-6 border-b border-slate-200">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 text-blue-600 w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-bold text-base lg:text-lg flex-shrink-0">
                        {sectionIndex + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl lg:text-2xl font-bold text-slate-800 break-words">{section.title}</h2>
                        {section.description && (
                          <p className="text-slate-600 mt-1 text-sm lg:text-base break-words">{section.description}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
                    {section.questions.map((question, questionIndex) => (
                      <div
                        key={question.id}
                        className={`p-4 lg:p-6 rounded-lg lg:rounded-xl border-2 transition-all duration-300 ${
                          validationErrors[question.id] 
                            ? 'border-red-300 bg-red-50 shadow-red-100' 
                            : responses[question.id] !== undefined 
                              ? 'border-green-300 bg-green-50 shadow-green-100' 
                              : 'border-slate-200 bg-slate-50 hover:border-blue-200 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start space-x-3 lg:space-x-4 mb-4 lg:mb-6">
                          <span className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs lg:text-sm font-bold transition-colors flex-shrink-0 ${
                            responses[question.id] !== undefined 
                              ? 'bg-green-500 text-white' 
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {responses[question.id] !== undefined ? <FaCheck className="w-3 h-3 lg:w-4 lg:h-4" /> : questionIndex + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <label className="block text-base lg:text-lg font-semibold text-slate-800 mb-3 leading-relaxed break-words">
                              {question.wording}
                              {question.required && (
                                <span className="text-red-500 ml-2 text-sm lg:text-base">*</span>
                              )}
                            </label>
                            
                            {validationErrors[question.id] && (
                              <div className="flex items-center text-red-600 text-xs lg:text-sm mb-4 bg-red-100 p-2 lg:p-3 rounded-lg">
                                <FaExclamationTriangle className="mr-2 flex-shrink-0 w-3 h-3 lg:w-4 lg:h-4" />
                                <span className="break-words">{validationErrors[question.id]}</span>
                              </div>
                            )}

                            {/* Likert Scale */}
                            {question.type === "Likert" && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-3">
                                  {[1, 2, 3, 4, 5].map((value) => (
                                    <label key={value} className="cursor-pointer group">
                                      <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value={value}
                                        checked={responses[question.id] === value}
                                        onChange={() => handleChange(question.id, value)}
                                        className="sr-only"
                                      />
                                      <div className={`p-2 lg:p-4 text-center rounded-lg lg:rounded-xl border-2 transition-all duration-200 ${
                                        responses[question.id] === value
                                          ? `border-transparent bg-gradient-to-br ${getLikertColor(value)} text-white shadow-lg transform scale-105`
                                          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:shadow-md group-hover:scale-105'
                                      }`}>
                                        <div className="text-lg lg:text-xl font-bold mb-1">{value}</div>
                                        <div className="text-xs lg:text-xs font-medium opacity-90 break-words">
                                          {getLikertLabel(value).split(' ')[0]}
                                        </div>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                                {responses[question.id] && (
                                  <div className="text-center">
                                    <span className="inline-flex items-center px-3 py-1 lg:px-4 lg:py-2 bg-blue-100 text-blue-800 rounded-full text-xs lg:text-sm font-medium">
                                      <FaStar className="mr-1 lg:mr-2 w-3 h-3 lg:w-4 lg:h-4" />
                                      <span className="break-words">{getLikertLabel(responses[question.id])}</span>
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Yes/No */}
                            {question.type.toLowerCase() === "binary" && (
                              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                                {[
                                  { value: 1, label: "Oui", color: "green", icon: "✓" },
                                  { value: 0, label: "Non", color: "red", icon: "✗" }
                                ].map(({ value, label, color, icon }) => (
                                  <label key={value} className="cursor-pointer flex-1 group">
                                    <input
                                      type="radio"
                                      name={`question-${question.id}`}
                                      value={value}
                                      checked={responses[question.id] === value}
                                      onChange={() => handleChange(question.id, value)}
                                      className="sr-only"
                                    />
                                    <div className={`p-4 lg:p-6 text-center rounded-lg lg:rounded-xl border-2 transition-all duration-200 ${
                                      responses[question.id] === value
                                        ? color === "green" 
                                          ? 'border-green-500 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg transform scale-105'
                                          : 'border-red-500 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg transform scale-105'
                                        : color === "green"
                                          ? 'border-slate-200 bg-white hover:border-green-300 hover:bg-green-50 hover:shadow-md group-hover:scale-105'
                                          : 'border-slate-200 bg-white hover:border-red-300 hover:bg-red-50 hover:shadow-md group-hover:scale-105'
                                    }`}>
                                      <div className="text-xl lg:text-2xl mb-2">{icon}</div>
                                      <div className="font-semibold text-base lg:text-lg">{label}</div>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            )}

                            {/* Text */}
                            {question.type === "Text" && (
                              <div className="relative">
                                <textarea
                                  value={responses[question.id] || ""}
                                  onChange={(e) => handleChange(question.id, e.target.value)}
                                  className="w-full p-3 lg:p-4 border-2 border-slate-200 rounded-lg lg:rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none resize-none transition-all duration-200 bg-white text-sm lg:text-base"
                                  rows="4"
                                  placeholder="Écrivez votre réponse ici..."
                                />
                                <div className="absolute bottom-2 right-2 lg:bottom-3 lg:right-3 text-xs text-slate-400">
                                  {(responses[question.id] || "").length} caractères
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Submit Section */}
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl p-6 lg:p-8 border border-slate-100">
                <div className="text-center">
                  <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-4">
                    Prêt à soumettre votre questionnaire ?
                  </h3>
                  <p className="text-sm lg:text-base text-slate-600 mb-6 lg:mb-8">
                    Vérifiez vos réponses avant de soumettre. Une fois envoyé, vous ne pourrez plus modifier vos réponses.
                  </p>
                  
                  {Object.keys(validationErrors).length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg lg:rounded-xl p-3 lg:p-4 mb-4 lg:mb-6">
                      <div className="flex items-center text-red-700 mb-2">
                        <FaExclamationTriangle className="mr-2 w-4 h-4 flex-shrink-0" />
                        <span className="font-semibold text-sm lg:text-base">Veuillez compléter les questions obligatoires</span>
                      </div>
                      <p className="text-red-600 text-xs lg:text-sm">
                        {Object.keys(validationErrors).length} question(s) nécessite(nt) une réponse
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`inline-flex items-center px-6 py-3 lg:px-8 lg:py-4 rounded-lg lg:rounded-xl font-semibold text-base lg:text-lg transition-all duration-200 shadow-lg ${
                      submitting
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:scale-105 text-white'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2 lg:mr-3 w-4 h-4 lg:w-5 lg:h-5" />
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 lg:mr-3 w-4 h-4 lg:w-5 lg:h-5" />
                        <span>Soumettre le questionnaire</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
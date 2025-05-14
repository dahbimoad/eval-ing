import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { FaChartBar, FaUserGraduate, FaChalkboardTeacher, FaBuilding, FaFilter, FaSearch } from "react-icons/fa";

// Mock data for statistics - based on the requirements for engineering program evaluation
const mockStats = {
  summary: {
    totalStudents: 350,
    totalTeachers: 45,
    totalProfessionals: 28,
    completedEvaluations: 892,
  },
  questionTypes: {
    ratingQuestions: 15,
    agreeDisagreeQuestions: 8,
    textResponseQuestions: 5,
  },
  filieres: [
    "GINF-2", "GINF-3", "GIL-2", "GIL-3", "GSEA-2", "GSEA-3", 
    "G2I-2", "G2I-3", "GSR-2", "Cyber-2", "Cyber-3"
  ],
  averageRatingsByFiliere: [
    { filiere: "GINF-2", rating: 4.2 },
    { filiere: "GINF-3", rating: 3.8 },
    { filiere: "GIL-2", rating: 4.5 },
    { filiere: "GIL-3", rating: 4.0 },
    { filiere: "GSEA-2", rating: 3.7 },
    { filiere: "GSEA-3", rating: 4.1 },
    { filiere: "G2I-2", rating: 3.9 },
    { filiere: "G2I-3", rating: 4.3 },
    { filiere: "GSR-2", rating: 3.5 },
    { filiere: "Cyber-2", rating: 4.2 },
    { filiere: "Cyber-3", rating: 4.4 },
  ],
  // Sample ratings by question type with filière
  ratingQuestions: [
    { id: 1, question: "Qualité globale des cours", average: 4.2, filiere: "GINF-2" },
    { id: 2, question: "Clarté des explications par les enseignants", average: 3.8, filiere: "GINF-3" },
    { id: 3, question: "Adéquation entre le contenu des cours et les besoins professionnels", average: 3.7, filiere: "GIL-2" },
    { id: 4, question: "Qualité des supports pédagogiques", average: 3.9, filiere: "GSEA-2" },
    { id: 5, question: "Disponibilité des enseignants hors cours", average: 4.5, filiere: "G2I-2" },
    { id: 6, question: "Pertinence des méthodes d'évaluation", average: 4.1, filiere: "Cyber-2" },
    { id: 7, question: "Organisation des examens", average: 3.5, filiere: "GSR-2" },
  ],
  agreeDisagreeQuestions: [
    { id: 1, question: "Le contenu du cours correspond aux objectifs annoncés", agree: 85, disagree: 15, filiere: "GINF-2" },
    { id: 2, question: "Les compétences acquises sont applicables dans un contexte professionnel", agree: 78, disagree: 22, filiere: "GIL-3" },
    { id: 3, question: "Les méthodes d'évaluation sont équitables", agree: 65, disagree: 35, filiere: "GSEA-3" },
    { id: 4, question: "Le volume horaire est suffisant", agree: 45, disagree: 55, filiere: "G2I-3" },
    { id: 5, question: "Les supports de cours sont à jour", agree: 70, disagree: 30, filiere: "Cyber-3" },
  ],
  // Sample student data with their evaluation scores
  studentResponses: [
    { id: 1, name: "Oulad Maalem Ayoub", filiere: "GINF-2", averageRating: 4.3, responsesCount: 20 },
    { id: 2, name: "Amine Laraki", filiere: "GINF-2", averageRating: 3.8, responsesCount: 18 },
    { id: 3, name: "Sara Bennani", filiere: "GIL-2", averageRating: 4.5, responsesCount: 22 },
    { id: 4, name: "Youssef Alami", filiere: "GSEA-3", averageRating: 3.2, responsesCount: 15 },
    { id: 5, name: "Leila Sahli", filiere: "G2I-2", averageRating: 4.7, responsesCount: 21 },
    { id: 6, name: "Karim Tazi", filiere: "Cyber-2", averageRating: 3.9, responsesCount: 19 },
    { id: 7, name: "Fatima Zahra", filiere: "GSR-2", averageRating: 4.1, responsesCount: 20 },
    { id: 8, name: "Mohammed Idrissi", filiere: "GINF-3", averageRating: 3.5, responsesCount: 17 },
  ],
  // Sample professional data with their evaluation scores
  professionalResponses: [
    { id: 1, name: "Omar Kadiri", company: "OCP Group", graduationYear: 2018, averageRating: 4.2, responsesCount: 15, filiere: "GINF-3" },
    { id: 2, name: "Nadia Chaoui", company: "Maroc Telecom", graduationYear: 2015, averageRating: 3.9, responsesCount: 12, filiere: "GIL-3" },
    { id: 3, name: "Hassan Mansouri", company: "Royal Air Maroc", graduationYear: 2010, averageRating: 4.5, responsesCount: 18, filiere: "GSEA-2" },
    { id: 4, name: "Samira Benjelloun", company: "Capgemini", graduationYear: 2019, averageRating: 3.7, responsesCount: 14, filiere: "G2I-2" },
    { id: 5, name: "Rachid El Fakir", company: "Société Générale", graduationYear: 2017, averageRating: 4.0, responsesCount: 16, filiere: "Cyber-2" },
  ],
  // Sample text responses (anonymized) with filière
  textResponses: [
    { 
      id: 1, 
      question: "Quelles améliorations suggérez-vous pour le programme?",
      responses: [
        "Plus de cours pratiques et de stages en entreprise",
        "Mise à jour des technologies enseignées",
        "Plus d'intervenants du monde professionnel",
        "Renforcement des modules de langues étrangères"
      ],
      filiere: "GINF-2"
    },
    { 
      id: 2, 
      question: "Quels aspects du programme vous semblent les plus pertinents?",
      responses: [
        "Les projets en équipe",
        "Les stages pratiques",
        "La diversité des modules techniques",
        "L'accompagnement des enseignants"
      ],
      filiere: "GIL-2"
    },
    {
      id: 3,
      question: "Comment améliorer l'organisation des examens?",
      responses: [
        "Mieux répartir les évaluations dans le semestre",
        "Fournir plus de détails sur le format des examens",
        "Organiser des séances de révision"
      ],
      filiere: "GSEA-3"
    },
    {
      id: 4,
      question: "Quelles ressources supplémentaires seraient utiles?",
      responses: [
        "Accès à plus de bases de données scientifiques",
        "Licences pour des logiciels professionnels",
        "Livres électroniques pour chaque module"
      ],
      filiere: "Cyber-2"
    }
  ]
};

function Statistics() {
  const [activeTab, setActiveTab] = useState("summary");
  const [selectedFiliere, setSelectedFiliere] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const renderBarChart = (data, nameKey, valueKey, maxValue, color = "blue") => {
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
                className={`bg-${color}-600 h-2.5 rounded-full`}
                style={{ width: `${(item[valueKey] / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAgreeDisagreeChart = (data) => {
    return (
      <div className="space-y-6 mt-4">
        {data.map((item) => (
          <div key={item.id} className="space-y-2">
            <p className="font-medium">{item.question}</p>
            <div className="h-8 w-full bg-gray-200 rounded-lg overflow-hidden flex">
              <div 
                className="bg-green-500 h-full flex items-center justify-center text-white text-xs"
                style={{ width: `${item.agree}%` }}
              >
                {item.agree}% D'accord
              </div>
              <div 
                className="bg-red-500 h-full flex items-center justify-center text-white text-xs"
                style={{ width: `${item.disagree}%` }}
              >
                {item.disagree}% Pas d'accord
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Filter students based on search term and selected filiere
  const filteredStudents = mockStats.studentResponses.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFiliere = selectedFiliere === "" || student.filiere === selectedFiliere;
    return matchesSearch && matchesFiliere;
  });

  // Filter professionals based on search term and selected filiere
  const filteredProfessionals = mockStats.professionalResponses.filter(professional => {
    const matchesSearch = professional.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFiliere = selectedFiliere === "" || professional.filiere === selectedFiliere;
    return matchesSearch && matchesFiliere;
  });

  // Filter rating questions based on selected filiere
  const filteredRatingQuestions = mockStats.ratingQuestions.filter(question => {
    return selectedFiliere === "" || question.filiere === selectedFiliere;
  });

  // Filter agree/disagree questions based on selected filiere
  const filteredAgreeDisagreeQuestions = mockStats.agreeDisagreeQuestions.filter(question => {
    return selectedFiliere === "" || question.filiere === selectedFiliere;
  });

  // Filter text responses based on selected filiere
  const filteredTextResponses = mockStats.textResponses.filter(item => {
    return selectedFiliere === "" || item.filiere === selectedFiliere;
  });
  
  const renderContent = () => {
    switch(activeTab) {
      case "summary":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 rounded-lg shadow-md text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Étudiants</p>
                    <h3 className="text-3xl font-bold mt-1">{mockStats.summary.totalStudents}</h3>
                  </div>
                  <FaUserGraduate className="text-4xl opacity-80" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 p-6 rounded-lg shadow-md text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Enseignants</p>
                    <h3 className="text-3xl font-bold mt-1">{mockStats.summary.totalTeachers}</h3>
                  </div>
                  <FaChalkboardTeacher className="text-4xl opacity-80" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-700 p-6 rounded-lg shadow-md text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Professionnels</p>
                    <h3 className="text-3xl font-bold mt-1">{mockStats.summary.totalProfessionals}</h3>
                  </div>
                  <FaBuilding className="text-4xl opacity-80" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-6 rounded-lg shadow-md text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Évaluations</p>
                    <h3 className="text-3xl font-bold mt-1">{mockStats.summary.completedEvaluations}</h3>
                  </div>
                  <FaChartBar className="text-4xl opacity-80" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Types de questions</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span>Questions à notation (1-5)</span>
                    <span className="font-medium">{mockStats.questionTypes.ratingQuestions}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Questions d'accord/pas d'accord</span>
                    <span className="font-medium">{mockStats.questionTypes.agreeDisagreeQuestions}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Questions à réponse textuelle</span>
                    <span className="font-medium">{mockStats.questionTypes.textResponseQuestions}</span>
                  </div>
                  <div className="h-4 w-full bg-gray-200 rounded-full mt-2 overflow-hidden flex">
                    <div 
                      className="bg-blue-600" 
                      style={{ 
                        width: `${(mockStats.questionTypes.ratingQuestions / 
                          (mockStats.questionTypes.ratingQuestions + 
                           mockStats.questionTypes.agreeDisagreeQuestions + 
                           mockStats.questionTypes.textResponseQuestions)) * 100}%` 
                      }}
                    />
                    <div 
                      className="bg-green-500" 
                      style={{ 
                        width: `${(mockStats.questionTypes.agreeDisagreeQuestions / 
                          (mockStats.questionTypes.ratingQuestions + 
                           mockStats.questionTypes.agreeDisagreeQuestions + 
                           mockStats.questionTypes.textResponseQuestions)) * 100}%` 
                      }}
                    />
                    <div 
                      className="bg-yellow-500" 
                      style={{ 
                        width: `${(mockStats.questionTypes.textResponseQuestions / 
                          (mockStats.questionTypes.ratingQuestions + 
                           mockStats.questionTypes.agreeDisagreeQuestions + 
                           mockStats.questionTypes.textResponseQuestions)) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="flex space-x-4 text-xs mt-1">
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-blue-600 rounded-full mr-1"></div>
                      <span>Notes</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-green-500 rounded-full mr-1"></div>
                      <span>D'accord/Pas d'accord</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-yellow-500 rounded-full mr-1"></div>
                      <span>Texte</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Notes moyennes par filière</h3>
                <div className="h-64 overflow-y-auto pr-2">
                  {renderBarChart(mockStats.averageRatingsByFiliere, "filiere", "rating", 5, "yellow")}
                </div>
              </div>
            </div>
          </>
        );
      
      case "ratings":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 space-y-4 md:space-y-0">
              <h3 className="text-xl font-bold">Questions à notation (1-5)</h3>
              
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-64 p-2.5"
                value={selectedFiliere}
                onChange={(e) => setSelectedFiliere(e.target.value)}
              >
                <option value="">Toutes les filières</option>
                {mockStats.filieres.map((filiere) => (
                  <option key={filiere} value={filiere}>{filiere}</option>
                ))}
              </select>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Évaluation moyenne pour les questions de type notation sur une échelle de 1 à 5
            </p>
            
            {filteredRatingQuestions.length > 0 ? (
              <div className="space-y-4 mt-6">
                {filteredRatingQuestions.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <span className="font-medium">{item.question}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          <span>Filière: {item.filiere}</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium">{item.average.toFixed(1)}/5.0</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-400 h-2.5 rounded-full" 
                        style={{ width: `${(item.average / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucune question ne correspond à la filière sélectionnée.
              </div>
            )}
          </div>
        );
      
      case "agreeDisagree":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 space-y-4 md:space-y-0">
              <h3 className="text-xl font-bold">Questions d'accord/pas d'accord</h3>
              
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-64 p-2.5"
                value={selectedFiliere}
                onChange={(e) => setSelectedFiliere(e.target.value)}
              >
                <option value="">Toutes les filières</option>
                {mockStats.filieres.map((filiere) => (
                  <option key={filiere} value={filiere}>{filiere}</option>
                ))}
              </select>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Répartition des réponses pour les questions de type d'accord/pas d'accord
            </p>
            
            {filteredAgreeDisagreeQuestions.length > 0 ? (
              <div className="space-y-6 mt-4">
                {filteredAgreeDisagreeQuestions.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <p className="font-medium">{item.question}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          <span>Filière: {item.filiere}</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-8 w-full bg-gray-200 rounded-lg overflow-hidden flex">
                      <div 
                        className="bg-green-500 h-full flex items-center justify-center text-white text-xs"
                        style={{ width: `${item.agree}%` }}
                      >
                        {item.agree}% D'accord
                      </div>
                      <div 
                        className="bg-red-500 h-full flex items-center justify-center text-white text-xs"
                        style={{ width: `${item.disagree}%` }}
                      >
                        {item.disagree}% Pas d'accord
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucune question ne correspond à la filière sélectionnée.
              </div>
            )}
          </div>
        );
      
      case "students":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 space-y-4 md:space-y-0">
              <h3 className="text-xl font-bold">Réponses des étudiants</h3>
              
              <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                <div className="relative w-full md:w-64">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                    placeholder="Rechercher un étudiant..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-64 p-2.5"
                  value={selectedFiliere}
                  onChange={(e) => setSelectedFiliere(e.target.value)}
                >
                  <option value="">Toutes les filières</option>
                  {mockStats.filieres.map((filiere) => (
                    <option key={filiere} value={filiere}>{filiere}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom complet
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filière
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note moyenne
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Réponses
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.filiere}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900 mr-2">{student.averageRating.toFixed(1)}</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full" 
                              style={{ width: `${(student.averageRating / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.responsesCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredStudents.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Aucun étudiant trouvé.
                </div>
              )}
            </div>
          </div>
        );
      
      case "professionals":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 space-y-4 md:space-y-0">
              <h3 className="text-xl font-bold">Réponses des professionnels</h3>
              
              <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                <div className="relative w-full md:w-64">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                    placeholder="Rechercher un professionnel..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-64 p-2.5"
                  value={selectedFiliere}
                  onChange={(e) => setSelectedFiliere(e.target.value)}
                >
                  <option value="">Toutes les filières</option>
                  {mockStats.filieres.map((filiere) => (
                    <option key={filiere} value={filiere}>{filiere}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom complet
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entreprise
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filière
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Année d'obtention
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note moyenne
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Réponses
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProfessionals.map((professional) => (
                    <tr key={professional.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{professional.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{professional.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{professional.filiere}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{professional.graduationYear}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900 mr-2">{professional.averageRating.toFixed(1)}</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-400 h-2 rounded-full" 
                              style={{ width: `${(professional.averageRating / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {professional.responsesCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredProfessionals.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Aucun professionnel trouvé.
                </div>
              )}
            </div>
          </div>
        );
      
      case "text":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 space-y-4 md:space-y-0">
                <h3 className="text-xl font-bold">Commentaires et suggestions</h3>
                
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-64 p-2.5"
                  value={selectedFiliere}
                  onChange={(e) => setSelectedFiliere(e.target.value)}
                >
                  <option value="">Toutes les filières</option>
                  {mockStats.filieres.map((filiere) => (
                    <option key={filiere} value={filiere}>{filiere}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {filteredTextResponses.length > 0 ? (
              filteredTextResponses.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold">{item.question}</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <span>Filière: {item.filiere}</span>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {item.responses.map((response, index) => (
                      <li key={index} className="p-3 bg-gray-50 rounded-lg">
                        "{response}"
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 bg-white p-6 rounded-lg shadow-md">
                Aucun commentaire ne correspond à la filière sélectionnée.
              </div>
            )}
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
          
          {/* Navigation - Reordered tabs as requested */}
          <div className="flex flex-wrap space-x-1 rounded-xl bg-gray-200 p-1 mb-8">
            <button
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium ${
                activeTab === "summary" 
                  ? "bg-white text-blue-700 shadow" 
                  : "text-gray-700 hover:bg-white/50"
              }`}
              onClick={() => setActiveTab("summary")}
            >
              Résumé
            </button>
            <button
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium ${
                activeTab === "ratings" 
                  ? "bg-white text-blue-700 shadow" 
                  : "text-gray-700 hover:bg-white/50"
              }`}
              onClick={() => setActiveTab("ratings")}
            >
              Questions (1-5)
            </button>
            <button
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium ${
                activeTab === "agreeDisagree" 
                  ? "bg-white text-blue-700 shadow" 
                  : "text-gray-700 hover:bg-white/50"
              }`}
              onClick={() => setActiveTab("agreeDisagree")}
            >
              D'accord/Pas d'accord
            </button>
            <button
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium ${
                activeTab === "text" 
                  ? "bg-white text-blue-700 shadow" 
                  : "text-gray-700 hover:bg-white/50"
              }`}
              onClick={() => setActiveTab("text")}
            >
              Commentaires
            </button>
            <button
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium ${
                activeTab === "students" 
                  ? "bg-white text-blue-700 shadow" 
                  : "text-gray-700 hover:bg-white/50"
              }`}
              onClick={() => setActiveTab("students")}
            >
              Étudiants
            </button>
            <button
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium ${
                activeTab === "professionals" 
                  ? "bg-white text-blue-700 shadow" 
                  : "text-gray-700 hover:bg-white/50"
              }`}
              onClick={() => setActiveTab("professionals")}
            >
              Professionnels
            </button>
          </div>
          
          {/* Content */}
          {renderContent()}
          
          {/* Note about mock data */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Ces données sont des exemples pour la visualisation. Elles seront remplacées par des données réelles provenant de l'API backend une fois celui-ci développé.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics; 
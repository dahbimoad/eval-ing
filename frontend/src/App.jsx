import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Login from "./Components/auth/Login";
import Home from "./Home";
import Forget from "./Components/auth/Forget";
import Reset from "./Components/auth/Reset";
import Admin from "./Components/Dashboard/Admin";
import Students from "./Components/Dashboard/Students";
import Enseignants from "./Components/Dashboard/Enseignants";
import Pro from "./Components/Dashboard/Pro";
import Statistics from "./Components/Dashboard/Statistics";
import { AuthProvider } from './context/AuthContext.jsx';
import PrivateRoute from './Components/auth/PrivateRoute';
import ProfileCompletion from './Components/Dashboard/WelcomeProfileCompletion.jsx';
import FirstLoginRedirect from './Components/auth/FirstLoginRedirect.jsx';
import ProfessorQuestionnaires from "./Components/ProfessorQuestionnaires.jsx";
import ProQuestionnaires from "./Components/ProQuestionnaires.jsx";
import FormationList from './Components/Dashboard/FormationList';
import ModuleList from './Components/Dashboard/ModuleList';
import Templates from "./Components/Dashboard/Templates.jsx";
import TemplateEditor from "./Components/Dashboard/TemplateEditor.jsx";
import QuestionnairePublications from "./Components/Dashboard/QuestionnairePublications.jsx";
import AnswerQuestionnaire from "./Components/Dashboard/AnswerQuestionnaireProfesseur.jsx";
import ProfessorDashboard from "./Components/Dashboard/ProfessorDashboard.jsx";
import ProfessionalDashboard from "./Components/Dashboard/ProfessionalDashboard.jsx";
import AnswerQuestionnaireProfessional from "./Components/Dashboard/AnswerQuestionnaireProfessional.jsx";
import StudentDashboard from "./Components/Dashboard/StudentDashboard.jsx";
import AnswerQuestionnaireStudent from "./Components/Dashboard/AnswerQuestionnaireStudent.jsx";
import DeploymentNotice from "./Components/DeploymentNotice.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forget" element={<Forget />} />
          <Route path="/reset-password" element={<Reset />} />
          <Route path="/redirect" element={<FirstLoginRedirect />} />

          {/* Ì¥ê Routes prot√©g√©es */}
          <Route path="/admin" element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          } />
          <Route path="/ProfileCompletion" element={
            <PrivateRoute>
              <ProfileCompletion />
            </PrivateRoute>
          } />
          <Route path="/admin/etud" element={
            <PrivateRoute>
              <Students />
            </PrivateRoute>
          } />
          <Route path="/admin/formations" element={
            <PrivateRoute>
              <FormationList />
            </PrivateRoute>
          } />
          <Route path="/admin/modules" element={
            <PrivateRoute>
              <ModuleList />
            </PrivateRoute>
          } />
          <Route path="/admin/ens" element={
            <PrivateRoute>
              <Enseignants />
            </PrivateRoute>
          } />
          <Route path="/admin/pro" element={
            <PrivateRoute>
              <Pro />
            </PrivateRoute>
          } />
          <Route path="/admin/statistics" element={
            <PrivateRoute>
              <Statistics />
            </PrivateRoute>
          } />
          <Route path="/admin/questionnaire" element={
            <PrivateRoute>
              <Templates />
            </PrivateRoute>
          } />
          <Route path="/admin/questionnaire/:id/edit" element={
            <PrivateRoute>
              <TemplateEditor />
            </PrivateRoute>
          } />
          <Route path="/admin/publications" element={
            <PrivateRoute>
              <QuestionnairePublications />
            </PrivateRoute>
          } />

          <Route path="/enseignant/dashboard" element={
            <PrivateRoute>
              <ProfessorDashboard />
            </PrivateRoute>
          } />

          <Route path="/enseignant/questionnaire/:templateCode" element={
            <PrivateRoute>
              <AnswerQuestionnaire />
            </PrivateRoute>
          } />

          <Route path="/pro/dashboard" element={
            <PrivateRoute>
              <ProfessionalDashboard />
            </PrivateRoute>
          } />

          <Route path="/professionnel/questionnaire/:templateCode" element={
            <PrivateRoute>
              <AnswerQuestionnaireProfessional />
            </PrivateRoute>
          } />

          <Route path="/etudiant/dashboard" element={
            <PrivateRoute>
              <StudentDashboard />
            </PrivateRoute>
          } />

          <Route path="/etudiant/questionnaire/:templateCode" element={
            <PrivateRoute>
              <AnswerQuestionnaireStudent />
            </PrivateRoute>
          } />
        </Routes>
        
        {/* Notice de d√©ploiement */}
        <DeploymentNotice />
      </Router>
    </AuthProvider>
  );
}

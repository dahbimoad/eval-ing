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
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forget" element={<Forget />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="/redirect" element={<FirstLoginRedirect />} />

          {/* 🔐 Routes protégées - Commentées pour le développement sans backend
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
          */}
          
          {/* 🚨 Routes temporairement publiques pour le développement sans backend
               À remplacer par les routes protégées ci-dessus avant déploiement */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/ProfileCompletion" element={<ProfileCompletion />} />
          <Route path="/admin/etud" element={<Students />} />
          <Route path="/admin/ens" element={<Enseignants />} />
          <Route path="/admin/pro" element={<Pro />} />
          <Route path="/admin/statistics" element={<Statistics />} />
        
        </Routes>
      </Router>
    </AuthProvider>
  );
}

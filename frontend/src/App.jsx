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
import { AuthProvider } from './context/AuthContext.jsx';
export default function App() {
  return (
    <AuthProvider>
    <Router>

      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/forget" element={<Forget/>}/>
        <Route path="/reset" element={<Reset/>}/>
        <Route path="/admin" element={<Admin/>}/>
        <Route path="/admin/etud" element={<Students/>}/>
        <Route path="/admin/ens" element={<Enseignants/>}/>
        <Route path="/admin/pro" element={<Pro/>}/>

      </Routes>

    </Router>
    </AuthProvider>
  );
}
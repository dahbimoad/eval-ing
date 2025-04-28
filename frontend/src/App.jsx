import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Login from "./Components/auth/Login";

export default function App() {
  return (
    <Router>

      <Routes>
        <Route path="/login" element={<Login/>}/>
      </Routes>

    </Router>
  );
}
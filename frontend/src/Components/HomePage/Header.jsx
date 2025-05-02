import React from 'react';
import { Link } from 'react-router-dom';
import logo from "../images/HomePage/Eval.png";

function Header(){
  return (
    <div className="bg-blue-600 text-white ">
      <header className="max-w-screen-xl mx-auto p-6 flex justify-between items-center animate-slide-up">
        <div className="flex items-center space-x-4">
          <img href="/" src={logo} alt="" className="w-64 h-auto " />
        </div>
        
        <nav>
          <ul className="flex space-x-8">
            <li><a href="/" className="hover:opacity-80">Home</a></li>
            <li><a href="#function" className="hover:opacity-80">Fonctionalités</a></li>
            <li><a href="#about" className="hover:opacity-80">About</a></li>
            <li><a href="#contact" className="hover:opacity-80">Contact</a></li>
          </ul>
        </nav>
        
        <Link to="/login">
        <button className="bg-yellow-400 text-black px-6 py-2 rounded-lg hover:bg-yellow-300">
          Se connecter
        </button>
        </Link>
      </header>

      
    </div>
  );
};

export default Header;

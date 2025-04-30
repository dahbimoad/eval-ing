import React from "react";
import section1 from '../images/section1.png';
import { Link } from 'react-router-dom'; 


function Section1(){
    return(
    <div className="">
        
    <div className="relative text-center bg-gradient-to-r from-blue-800 to-indigo-800 p-40 ">
        <div className="absolute inset-0 bg-cover bg-center opacity-30 " style={{ backgroundImage: `url(${section1})` }}></div>
        
        <div className="relative z-10 ">
            <h1 className="text-5xl font-extrabold text-white leading-relaxed animate-slide-up delay-200">
            Bienvenue sur la plateforme
            </h1>
            <h1 className="text-5xl font-extrabold text-yellow-400 space-y-4 leading-relaxed animate-slide-up delay-200">
            d'évaluation des futures ingénieurs
            </h1>
            <p className="text-xl max-w-lg mx-auto text-white leading-loose animate-slide-up delay-200">
            Évaluation efficace et suivi des progrès des étudiants en ingénierie
            </p>

            <div className="space-x-4 ">
                <h1 className="leading-relaxed text-purple-800">.</h1>
            <button className="bg-yellow-400 text-black px-6 py-3 rounded-full hover:bg-yellow-300 animate-slide-up">
                Commencer l’évaluation
            </button>
            <Link to="/login"> 
                <button className="bg-transparent border-2 border-yellow-400 text-yellow-400 px-6 py-3 rounded-full hover:bg-yellow-400 hover:text-black animate-slide-up">
                    Se connecter
                </button>
            </Link>
            </div>
        </div>
    </div>

{/* 
    <div className="bg-indigo-900 py-16">
      <div className="max-w-screen-xl mx-auto text-center flex justify-around space-x-8">
        <div>
          <p className="text-4xl font-bold">3k+</p>
          <p>Etudiants</p>
        </div>
        <div>
          <p className="text-4xl font-bold">6</p>
          <p>Filieres</p>
        </div>
        <div>
          <p className="text-4xl font-bold">10K+</p>
          <p>Instructors</p>
        </div>
      </div>
    </div> */}
    </div>
    )
}

export default Section1;
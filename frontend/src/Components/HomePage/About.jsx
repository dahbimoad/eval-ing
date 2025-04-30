import React from "react";
import { Link } from "react-router-dom";

function About(){
    return(
    <div id="#about" className="bg-indigo-900 py-16">
    <div className="max-w-screen-xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-6">À Propos de Nous</h2>
        <p className="text-lg text-white mb-8">
        EvalIng est une plateforme innovante dédiée à l'évaluation continue des étudiants en ingénierie.
        Nous permettons aux enseignants et administrateurs de suivre efficacement les progrès des étudiants, tout en fournissant un retour détaillé pour chaque évaluation.
        Notre mission est de rendre l'évaluation plus accessible, transparente et précise pour tous les acteurs de l'éducation.
        </p>
        <div className="flex justify-center space-x-8">
        <Link to="#about" className="text-yellow-400 hover:text-yellow-300">En savoir plus</Link>
        <Link to="#contact" className="text-yellow-400 hover:text-yellow-300">Contactez-nous</Link>
        </div>
    </div>
    </div>
    )
}
export default About;
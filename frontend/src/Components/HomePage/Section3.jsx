import React, { useState } from "react";
import img4 from '../images/HomePage/4.png';
import img5 from '../images/HomePage/5.png';
import img6 from '../images/HomePage/6.png';

function Section3() {
    // State pour chaque fonctionnalité
    const [showDetails1, setShowDetails1] = useState(false);
    const [showDetails2, setShowDetails2] = useState(false);
    const [showDetails3, setShowDetails3] = useState(false);

    // Fonction pour basculer l'affichage des détails
    const toggleDetails1 = () => setShowDetails1(!showDetails1);
    const toggleDetails2 = () => setShowDetails2(!showDetails2);
    const toggleDetails3 = () => setShowDetails3(!showDetails3);

    return (
        <div id="#function" className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16 ">
            <h2 className="text-3xl font-bold text-center text-yellow-400 mb-12" >Nos Fonctionnalités</h2>

            <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 a animate-slide-up">
                <div className="flex flex-col justify-center text-center md:text-left text-white transform transition duration-700 hover:translate-x-4 hover:scale-105">
                    <h3 className="text-2xl font-semibold mb-4">Suivi des Progrès</h3>
                    <p className="text-black mb-6">
                        Suivez facilement les progrès des étudiants à travers leurs évaluations. Cette fonctionnalité permet aux enseignants de visualiser l'évolution des performances des étudiants au fil des évaluations.
                    </p>
                </div>
                
                <div className="flex justify-center items-center transform transition duration-700 hover:translate-x-4 hover:scale-105">
                    <img src={img4} alt="Suivi des progrès" />
                </div>
            </div>
            <div className="text-center  animate-slide-up">
                <button 
                    onClick={toggleDetails1}
                    className="bg-yellow-400 text-black px-6 py-2 rounded-full hover:bg-yellow-300"
                >
                    {showDetails1 ? "Moins de détails" : "Plus de détails"}
                </button>
                {/* Box contenant la description supplémentaire */}
                {showDetails1 && (
                    <div className="mt-6 bg-white text-black p-4 px-8 rounded-lg shadow-lg">
                        {/* <h4 className="text-xl font-semibold">Description détaillée :</h4> */}
                        <p>
                            Elle permet également aux étudiants de recevoir un retour en temps réel sur leurs résultats, facilitant ainsi leur amélioration continue.
                            Grâce à un tableau de bord interactif, les étudiants peuvent voir l'impact de leurs efforts et ajuster leur apprentissage.
                        </p>
                    </div>
                )}
            </div>

            {/* Fonctionnalité 2 - Feedback Détaillé */}
            <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 mt-16  animate-slide-up">
                <div className="flex justify-center items-center transform transition duration-700 hover:-translate-x-4 hover:scale-105">
                    <img src={img5} alt="Feedback" />
                </div>
                <div className="flex flex-col justify-center text-center md:text-left text-white transform transition duration-700 hover:translate-x-4 hover:scale-105">
                    <h3 className="text-2xl font-semibold mb-4">Feedback Détaillé</h3>
                    <p className="text-black mb-6">
                        Les enseignants peuvent fournir des retours détaillés pour chaque évaluation, offrant une analyse précise et constructive des points forts et des axes d'amélioration.
                    </p>
                </div>
            </div>
            <div className="text-center animate-slide-up">
                <button 
                    onClick={toggleDetails2}
                    className="bg-yellow-400 text-black px-6 py-2 rounded-full hover:bg-yellow-300"
                >
                    {showDetails2 ? "Moins de détails" : "Plus de détails"}
                </button>
                {/* Box contenant la description supplémentaire */}
                {showDetails2 && (
                    <div className="mt-6 bg-white text-black p-4 px-8 rounded-lg shadow-lg">
                        {/* <h4 className="text-xl font-semibold">Description détaillée :</h4> */}
                        <p>
                            Cette fonctionnalité permet une meilleure communication entre les enseignants et les étudiants. Les retours peuvent être à la fois détaillés et personnalisés, offrant une analyse approfondie.
                            Les étudiants peuvent suivre ces retours à tout moment pour une meilleure progression.
                        </p>
                    </div>
                )}
            </div>

            {/* Fonctionnalité 3 - Rapports d’Évaluation */}
            <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 mt-16 animate-slide-up">
                <div className="flex flex-col justify-center text-center md:text-left text-white transform transition duration-700 hover:translate-x-4 hover:scale-105">
                    <h3 className="text-2xl font-semibold mb-4">Rapports d’Évaluation</h3>
                    <p className="text-black mb-6">
                        Générez facilement des rapports d’évaluation détaillés pour suivre les performances des étudiants sur le long terme. Ces rapports sont conçus pour être clairs et complets,
                        offrant des graphiques et des analyses statistiques des résultats. 
                    </p>
                </div>
                <div className="flex justify-center items-center transform transition duration-700 hover:translate-x-4 hover:scale-105">
                    <img src={img6} alt="Rapports d’évaluation" />
                </div>
            </div>
            <div className="text-center animate-slide-up ">
                <button 
                    onClick={toggleDetails3}
                    className="bg-yellow-400 text-black px-6 py-2 rounded-full hover:bg-yellow-300"
                >
                    {showDetails3 ? "Moins de détails" : "Plus de détails"}
                </button>
                {/* Box contenant la description supplémentaire */}
                {showDetails3 && (
                    <div className="mt-6 bg-white text-black p-4 px-8 rounded-lg shadow-lg">
                        {/* <h4 className="text-xl font-semibold">Description détaillée :</h4> */}
                        <p>
                            Grâce à ces rapports, les enseignants peuvent avoir une vue d'ensemble de la performance des étudiants sur différentes périodes. Les graphiques permettent une lecture facile et rapide des données.
                            Ces rapports servent également à planifier des stratégies pédagogiques et à identifier les domaines nécessitant des améliorations.
                        </p>
                    </div>
                )}
            </div>


        </div>
    );
}

export default Section3;

import React from "react";
import img1 from "../images/1.png"
import img2 from "../images/2.png"
import img3 from "../images/3.png"

function Section2(){
    return(
        <div id="function" className="text-white text-center py-16 animate-slide-from-bottom">
        <h2 className="text-3xl font-bold text-blue-900">Comment ça marche</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div>
            <img src={img1} alt="Step 1" className="mx-auto transform transition duration-700 hover:translate-y-4 hover:scale-105" />
            <h3 className="text-xl font-semibold text-blue-900">Création de l’évaluation</h3>
            <p className="text-black">Les administrateurs définissent les critères d’évaluation.</p>
            </div>
            <div>
            <img src={img2} alt="Step 2" className="mx-auto transform transition duration-700 hover:translate-y-4 hover:scale-105" />
            <h3 className="text-xl font-semibold text-blue-900">Soumission des évaluations</h3>
            <p className="text-black">Les étudiants et les enseignats soumettent leurs travaux.</p>
            </div>
            <div>
            <img src={img3} alt="Step 3" className="mx-auto transform transition duration-700 hover:translate-y-4 hover:scale-105" />
            <h3 className="text-xl font-semibold text-blue-900">Analyse des résultats</h3>
            <p className="text-black">Les administrateurs notent et analysent les résultats.</p>
            </div>
        </div>
        

</div>

    )
}
export default Section2;
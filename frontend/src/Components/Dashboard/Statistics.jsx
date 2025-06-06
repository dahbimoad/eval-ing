// frontend/src/Components/Dashboard/Statistics.jsx
import React from "react";
import Sidebar from "./Sidebar";

function Statistics() {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar />
            <div className="h-full w-full overflow-auto p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
                        <span className="text-yellow-500">Statistiques</span> Page
                    </h1>
                </div>
            </div>
        </div>
    );
}

export default Statistics;
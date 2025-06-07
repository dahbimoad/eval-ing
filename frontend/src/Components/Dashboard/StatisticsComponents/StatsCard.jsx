import React from 'react';

const StatsCard = ({ title, value, icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500", 
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
    red: "bg-red-500"
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center">
        <div className={`${colorClasses[color]} p-3 rounded-full text-white mr-4`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard; 
import React from 'react';

export default function ScoreboardPage() {
  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Scoreboard</h1>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700">Current Standings</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {/* Example scoreboard entry */}
            <div className="p-4 flex justify-between items-center hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-900">1</span>
                <div>
                  <h3 className="font-medium text-gray-900">Team A</h3>
                  <p className="text-sm text-gray-500">3 correct answers</p>
                </div>
              </div>
              <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
                250 points
              </span>
            </div>
            
            <div className="p-4 flex justify-between items-center hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-900">2</span>
                <div>
                  <h3 className="font-medium text-gray-900">Team B</h3>
                  <p className="text-sm text-gray-500">2 correct answers</p>
                </div>
              </div>
              <span className="px-3 py-1 text-sm font-semibold text-blue-800 bg-blue-100 rounded-full">
                180 points
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
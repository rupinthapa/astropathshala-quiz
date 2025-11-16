import React from 'react';

export default function DisplayPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Quiz Display
        </h1>
        <div className="text-center text-gray-600">
          <p>This is the display page for the quiz application.</p>
          <p className="mt-2">Content will be shown here during the quiz.</p>
        </div>
      </div>
    </main>
  );
}
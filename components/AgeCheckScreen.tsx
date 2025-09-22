import React, { useState } from 'react';

interface AgeCheckScreenProps {
  question: { a: number; b: number };
  onSuccess: () => void;
  onBack: () => void;
}

export const AgeCheckScreen: React.FC<AgeCheckScreenProps> = ({ question, onSuccess, onBack }) => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const correctAnswer = question.a * question.b;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(answer) === correctAnswer) {
      onSuccess();
    } else {
      setError('Incorrect answer. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-cyan-500/20 text-center">
      <h2 className="text-2xl font-orbitron font-bold mb-4">Verification Required</h2>
      <p className="text-gray-300 mb-6">To access AI features, please solve this simple math problem.</p>
      
      <form onSubmit={handleSubmit}>
        <label htmlFor="ageCheck" className="text-4xl font-bold mb-4 block">
          {question.a} x {question.b} = ?
        </label>
        <input
          id="ageCheck"
          type="number"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            setError('');
          }}
          className="w-full max-w-xs mx-auto p-3 text-2xl text-center bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-white"
        />
        {error && <p className="text-red-400 mt-2">{error}</p>}
        <div className="mt-6 flex justify-center gap-4">
          <button type="button" onClick={onBack} className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-md font-bold transition-transform transform hover:scale-105">
            Back
          </button>
          <button type="submit" className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-md font-bold transition-transform transform hover:scale-105">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};
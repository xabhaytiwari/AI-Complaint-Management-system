import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Complaint, ComplaintStatus } from '../types';
import { GoogleGenAI } from '@google/genai';

interface ComplaintFormProps {
  onClose: () => void;
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({ onClose }) => {
  const context = useContext(AppContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!context) return null;

  const { addComplaint, currentUser } = context;

  const handleAIDraft = async () => {
    if (!title.trim()) {
        setError('Please enter a title first to get an AI-drafted description.');
        return;
    }
    setError('');
    setIsLoading(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the complaint title "${title}", draft a detailed and formal complaint description. The description should be suitable for an official submission. Be clear, concise, and professional. Include placeholders like [Date], [Time], [Location], and [Names of people involved] for the user to fill in specific details.`,
        });
        
        setDescription(response.text);
    } catch (err) {
        console.error("AI draft error:", err);
        setError('Failed to get a draft from the AI. Please try again or write your own.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
        setError('Title and description are required.');
        return;
    }
    const newComplaint: Complaint = {
      id: `complaint-${Date.now()}`,
      title,
      description,
      status: ComplaintStatus.Submitted,
      submittedBy: currentUser.id,
      createdAt: new Date().toISOString(),
      history: [
        { status: ComplaintStatus.Submitted, timestamp: new Date().toISOString(), actor: currentUser.name }
      ]
    };
    addComplaint(newComplaint);
    onClose();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
        {error && <p className="mb-4 text-red-600 bg-red-100 p-3 rounded-md dark:text-red-200 dark:bg-red-900">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="title" className="block text-base font-medium text-gray-700 dark:text-gray-300">Title</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    placeholder="e.g., Noise violation from neighbor"
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-base font-medium text-gray-700 dark:text-gray-300">Describe your complaint</label>
                <textarea
                    id="description"
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    placeholder="Provide as much detail as possible. What happened, where, when, and who was involved?"
                />
            </div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                 <button
                    type="button"
                    onClick={handleAIDraft}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Drafting...' : 'Draft with AI Assistant'}
                </button>
                <div className="flex gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">Cancel</button>
                    <button type="submit" className="px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">Submit Complaint</button>
                </div>
            </div>
        </form>
    </div>
  );
};

export default ComplaintForm;

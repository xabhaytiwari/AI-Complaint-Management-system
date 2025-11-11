import React, { useState, useContext } from 'react';
import { Complaint, Role, AITask } from '../types';
import { AppContext } from '../context/AppContext';
import { GoogleGenAI } from '@google/genai';

interface AIAssistantProps {
  complaint: Complaint;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ complaint }) => {
  const context = useContext(AppContext);
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  if (!context) return null;
  const { currentUser } = context;

  const handleAIAssist = async (task: AITask) => {
    setAiResponse('');
    setError('');
    setIsLoading(true);

    let prompt = '';
    switch(task) {
        case AITask.SUGGEST_LEGAL_ROUTES:
            prompt = `I am a complainer. My complaint is about '${complaint.title}' with the description: '${complaint.description}'. The current status is '${complaint.status}'. Based on this, what are the potential legal routes or next steps I can take? Be concise and provide actionable advice. Format the response using markdown.`;
            break;
        case AITask.CHECK_STATUS_EXPLANATION:
            prompt = `My complaint about '${complaint.title}' has a status of '${complaint.status}'. Explain what this status means in simple terms and what is happening with my complaint right now.`;
            break;
        case AITask.PROACTIVE_SUGGESTIONS:
            prompt = `Given my complaint ('${complaint.title}') and its current status ('${complaint.status}'), what should I proactively do next to support my case or prepare for the next stage?`;
            break;
        case AITask.LEGAL_INTERPRETATION:
            prompt = `As a ${currentUser.role}, I am handling a complaint titled '${complaint.title}' with the description '${complaint.description}'. ${complaint.inspectorReport ? `The inspector's report states: '${complaint.inspectorReport}'.` : ''} Provide a brief legal interpretation of this situation, highlighting key legal points or regulations that might apply. Focus on aspects relevant to my role. Format the response using markdown.`;
            break;
        default:
            setError("Unknown AI task.");
            setIsLoading(false);
            return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        setAiResponse(response.text);
    } catch (err) {
        console.error("AI assist error:", err);
        if (err instanceof Error && err.message.includes('API key not valid')) {
            setError('The API key is not valid. Please check your configuration.');
        } else {
            setError('Failed to get a response from the AI assistant. Please try again.');
        }
    } finally {
        setIsLoading(false);
    }
  };

  const renderRoleSpecificTasks = () => {
    switch (currentUser.role) {
      case Role.Complainer:
        return (
          <>
            <AITaskButton task={AITask.SUGGEST_LEGAL_ROUTES} text="Suggest Legal Routes" />
            <AITaskButton task={AITask.CHECK_STATUS_EXPLANATION} text="Explain Current Status" />
            <AITaskButton task={AITask.PROACTIVE_SUGGESTIONS} text="What Should I Do Next?" />
          </>
        );
      case Role.Inspector:
      case Role.Prosecutor:
        return <AITaskButton task={AITask.LEGAL_INTERPRETATION} text="Get Legal Interpretation" />;
      default:
        return null;
    }
  };

  const AITaskButton: React.FC<{ task: AITask; text: string; }> = ({ task, text }) => (
    <button
      onClick={() => handleAIAssist(task)}
      disabled={isLoading}
      className="w-full text-left px-4 py-3 text-base font-medium text-white bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white disabled:bg-gray-500 disabled:cursor-not-allowed"
    >
      {text}
    </button>
  );

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg h-full flex flex-col">
      <h4 className="text-xl font-bold mb-4 flex items-center">
        <svg className="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        AI Legal Assistant
      </h4>
      <div className="space-y-3 mb-4">
        {renderRoleSpecificTasks()}
      </div>
      <div className="flex-grow bg-gray-900 rounded-md p-4 overflow-y-auto min-h-[200px]">
        {isLoading && (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <span className="ml-3 text-base">Getting assistance...</span>
            </div>
        )}
        {error && <p className="text-red-400 text-base">{error}</p>}
        {aiResponse && !isLoading && <div className="text-gray-300 whitespace-pre-wrap text-base">{aiResponse}</div>}
        {!aiResponse && !error && !isLoading && <p className="text-gray-500 text-base">Select an action above to get assistance.</p>}
      </div>
    </div>
  );
};

export default AIAssistant;

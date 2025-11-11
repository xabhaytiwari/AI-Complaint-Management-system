
import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Complaint, ComplaintStatus, Role, User, ChatMessage } from '../types';
import AIAssistant from './AIAssistant';

interface ComplaintDetailProps {
  complaintId: string;
  onBack: () => void;
}

const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.Submitted:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case ComplaintStatus.AssignedToInspector:
      case ComplaintStatus.InvestigationInProgress:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case ComplaintStatus.ReportSubmitted:
      case ComplaintStatus.ReadyForProsecution:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case ComplaintStatus.ActionTaken:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case ComplaintStatus.Closed:
        return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

const ChatWindow: React.FC<{ complaint: Complaint }> = ({ complaint }) => {
    const context = useContext(AppContext);
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [complaint.chat]);

    if (!context) return null;
    const { currentUser, updateComplaint, users } = context;

    const canChat = () => {
        if (!complaint.assignedTo && currentUser.role !== Role.Commissioner) return false;
        switch (currentUser.role) {
            case Role.Complainer:
                return !!complaint.assignedTo;
            case Role.Inspector:
                return currentUser.id === complaint.assignedTo;
            case Role.Prosecutor:
                return [ComplaintStatus.ReportSubmitted, ComplaintStatus.ReadyForProsecution, ComplaintStatus.ActionTaken].includes(complaint.status);
            default:
                return false;
        }
    };

    if (!canChat()) {
        return null;
    }
    
    const complainer = users.find(u => u.id === complaint.submittedBy);
    const inspector = users.find(u => u.id === complaint.assignedTo);
    
    const participants: User[] = [complainer, inspector].filter((u): u is User => !!u);
    
    const hasProsecutorInChat = (complaint.chat || []).some(m => users.find(u => u.id === m.senderId)?.role === Role.Prosecutor);

    if (currentUser.role === Role.Prosecutor || hasProsecutorInChat) {
        const prosecutorInChat = users.find(u => (complaint.chat || []).some(m => m.senderId === u.id && u.role === Role.Prosecutor)) || (currentUser.role === Role.Prosecutor ? currentUser : null);
        if (prosecutorInChat && !participants.find(p => p.id === prosecutorInChat.id)) {
            participants.push(prosecutorInChat);
        }
    }

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message: ChatMessage = {
            senderId: currentUser.id,
            senderName: currentUser.name,
            text: newMessage.trim(),
            timestamp: new Date().toISOString(),
        };

        const updatedComplaint: Complaint = {
            ...complaint,
            chat: [...(complaint.chat || []), message],
        };

        updateComplaint(updatedComplaint);
        setNewMessage('');
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg flex flex-col h-full max-h-[70vh]">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Live Chat</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Participants: {participants.map(p => p.name.split(' ')[0]).join(', ')}
                </p>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="space-y-4">
                    {(complaint.chat || []).map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex flex-col space-y-1 text-base max-w-xs mx-2 ${msg.senderId === currentUser.id ? 'order-1 items-end' : 'order-2 items-start'}`}>
                                <div>
                                    <span className={`px-4 py-2 rounded-lg inline-block ${msg.senderId === currentUser.id ? 'rounded-br-none bg-blue-600 text-white' : 'rounded-bl-none bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                        {msg.text}
                                    </span>
                                </div>
                                 <span className="text-sm text-gray-400">{msg.senderName.split(' ')[0]} - {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-grow block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        aria-label="Chat message input"
                    />
                    <button type="submit" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" aria-label="Send message">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};


const ComplaintDetail: React.FC<ComplaintDetailProps> = ({ complaintId, onBack }) => {
  const context = useContext(AppContext);
  
  if (!context) return null;

  const { complaints, updateComplaint, currentUser, users } = context;
  const complaint = complaints.find(c => c.id === complaintId);

  const [investigationNotes, setInvestigationNotes] = useState(complaint?.investigationNotes || '');
  const [inspectorReport, setInspectorReport] = useState(complaint?.inspectorReport || '');
  const [prosecutorDecision, setProsecutorDecision] = useState(complaint?.prosecutorDecision || '');
  const [assignee, setAssignee] = useState(complaint?.assignedTo || '');
  
  if (!complaint) {
    return <div>Complaint not found.</div>;
  }

  const findUser = (id: string) => users.find(u => u.id === id);

  const handleUpdate = (status: ComplaintStatus, updates: Partial<Complaint>) => {
    const newHistoryEntry = { status, timestamp: new Date().toISOString(), actor: currentUser.name };
    const updatedComplaint: Complaint = {
      ...complaint,
      status,
      history: [...complaint.history, newHistoryEntry],
      ...updates,
    };
    updateComplaint(updatedComplaint);
  };
  
  const inspectors = users.filter(u => u.role === Role.Inspector);

  const renderActions = () => {
    switch(currentUser.role) {
      case Role.Complainer:
        if (complaint.status !== ComplaintStatus.Closed) {
            return (
                <div className="mt-4">
                    <button
                        onClick={() => handleUpdate(ComplaintStatus.Closed, {})}
                        className="px-4 py-2 text-base bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Close Complaint
                    </button>
                </div>
            );
        }
        return null;
      case Role.Commissioner:
        if (complaint.status === ComplaintStatus.Submitted) {
          return (
            <div className="flex items-center space-x-4 mt-4">
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md">
                <option value="">Select Inspector</option>
                {inspectors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
              <button onClick={() => handleUpdate(ComplaintStatus.AssignedToInspector, { assignedTo: assignee })} disabled={!assignee} className="px-4 py-2 text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">Assign</button>
            </div>
          );
        }
        if (complaint.status === ComplaintStatus.ActionTaken) {
            return <button onClick={() => handleUpdate(ComplaintStatus.Closed, {})} className="px-4 py-2 text-base bg-gray-600 text-white rounded-md hover:bg-gray-700">Mark as Closed</button>;
        }
        return null;
        
      case Role.Inspector:
        if (complaint.status === ComplaintStatus.AssignedToInspector) {
          return (
            <div className="mt-4">
              <button
                onClick={() => handleUpdate(ComplaintStatus.InvestigationInProgress, {})}
                className="px-4 py-2 text-base bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Start Investigation
              </button>
            </div>
          );
        }
        if (complaint.status === ComplaintStatus.InvestigationInProgress) {
          return (
            <div className="mt-4 space-y-6">
              <div>
                <label htmlFor="investigation-notes" className="block text-base font-medium text-gray-700 dark:text-gray-300">
                  Investigation Notes
                </label>
                <textarea
                  id="investigation-notes"
                  value={investigationNotes}
                  onChange={(e) => setInvestigationNotes(e.target.value)}
                  placeholder="Add ongoing notes about your investigation here. These will be saved with your final report."
                  className="mt-1 w-full p-2 border rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 text-base"
                  rows={4}
                ></textarea>
              </div>
              <div>
                <label htmlFor="inspector-report" className="block text-base font-medium text-gray-700 dark:text-gray-300">
                  Final Inspector Report
                </label>
                <textarea
                  id="inspector-report"
                  value={inspectorReport}
                  onChange={(e) => setInspectorReport(e.target.value)}
                  placeholder="Enter the final, conclusive report here."
                  className="mt-1 w-full p-2 border rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 text-base"
                  rows={4}
                ></textarea>
                <button
                  onClick={() => handleUpdate(ComplaintStatus.ReportSubmitted, { inspectorReport, investigationNotes })}
                  disabled={!inspectorReport}
                  className="mt-2 px-4 py-2 text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Submit Final Report
                </button>
              </div>
            </div>
          );
        }
        return null;

      case Role.Prosecutor:
        if (complaint.status === ComplaintStatus.ReportSubmitted) {
          return (
            <div className="mt-4">
              <textarea value={prosecutorDecision} onChange={(e) => setProsecutorDecision(e.target.value)} placeholder="Enter prosecutor decision..." className="w-full p-2 border rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 text-base" rows={4}></textarea>
              <button onClick={() => handleUpdate(ComplaintStatus.ActionTaken, { prosecutorDecision })} disabled={!prosecutorDecision} className="mt-2 px-4 py-2 text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">Submit Decision</button>
            </div>
          );
        }
        return null;
        
      default:
        return null;
    }
  };

  const DetailSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
      <dt className="text-base font-medium text-gray-500 dark:text-gray-400">{title}</dt>
      <dd className="mt-1 text-base text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">{children}</dd>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-medium leading-6 text-gray-900 dark:text-gray-100">{complaint.title}</h3>
            <p className="mt-1 max-w-2xl text-base text-gray-500 dark:text-gray-400">Complaint ID: {complaint.id}</p>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Back</span>
          </button>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <dl className="divide-y divide-gray-200 dark:divide-gray-700">
            <DetailSection title="Status"><span className={`px-2 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(complaint.status)}`}>{complaint.status}</span></DetailSection>
            <DetailSection title="Description"><p className="whitespace-pre-wrap">{complaint.description}</p></DetailSection>
            <DetailSection title="Submitted By">{findUser(complaint.submittedBy)?.name || 'Unknown'}</DetailSection>
            <DetailSection title="Date Submitted">{new Date(complaint.createdAt).toLocaleString()}</DetailSection>
            {complaint.assignedTo && <DetailSection title="Assigned Inspector">{findUser(complaint.assignedTo)?.name || 'Unknown'}</DetailSection>}
            {complaint.investigationNotes && <DetailSection title="Investigation Notes"><p className="whitespace-pre-wrap">{complaint.investigationNotes}</p></DetailSection>}
            {complaint.inspectorReport && <DetailSection title="Inspector Report"><p className="whitespace-pre-wrap">{complaint.inspectorReport}</p></DetailSection>}
            {complaint.prosecutorDecision && <DetailSection title="Prosecutor Decision"><p className="whitespace-pre-wrap">{complaint.prosecutorDecision}</p></DetailSection>}
            
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-base font-medium text-gray-500 dark:text-gray-400">History</dt>
              <dd className="mt-1 text-base text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">
                <ul className="space-y-4">
                  {complaint.history.map((h, i) => (
                    <li key={i} className="flex items-start">
                        <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                        <div className="ml-3">
                            <p className="font-semibold dark:text-gray-100">{h.status}</p>
                            <p className="text-base text-gray-500 dark:text-gray-400">by {h.actor} on {new Date(h.timestamp).toLocaleString()}</p>
                        </div>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>

            <div className="px-4 py-5 sm:px-6">
                {renderActions()}
            </div>
          </dl>
        </div>
      </div>

      <div className="lg:col-span-1">
        <ChatWindow complaint={complaint} />
      </div>
      <div className="lg:col-span-1">
        <AIAssistant complaint={complaint} />
      </div>
    </div>
  );
};

export default ComplaintDetail;

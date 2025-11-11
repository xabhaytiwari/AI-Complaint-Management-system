import React, { useState, useMemo, useEffect } from 'react';
import { AppContext } from './context/AppContext';
import { User, Complaint } from './types';
import { USERS, INITIAL_COMPLAINTS } from './constants';
import Dashboard from './components/Dashboard';
import RoleSwitcher from './components/RoleSwitcher';
import Login from './components/Login';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const savedComplaints = localStorage.getItem('complaints');
      return savedComplaints ? JSON.parse(savedComplaints) : INITIAL_COMPLAINTS;
    } catch (error) {
      console.error('Failed to parse complaints from localStorage:', error);
      return INITIAL_COMPLAINTS;
    }
  });
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('complaints', JSON.stringify(complaints));
    } catch (error) {
      console.error('Failed to save complaints to localStorage:', error);
    }
  }, [complaints]);

  const handleSetCurrentUser = (user: User) => {
    // When switching users, reset the selected complaint to avoid showing details that don't apply to the new role.
    setSelectedComplaintId(null);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setSelectedComplaintId(null);
    setCurrentUser(null);
  };

  const updateComplaint = (updatedComplaint: Complaint) => {
    setComplaints(prevComplaints =>
      prevComplaints.map(c => (c.id === updatedComplaint.id ? updatedComplaint : c))
    );
  };
  
  const addComplaint = (newComplaint: Complaint) => {
    setComplaints(prevComplaints => [newComplaint, ...prevComplaints]);
  };

  const contextValue = useMemo(() => {
    if (!currentUser) return null;
    return {
      currentUser,
      setCurrentUser: handleSetCurrentUser,
      logout: handleLogout,
      complaints,
      updateComplaint,
      addComplaint,
      selectedComplaintId,
      setSelectedComplaintId,
      users: USERS,
    };
  }, [currentUser, complaints, selectedComplaintId]);

  // If no user is logged in, show the Login screen
  if (!currentUser || !contextValue) {
    return <Login onLogin={setCurrentUser} />;
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
        <header className="bg-white dark:bg-gray-800 shadow-md">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 max-w-screen-xl mx-auto">
              <div className="flex items-center space-x-2">
                <svg className="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">AI Complaint Management System</h1>
              </div>
              <RoleSwitcher />
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto">
          <Dashboard />
        </main>
      </div>
    </AppContext.Provider>
  );
};

export default App;

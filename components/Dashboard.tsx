
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Role } from '../types';
import ComplaintList from './ComplaintList';
import ComplaintDetail from './ComplaintDetail';
import ComplaintForm from './ComplaintForm';

const Dashboard: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) return null;

  const { currentUser, selectedComplaintId, setSelectedComplaintId } = context;
  
  const [showComplaintForm, setShowComplaintForm] = React.useState(false);

  const handleBackToList = () => {
    setSelectedComplaintId(null);
  };
  
  const handleShowComplaintForm = () => {
    setSelectedComplaintId(null);
    setShowComplaintForm(true);
  }
  
  const handleFormClose = () => {
    setShowComplaintForm(false);
  }

  const renderContent = () => {
    if (selectedComplaintId) {
      return <ComplaintDetail complaintId={selectedComplaintId} onBack={handleBackToList} />;
    }
    
    if (showComplaintForm && currentUser.role === Role.Complainer) {
        return <ComplaintForm onClose={handleFormClose} />;
    }

    return <ComplaintList />;
  };
  
  const getDashboardTitle = () => {
    if (selectedComplaintId) return "Complaint Details";
    if (showComplaintForm) return "File a New Complaint";
    return `${currentUser.role}'s Dashboard`;
  }

  return (
    <div>
       <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{getDashboardTitle()}</h2>
        {currentUser.role === Role.Complainer && !showComplaintForm && !selectedComplaintId && (
            <button
                onClick={handleShowComplaintForm}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                File New Complaint
            </button>
        )}
      </div>
      {renderContent()}
    </div>
  );
};

export default Dashboard;

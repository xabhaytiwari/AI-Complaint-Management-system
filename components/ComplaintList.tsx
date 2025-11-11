import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Complaint, Role, ComplaintStatus } from '../types';

const ComplaintList: React.FC = () => {
  const context = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');

  if (!context) return null;

  const { complaints, currentUser, setSelectedComplaintId } = context;

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

  const roleFilteredComplaints = complaints.filter(c => {
    switch (currentUser.role) {
      case Role.Complainer:
        return c.submittedBy === currentUser.id;
      case Role.Inspector:
        return c.assignedTo === currentUser.id && (c.status === ComplaintStatus.AssignedToInspector || c.status === ComplaintStatus.InvestigationInProgress);
      case Role.Commissioner:
        return true; // See all complaints
      case Role.Prosecutor:
        return c.status === ComplaintStatus.ReportSubmitted || c.status === ComplaintStatus.ReadyForProsecution;
      default:
        return false;
    }
  });

  const searchFilteredComplaints = roleFilteredComplaints.filter(c => 
    c.id.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );


  return (
    <div className="space-y-6">
       <div className="bg-white dark:bg-gray-800 shadow sm:rounded-md p-4">
            <input
                type="text"
                placeholder="Search by Complaint ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                aria-label="Search complaints by ID"
            />
        </div>

      {searchFilteredComplaints.length === 0 ? (
        <div className="text-center py-10 px-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {roleFilteredComplaints.length === 0 
              ? "No complaints to display for your role." 
              : "No complaints match your search."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
            {searchFilteredComplaints.map((complaint) => (
              <li key={complaint.id}>
                <a href="#" onClick={(e) => { e.preventDefault(); setSelectedComplaintId(complaint.id); }} className="block hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-medium text-blue-600 dark:text-blue-400 truncate">{complaint.title}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-base text-gray-500 dark:text-gray-400">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          ID: {complaint.id}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-base text-gray-500 dark:text-gray-400 sm:mt-0">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <p>
                          Submitted on <time dateTime={complaint.createdAt}>{new Date(complaint.createdAt).toLocaleDateString()}</time>
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ComplaintList;

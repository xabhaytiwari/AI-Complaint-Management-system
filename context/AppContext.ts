import React, { createContext } from 'react';
import { User, Complaint } from '../types';

interface IAppContext {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  logout: () => void;
  complaints: Complaint[];
  updateComplaint: (complaint: Complaint) => void;
  addComplaint: (complaint: Complaint) => void;
  selectedComplaintId: string | null;
  setSelectedComplaintId: (id: string | null) => void;
  users: User[];
}

export const AppContext = createContext<IAppContext | null>(null);

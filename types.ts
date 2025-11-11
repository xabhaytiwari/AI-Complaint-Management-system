
export enum Role {
  Complainer = 'Complainer',
  Inspector = 'Inspector',
  Commissioner = 'Commissioner',
  Prosecutor = 'Prosecutor',
}

export enum ComplaintStatus {
  Submitted = 'Submitted',
  AssignedToInspector = 'Assigned to Inspector',
  InvestigationInProgress = 'Investigation in Progress',
  ReportSubmitted = 'Report Submitted',
  ReadyForProsecution = 'Ready for Prosecution',
  ActionTaken = 'Action Taken',
  Closed = 'Closed',
}

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface ChatMessage {
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  submittedBy: string; // User ID
  assignedTo?: string; // User ID
  investigationNotes?: string;
  inspectorReport?: string;
  prosecutorDecision?: string;
  chat?: ChatMessage[];
  history: {
    status: ComplaintStatus;
    timestamp: string;
    actor: string; // User Name
  }[];
  createdAt: string;
}

export enum AITask {
    DRAFT_COMPLAINT = 'DRAFT_COMPLAINT',
    SUGGEST_LEGAL_ROUTES = 'SUGGEST_LEGAL_ROUTES',
    CHECK_STATUS_EXPLANATION = 'CHECK_STATUS_EXPLANATION',
    LEGAL_INTERPRETATION = 'LEGAL_INTERPRETATION',
    PROACTIVE_SUGGESTIONS = 'PROACTIVE_SUGGESTIONS',
}
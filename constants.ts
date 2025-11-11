import { Role, User, Complaint, ComplaintStatus } from './types';

export const ROLES: Role[] = [Role.Complainer, Role.Inspector, Role.Commissioner, Role.Prosecutor];

export const USERS: User[] = [
  { id: 'user-1', name: 'Alice (Complainer)', role: Role.Complainer },
  { id: 'user-2', name: 'Bob (Inspector)', role: Role.Inspector },
  { id: 'user-3', name: 'Charlie (Commissioner)', role: Role.Commissioner },
  { id: 'user-4', name: 'Diana (Prosecutor)', role: Role.Prosecutor },
  { id: 'user-5', name: 'Eve (Inspector)', role: Role.Inspector },
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'complaint-1678886400000',
    title: 'Noise violation from construction site',
    description: 'Constant loud noise from the construction site at 123 Main St, starting before 7 AM on weekdays. This has been happening since [Date]. It disrupts sleep and work.',
    status: ComplaintStatus.AssignedToInspector,
    submittedBy: 'user-1', // Alice
    assignedTo: 'user-2', // Bob
    createdAt: new Date('2023-03-15T10:00:00Z').toISOString(),
    history: [
      { status: ComplaintStatus.Submitted, timestamp: new Date('2023-03-15T10:00:00Z').toISOString(), actor: 'Alice (Complainer)' },
      { status: ComplaintStatus.AssignedToInspector, timestamp: new Date('2023-03-15T12:00:00Z').toISOString(), actor: 'Charlie (Commissioner)' }
    ],
    chat: [
      { senderId: 'user-2', senderName: 'Bob (Inspector)', text: 'Hello Alice, this is Inspector Bob. I have received your complaint about the noise violation. I will be looking into this matter.', timestamp: new Date('2023-03-15T13:00:00Z').toISOString() },
      { senderId: 'user-1', senderName: 'Alice (Complainer)', text: 'Thank you, Inspector. I appreciate you looking into it. The noise started again this morning at 6:30 AM.', timestamp: new Date('2023-03-16T08:00:00Z').toISOString() }
    ]
  },
  {
    id: 'complaint-1678982400000',
    title: 'Illegal dumping in the park',
    description: 'Large amounts of trash and old furniture have been dumped near the playground at Central Park. It is a health hazard for children.',
    status: ComplaintStatus.Submitted,
    submittedBy: 'user-1', // Alice
    createdAt: new Date('2023-03-16T16:00:00Z').toISOString(),
    history: [
      { status: ComplaintStatus.Submitted, timestamp: new Date('2023-03-16T16:00:00Z').toISOString(), actor: 'Alice (Complainer)' }
    ]
  },
  {
    id: 'complaint-1679068800000',
    title: 'Pothole on Elm Street',
    description: 'There is a very large and dangerous pothole on Elm Street, near the intersection with Oak Avenue. It has already damaged my car\'s tire.',
    status: ComplaintStatus.ReportSubmitted,
    submittedBy: 'user-1', // Alice
    assignedTo: 'user-5', // Eve
    inspectorReport: 'Confirmed the existence of a large pothole at the specified location. It measures approximately 3 feet in diameter and 6 inches deep. Recommending immediate repair.',
    investigationNotes: 'Visited the site on 2023-03-18. Took photographs and measurements.',
    createdAt: new Date('2023-03-17T09:00:00Z').toISOString(),
    history: [
        { status: ComplaintStatus.Submitted, timestamp: new Date('2023-03-17T09:00:00Z').toISOString(), actor: 'Alice (Complainer)' },
        { status: ComplaintStatus.AssignedToInspector, timestamp: new Date('2023-03-17T11:00:00Z').toISOString(), actor: 'Charlie (Commissioner)' },
        { status: ComplaintStatus.InvestigationInProgress, timestamp: new Date('2023-03-18T14:00:00Z').toISOString(), actor: 'Eve (Inspector)' },
        { status: ComplaintStatus.ReportSubmitted, timestamp: new Date('2023-03-19T10:00:00Z').toISOString(), actor: 'Eve (Inspector)' }
    ],
    chat: [
        { senderId: 'user-5', senderName: 'Eve (Inspector)', text: 'Hi Alice, I am Inspector Eve. I\'ll be investigating the pothole issue.', timestamp: new Date('2023-03-17T12:00:00Z').toISOString() },
        { senderId: 'user-4', senderName: 'Diana (Prosecutor)', text: 'Hello both, Prosecutor Diana here. I am reviewing the report. Alice, can you provide an estimate of the damage to your vehicle?', timestamp: new Date('2023-03-20T11:00:00Z').toISOString() },
    ]
  }
];
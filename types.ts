
import * as React from 'react';

// This file contains shared type definitions for the application.

declare global {
  interface AIStudio {
    getAuthenticatedUser: () => Promise<User>;
  }

  interface Window {
    aistudio?: AIStudio;
    jspdf?: unknown;
    XLSX?: unknown;
    isCVDirty?: boolean;
  }
}

// This file contains shared type definitions for the application.
export interface CVFile {
  id: string;
  file: File;
  hash?: string;
  content?: string;
  status: 'pending' | 'parsing' | 'success' | 'error';
  profile?: CandidateProfile;
  error?: string;
  analysisStartTime?: number;
  analysisDuration?: number;
}

export interface CandidateProfile {
  id: string;
  fileName: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: {
    hard: string[];
    soft: string[];
  };
  languages: string[];
  certifications: string[];
  detectedLanguage: string;
  jobCategory: string;
  totalExperienceYears: number;
  performanceScore: number;
  analysisDuration?: number;
}

export interface Experience {
  title: string;
  company: string;
  dates: string;
  description: string;
}

export interface Education {
  degree: string;
  school: string;
  dates: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    action?: AIAction; // New: Support for actionable buttons
}

export type View = 'upload' | 'create-cv' | 'dashboard' | 'favorites' | 'settings' | 'compare' | 'ai' | 'recruitment' | 'history' | 'infra' | 'missions' | 'timesheets' | 'leaves' | 'purchase-orders';
export type Theme = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  email: string;
}

export interface FilterCriteria {
  jobCategories: string[];
  locations: string[];
  experienceLevels: string[];
  skills: string[];
}

export type PipelineStage = 'NEW' | 'SCREENING' | 'INTERVIEW_1' | 'INTERVIEW_2' | 'OFFER' | 'PLACED' | 'REJECTED';

export interface RecruitmentData {
  candidateId: string;
  stage: PipelineStage;
  applicationDate: string;
  interview1Date: string;
  interview1Result: 'Excellent' | 'Good' | 'Fair' | 'Medium' | '';
  challengeSentDate: string;
  challengeDoneDate: string; // Can be empty if not done
  interview2Date: string;
  interview2Result: 'Excellent' | 'Good' | 'Fair' | 'Medium' | '';
  startDate: string;
}

export interface PipelineSnapshot {
  id: string;
  date: string;
  data: (RecruitmentData & { profile: CandidateProfile })[];
  count: number;
}

// --- NEW MODULES ---

export type ContractType = 'CDI' | 'CDD' | 'FREELANCE' | 'INTERIM' | 'STAGE';
export type MissionStatus = 'Draft' | 'Upcoming' | 'Active' | 'Paused' | 'Ended';
export type TimesheetStatus = 'Draft' | 'Submitted' | 'Validated' | 'Rejected';
export type WorkMode = 'OnSite' | 'Remote' | 'Hybrid';
export type Periodicity = 'Weekly' | 'Monthly';

export interface Mission {
  id: string;
  candidateId: string;
  candidateName: string;
  client: string;
  title: string;
  
  // Contract & Location
  contractType: ContractType;
  workMode: WorkMode;
  country: string;
  city: string;
  
  // Dates
  startDate: string;
  endDate?: string;
  
  // Remuneration
  remuneration: number; // Amount
  currency: string;
  remunerationType: 'Monthly' | 'Daily'; // Derived from contract type
  
  // Time Tracking Config
  status: MissionStatus;
  timeTracking: {
      enabled: boolean;
      periodicity: Periodicity;
      approverEmail?: string;
      standardHoursPerDay: number;
  }
}

export interface TimesheetDay {
    date: string;
    hours: number;
    type: 'Production' | 'Overtime' | 'Absence' | 'Holiday' | 'Weekend';
    note?: string;
}

export interface TimesheetHistoryEntry {
    date: string;
    action: string;
    user: string;
}

export interface Timesheet {
  id: string;
  missionId: string;
  consultantName: string;
  clientName: string;
  periodStart: string; // Date ISO string
  periodEnd: string;   // Date ISO string
  totalHours: number;
  totalDays: number;
  status: TimesheetStatus;
  days: TimesheetDay[];
  rejectionReason?: string;
  history?: TimesheetHistoryEntry[];
}

export interface AIAction {
  type: 'CREATE_MISSION' | 'VALIDATE_TIMESHEET' | 'GO_TO_TIMESHEETS';
  payload: Record<string, unknown>;
  label: string;
}

export type LeaveType = 'Congés Payés' | 'Maladie' | 'Sans Solde' | 'Exceptionnel';
export type LeaveStatus = 'En attente' | 'Approuvé' | 'Refusé';

export interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  type: LeaveType;
  reason: string;
  days: number;
  status: LeaveStatus;
  user: string;
}

export type POStatus = 'Brouillon' | 'Émis' | 'Payé' | 'Archivé';

export interface PurchaseOrder {
  id: string;
  number: string;
  consultantName: string;
  clientName: string;
  missionId: string;
  timesheetId: string;
  period: string; // e.g. "Mars 2026"
  days: number;
  dailyRate: number; // TJM
  amountHT: number;
  amountTVA: number;
  amountTTC: number;
  status: POStatus;
  date: string;
  signatureUrl?: string;
}

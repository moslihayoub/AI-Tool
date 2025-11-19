
import * as React from 'react';

// This file contains shared type definitions for the application.

declare global {
  interface AIStudio {
    getAuthenticatedUser: () => Promise<User>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

// Extend React's JSX namespace to include the custom element
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-wc': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        autoplay?: boolean;
        loop?: boolean;
        style?: React.CSSProperties;
      };
    }
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
}

export type View = 'upload' | 'dashboard' | 'favorites' | 'settings' | 'compare' | 'ai' | 'recruitment' | 'history' | 'infra';
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

export interface RecruitmentData {
  candidateId: string;
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

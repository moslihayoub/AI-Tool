// FIX: Changed the React import to a namespace import and used it to correctly
// augment the global JSX namespace. The previous `import 'react'` was not
// sufficient in this project's setup, leading to JSX types being overwritten.
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

// FIX: Switched from augmenting the global JSX namespace to module augmentation for 'react'.
// This is a more robust way to extend JSX's IntrinsicElements without the risk of
// overwriting all of React's built-in element types, which was the root cause of
// the widespread JSX-related TypeScript errors.
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-wc': {
        src?: string;
        autoplay?: boolean;
        loop?: boolean;
        style?: React.CSSProperties;
        [key: string]: any;
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

export type View = 'upload' | 'dashboard' | 'favorites' | 'settings' | 'compare';
export type Theme = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  email: string;
}

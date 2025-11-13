// This file contains shared type definitions for the application.

// FIX: To resolve widespread JSX intrinsic element type errors, imported React and moved the
// JSX augmentation for 'dotlottie-wc' here. This ensures that React's default types are
// loaded and augmented correctly before any component renders.
// FIX: Changed to namespace import to correctly resolve `React.DetailedHTMLProps`.
import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-wc': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          // FIX: Changed prop name to `autoPlay` to align with React's camelCase convention for attributes.
          autoPlay?: boolean;
          loop?: boolean;
        },
        HTMLElement
      >;
    }
  }
}

export interface CVFile {
  id: string;
  file: File;
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

export type View = 'upload' | 'dashboard' | 'favorites' | 'settings';
export type Theme = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  email: string;
}

declare global {
  // FIX: Moved AIStudio interface into declare global to resolve module conflicts.
  interface AIStudio {
    getAuthenticatedUser: () => Promise<User>;
  }

  interface Window {
    // FIX: Use the consistent AIStudio interface. This resolves subsequent property declaration errors.
    aistudio?: AIStudio;
  }
}

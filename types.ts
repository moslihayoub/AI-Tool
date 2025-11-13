// This file contains shared type definitions for the application.

// FIX: Added React import to enable JSX namespace augmentation for custom elements.
import * as React from 'react';

declare global {
  interface AIStudio {
    getAuthenticatedUser: () => Promise<User>;
  }

  interface Window {
    aistudio?: AIStudio;
  }

  // FIX: Centralized JSX namespace augmentation for the 'dotlottie-wc' custom element.
  // Placing this in a shared types file ensures that TypeScript recognizes the custom element
  // across all components without overriding React's default intrinsic elements.
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-wc': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          autoplay?: boolean;
          loop?: boolean;
        },
        HTMLElement
      >;
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
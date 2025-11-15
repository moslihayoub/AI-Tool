// FIX: Replaced `import * as React from 'react'` with `import 'react'` to ensure React's global JSX namespace is available for augmentation, resolving widespread 'Property does not exist on type 'JSX.IntrinsicElements'' errors. The `import 'react'` statement loads React's type definitions globally without creating a local variable, which seems to resolve the type-stripping or namespace-overwriting issue.
import 'react';

// This file contains shared type definitions for the application.

declare global {
  // FIX: Moved the JSX namespace augmentation for the 'dotlottie-wc' web component here from index.tsx.
  // Declaring it in this central types file ensures it's applied globally before other modules are loaded,
  // fixing widespread JSX intrinsic element type errors.
  namespace JSX {
    interface IntrinsicElements {
      // FIX: Simplified the 'dotlottie-wc' custom element type. The previous dependency on React.DetailedHTMLProps was causing a cascading type failure because the base JSX types were not being found during compilation. This change removes that dependency, which should allow the base React JSX types to load correctly and resolve the widespread 'Property does not exist on type 'JSX.IntrinsicElements'' errors.
      'dotlottie-wc': {
        src?: string;
        autoplay?: boolean;
        loop?: boolean;
        style?: React.CSSProperties;
        className?: string;
      };
    }
  }

  interface AIStudio {
    getAuthenticatedUser: () => Promise<User>;
  }

  interface Window {
    aistudio?: AIStudio;
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

export type View = 'upload' | 'dashboard' | 'favorites' | 'settings' | 'compare' | 'ai';
export type Theme = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  email: string;
}
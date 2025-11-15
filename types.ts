// FIX: Added a /// <reference types="react" /> directive to explicitly load React's global JSX type definitions, which should resolve all 'Property does not exist on type 'JSX.IntrinsicElements'' errors.

// FIX: Removed `/// <reference types="react" />` to fix "Cannot find type definition file for 'react'" error. The namespace import below is sufficient.

// FIX: Replaced `import type { CSSProperties } from 'react'` with `import * as React from 'react'`. This ensures that React's global JSX namespace is fully loaded before this file attempts to augment it, resolving widespread "Property does not exist on type 'JSX.IntrinsicElements'" errors across the application.
// FIX: Switched to namespace React import to correctly populate the global JSX namespace, resolving JSX intrinsic element type errors.
import * as React from 'react';

// This file contains shared type definitions for the application.

declare global {
  // FIX: Moved the JSX namespace augmentation for the 'dotlottie-wc' web component here from index.tsx.
  // Declaring it in this central types file ensures it's applied globally before other modules are loaded,
  // fixing widespread JSX intrinsic element type errors.
  namespace JSX {
    interface IntrinsicElements {
      // FIX: Changed the type definition to extend from `div`'s intrinsic element type.
      // This is a more robust way to type custom elements in React with TypeScript,
      // ensuring all standard HTML attributes (like style, className) are included,
      // which resolves the "Property 'dotlottie-wc' does not exist on type 'JSX.IntrinsicElements'" errors.
      // FIX: Replaced `JSX.IntrinsicElements['div']` with a more explicit type to resolve "Property 'div' does not exist" error.
      'dotlottie-wc': React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        src?: string;
        // FIX: Reverted `autoPlay` to `autoplay`. The camelCase `autoPlay` might conflict with React's built-in prop types for media elements, causing TypeScript to ignore this custom element declaration entirely. Using lowercase is safer for web components.
        autoplay?: boolean;
        loop?: boolean;
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

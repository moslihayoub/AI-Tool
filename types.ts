// This file contains shared type definitions for the application.
// FIX: Changed 'import type React' to 'import React' to ensure that React's global JSX namespace is loaded before augmentation.
// This prevents overwriting the default intrinsic elements and fixes errors about properties like 'div' or 'svg' not existing on JSX.IntrinsicElements.
import React from 'react';

// FIX: Moved global type definition for 'dotlottie-wc' custom element here.
// This is a better location for type definitions and augmentations to avoid overwriting React's default intrinsic elements.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-wc': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { src: string; autoplay: boolean; loop: boolean; style?: React.CSSProperties }, HTMLElement>;
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

import { GoogleGenAI, Type, Chat, GenerateContentResponse } from '@google/genai';
import type { CandidateProfile, CVFile } from '../types';

// Fix: Initialize the Google Gemini AI client. It's good practice to do this once per module.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fix: Define the JSON schema for the candidate profile to ensure structured output from the AI.
const candidateProfileSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Full name of the candidate." },
        email: { type: Type.STRING, description: "Email address of the candidate." },
        phone: { type: Type.STRING, description: "Phone number of the candidate." },
        location: { type: Type.STRING, description: "City and country of the candidate, e.g. 'Paris, France'." },
        summary: { type: Type.STRING, description: "A brief summary of the candidate's profile, in 2-3 sentences." },
        experience: {
            type: Type.ARRAY,
            description: "Candidate's work experience.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    company: { type: Type.STRING },
                    dates: { type: Type.STRING, description: "e.g., 'Jan 2020 - Present'" },
                    description: { type: Type.STRING, description: "A summary of responsibilities and achievements in this role." },
                },
                required: ["title", "company", "dates", "description"]
            }
        },
        education: {
            type: Type.ARRAY,
            description: "Candidate's education history.",
            items: {
                type: Type.OBJECT,
                properties: {
                    degree: { type: Type.STRING },
                    school: { type: Type.STRING },
                    dates: { type: Type.STRING },
                },
                required: ["degree", "school", "dates"]
            }
        },
        skills: {
            type: Type.OBJECT,
            properties: {
                hard: { type: Type.ARRAY, description: "List of technical/hard skills.", items: { type: Type.STRING } },
                soft: { type: Type.ARRAY, description: "List of soft skills.", items: { type: Type.STRING } },
            },
            required: ["hard", "soft"]
        },
        languages: { type: Type.ARRAY, description: "List of languages spoken by the candidate.", items: { type: Type.STRING } },
        certifications: { type: Type.ARRAY, description: "List of any certifications.", items: { type: Type.STRING } },
        detectedLanguage: { type: Type.STRING, description: "The primary language detected in the CV (e.g., 'French', 'English')." },
        jobCategory: {
            type: Type.STRING,
            description: `Categorize the candidate into ONE of the following job categories: 'Product Design', 'Développeur Full Stack', 'QA Automation', or 'Other'.
- 'Product Design': For all design roles, including UX Designer, UI Designer, Product Designer, Digital Designer, Motion Designer, Graphic Designer, Brand Designer.
- 'Développeur Full Stack': For all development-related roles, including Développeur Full Stack, Développeur Front-End, Développeur Back-End, Développeur Mobile, Data Scientist, Data Analyst, Ingénieur Cloud, Ingénieur IA, DevOps, Software Engineer.
- 'QA Automation': For all QA and automation roles, including QA Automation Engineer, Testeur QA, Ingénieur Automatisation des Tests, SDET, Test Automation Specialist.
- 'Other': If the role does not fit into the above categories.`
        },
        totalExperienceYears: { type: Type.NUMBER, description: "Total years of professional experience, calculated from the experience section." },
        performanceScore: { type: Type.NUMBER, description: "An estimated performance score from 0 to 100 based on the overall quality of the CV (experience, skills, education). A score of 0 means not enough information." },
    },
    required: [
        "name", "email", "phone", "location", "summary", "experience", "education",
        "skills", "languages", "certifications", "detectedLanguage", "jobCategory",
        "totalExperienceYears", "performanceScore"
    ]
};

const systemInstructionForParsing = `You are an expert HR assistant specializing in parsing CVs and extracting key information. Your task is to analyze the provided CV file and return the candidate's details in a structured JSON format according to the provided schema. Pay close attention to detail and ensure all fields are populated accurately. If a piece of information is not present in the CV, use "N/A" for string fields, 0 for numeric fields, and empty arrays for list fields.`;

/**
 * Parses the content of a CV file using the Gemini API.
 * @param fileData An object containing the MIME type and base64 encoded data of the file.
 * @returns A promise that resolves to the parsed candidate profile.
 */
export async function parseCvContent(fileData: { mimeType: string; data: string }): Promise<Omit<CandidateProfile, 'id' | 'fileName' | 'analysisDuration'>> {
    // Fix: Select model based on task type. 'gemini-2.5-flash' is suitable for this structured data extraction task.
    const model = 'gemini-2.5-flash';
    const prompt = `Please analyze the attached CV and extract the candidate's information.`;

    try {
        // Fix: Call Gemini API to generate content with a specific JSON schema.
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: { parts: [{ text: prompt }, { inlineData: fileData }] },
            config: {
                systemInstruction: systemInstructionForParsing,
                responseMimeType: "application/json",
                responseSchema: candidateProfileSchema,
            },
        });

        // Fix: Extract and parse the JSON text from the response.
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        // We return the parsed data, and the caller will add the file-specific metadata.
        return {
            name: parsedJson.name || 'N/A',
            email: parsedJson.email || 'N/A',
            phone: parsedJson.phone || 'N/A',
            location: parsedJson.location || 'N/A',
            summary: parsedJson.summary || 'N/A',
            experience: parsedJson.experience || [],
            education: parsedJson.education || [],
            skills: parsedJson.skills || { hard: [], soft: [] },
            languages: parsedJson.languages || [],
            certifications: parsedJson.certifications || [],
            detectedLanguage: parsedJson.detectedLanguage || 'N/A',
            jobCategory: parsedJson.jobCategory || 'N/A',
            totalExperienceYears: parsedJson.totalExperienceYears || 0,
            performanceScore: parsedJson.performanceScore || 0,
        };
    } catch (e) {
        console.error("Failed to process CV with Gemini:", e);
        if (e instanceof Error) {
           throw new Error(`Failed to get structured data from AI. The CV might be unparsable or in an unsupported format. Gemini Error: ${e.message}`);
        }
        throw new Error("An unknown error occurred during CV analysis.");
    }
}

/**
 * Creates a new AI chat session for a given CV profile.
 * @param cvFile The CV file object containing the candidate's profile.
 * @returns A Chat instance from the Gemini API.
 */
export function createAIChat(cvFile: CVFile): Chat {
    if (!cvFile.profile) {
        throw new Error("Cannot create AI chat for a CV without a profile.");
    }

    // Sanitize profile for context, removing fields that might not be useful for chat.
    const { id, fileName, analysisDuration, ...profileContext } = cvFile.profile;

    const systemInstruction = `You are a helpful AI assistant for an HR professional. You are analyzing the CV of a candidate.
    The candidate's profile has been parsed and is provided below in JSON format.
    Use this information to answer questions about the candidate. Be concise and helpful.
    When asked for summaries or lists, use markdown formatting (e.g., bullet points with '-').
    
    Candidate Profile:
    ${JSON.stringify(profileContext, null, 2)}
    `;

    // Fix: Create a chat instance with a system instruction containing the candidate's profile as context.
    const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
    });

    return chat;
}

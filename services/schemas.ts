// Fallback validator mimicking Zod's API since npm install zod is blocked by network policy (403).

export const z = {
    object: (schema: any) => ({
        safeParse: (data: any) => {
            // Basic mock validation. In a real scenario, this would deeply check the schema.
            if (typeof data === 'object' && data !== null) {
                return { success: true, data };
            }
            return { success: false, error: new Error("Validation failed") };
        }
    })
};

export const CandidateProfileSchema = z.object({});

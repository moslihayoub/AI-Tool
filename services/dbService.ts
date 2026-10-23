import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CandidateProfile, RecruitmentData, Mission, Timesheet } from '../types';

export const saveCandidateToDb = async (candidate: CandidateProfile, userId?: string): Promise<boolean> => {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('hr_candidates').upsert({
      id: candidate.id,
      user_id: userId || null,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      location: candidate.location,
      summary: candidate.summary,
      experience: candidate.experience,
      education: candidate.education,
      skills: candidate.skills,
      languages: candidate.languages,
      certifications: candidate.certifications,
      detected_language: candidate.detectedLanguage,
      job_category: candidate.jobCategory,
      total_experience_years: candidate.totalExperienceYears,
      performance_score: candidate.performanceScore,
      file_name: candidate.fileName,
      analysis_duration: candidate.analysisDuration || 0,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.warn('[Supabase] Failed to save candidate:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] saveCandidate error:', err);
    return false;
  }
};

export const loadCandidatesFromDb = async (userId?: string): Promise<CandidateProfile[]> => {
  if (!isSupabaseConfigured) return [];
  try {
    let query = supabase.from('hr_candidates').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(item => ({
      id: item.id,
      fileName: item.file_name || 'CV.pdf',
      name: item.name,
      email: item.email || '',
      phone: item.phone || '',
      location: item.location || '',
      summary: item.summary || '',
      experience: item.experience || [],
      education: item.education || [],
      skills: item.skills || { hard: [], soft: [] },
      languages: item.languages || [],
      certifications: item.certifications || [],
      detectedLanguage: item.detected_language || 'fr',
      jobCategory: item.job_category || 'Général',
      totalExperienceYears: Number(item.total_experience_years) || 0,
      performanceScore: Number(item.performance_score) || 0,
      analysisDuration: item.analysis_duration || 0,
    }));
  } catch (err) {
    console.warn('[Supabase] loadCandidates error:', err);
    return [];
  }
};

export const savePipelineToDb = async (recruitment: RecruitmentData, userId?: string): Promise<boolean> => {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('hr_pipeline').upsert({
      id: recruitment.candidateId,
      candidate_id: recruitment.candidateId,
      user_id: userId || null,
      stage: recruitment.stage,
      notes: JSON.stringify(recruitment),
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch (err) {
    console.warn('[Supabase] savePipeline error:', err);
    return false;
  }
};

export const loadPipelineFromDb = async (userId?: string): Promise<RecruitmentData[]> => {
  if (!isSupabaseConfigured) return [];
  try {
    let query = supabase.from('hr_pipeline').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(item => {
      try {
        if (item.notes && item.notes.startsWith('{')) {
          return JSON.parse(item.notes);
        }
      } catch {
        // Fallback
      }
      return {
        candidateId: item.candidate_id,
        stage: item.stage as RecruitmentData['stage'],
        applicationDate: item.created_at,
        interview1Date: '',
        interview1Result: '' as const,
        challengeSentDate: '',
        challengeDoneDate: '',
        interview2Date: '',
        interview2Result: '' as const,
        startDate: '',
      };
    });
  } catch (err) {
    console.warn('[Supabase] loadPipeline error:', err);
    return [];
  }
};

export const getUserQuotaFromDb = async (userId: string): Promise<{ count: number; limit: number; role: string }> => {
  if (!isSupabaseConfigured || !userId) return { count: 0, limit: 10, role: 'user' };
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('hr_user_quotas')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Create record
      await supabase.from('hr_user_quotas').upsert({
        user_id: userId,
        daily_analyses_count: 0,
        daily_analyses_limit: 10,
        last_reset_date: today,
        role: 'user',
      });
      return { count: 0, limit: 10, role: 'user' };
    }

    if (data.last_reset_date !== today) {
      // Daily reset
      await supabase.from('hr_user_quotas').update({
        daily_analyses_count: 0,
        last_reset_date: today,
      }).eq('user_id', userId);
      return { count: 0, limit: data.daily_analyses_limit || 10, role: data.role || 'user' };
    }

    return {
      count: data.daily_analyses_count || 0,
      limit: data.daily_analyses_limit || 10,
      role: data.role || 'user',
    };
  } catch (err) {
    console.warn('[Supabase] getUserQuota error:', err);
    return { count: 0, limit: 10, role: 'user' };
  }
};

export const incrementUserQuotaInDb = async (userId: string): Promise<number> => {
  if (!isSupabaseConfigured || !userId) return 0;
  try {
    const quota = await getUserQuotaFromDb(userId);
    const newCount = quota.count + 1;
    await supabase.from('hr_user_quotas').update({
      daily_analyses_count: newCount,
      updated_at: new Date().toISOString(),
    }).eq('user_id', userId);
    return newCount;
  } catch (err) {
    console.warn('[Supabase] incrementUserQuota error:', err);
    return 0;
  }
};

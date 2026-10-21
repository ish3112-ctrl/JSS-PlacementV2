import { useQuery } from '@tanstack/react-query';
import {
  normalizeCompanyProfile,
  normalizeCompanySummary,
  normalizeDashboardSkills,
  type CompanyProfile,
  type CompanySummary,
  type JsonRecord,
} from './companyData';
import { getSupabaseClient } from './supabaseClient';

type CompanyJsonRow = { company_id: number; short_json: JsonRecord; full_json?: JsonRecord };
type SkillLevelRow = {
  company_id: number;
  skill_set_id: number;
  required_level: number;
  required_proficiency_level_id: number | null;
};
type SkillMasterRow = { skill_set_id: number; skill_set_name: string; short_name: string | null };
type ProficiencyRow = { proficiency_level_id: number; proficiency_name: string; proficiency_code: string | null };
type SkillTopicsRow = { skill_set_id: number; level_number: number; topics: unknown };

function throwOnError(error: { message: string } | null, table: string): void {
  if (error) throw new Error(`Could not read public.${table}: ${error.message}`);
}

async function fetchCompanies(): Promise<CompanySummary[]> {
  const { data, error } = await getSupabaseClient()
    .from('company_json')
    .select('company_id, short_json')
    .order('company_id', { ascending: true });
  throwOnError(error, 'company_json');
  return (data ?? []).map((row) => normalizeCompanySummary({
    company_id: row.company_id,
    short_json: row.short_json,
  }));
}

async function fetchCompanyProfile(id: number): Promise<CompanyProfile> {
  const { data, error } = await getSupabaseClient()
    .from('company_json')
    .select('company_id, short_json, full_json')
    .eq('company_id', id)
    .single();
  throwOnError(error, 'company_json');
  const row = data as CompanyJsonRow;
  return normalizeCompanyProfile(row.full_json, row.short_json);
}

export interface CompanySkills {
  skills: ReturnType<typeof normalizeDashboardSkills>;
  topics: Record<string, string[]>;
}

function topicList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return value.split(/[\n;•]+/).map((topic) => topic.trim()).filter(Boolean);
    }
  }
  return [];
}

async function fetchCompanySkills(companyId: number): Promise<CompanySkills> {
  const client = getSupabaseClient();
  const [levelsResult, mastersResult, proficiencyResult, topicsResult] = await Promise.all([
    client.from('company_skill_levels')
      .select('company_id, skill_set_id, required_level, required_proficiency_level_id')
      .eq('company_id', companyId),
    client.from('skill_set_master').select('skill_set_id, skill_set_name, short_name'),
    client.from('proficiency_levels').select('proficiency_level_id, proficiency_name, proficiency_code'),
    client.from('skill_set_topics').select('skill_set_id, level_number, topics'),
  ]);
  throwOnError(levelsResult.error, 'company_skill_levels');
  throwOnError(mastersResult.error, 'skill_set_master');
  throwOnError(proficiencyResult.error, 'proficiency_levels');
  throwOnError(topicsResult.error, 'skill_set_topics');

  const masters = new Map((mastersResult.data as SkillMasterRow[]).map((row) => [row.skill_set_id, row]));
  const proficiencies = new Map((proficiencyResult.data as ProficiencyRow[]).map((row) => [row.proficiency_level_id, row]));
  const rawSkills = (levelsResult.data as SkillLevelRow[]).flatMap((row) => {
    const master = masters.get(row.skill_set_id);
    if (!master) return [];
    const proficiency = row.required_proficiency_level_id === null
      ? undefined
      : proficiencies.get(row.required_proficiency_level_id)?.proficiency_name;
    return [{
      skill_set_id: row.skill_set_id,
      skill_set_name: master.skill_set_name || master.short_name || 'Unnamed skill',
      required_level: row.required_level,
      required_proficiency: proficiency ?? '',
    }];
  });
  const skillTopics = new Map<number, Map<number, string[]>>();
  for (const row of topicsResult.data as SkillTopicsRow[]) {
    const byLevel = skillTopics.get(row.skill_set_id) ?? new Map<number, string[]>();
    byLevel.set(row.level_number, topicList(row.topics));
    skillTopics.set(row.skill_set_id, byLevel);
  }
  const topics: Record<string, string[]> = {};
  for (const row of rawSkills) {
    const byLevel = skillTopics.get(row.skill_set_id);
    topics[row.skill_set_name] = Array.from({ length: 10 }, (_, index) =>
      byLevel?.get(index + 1)?.join(', ') ?? '',
    );
  }
  return { skills: normalizeDashboardSkills(rawSkills), topics };
}

export function useCompanies() {
  return useQuery({ queryKey: ['companies'], queryFn: fetchCompanies });
}

export function useCompanyProfile(id: number | null | undefined) {
  return useQuery({
    queryKey: ['company-profile', id],
    queryFn: () => fetchCompanyProfile(id as number),
    enabled: typeof id === 'number' && Number.isFinite(id) && id > 0,
  });
}

export function useCompanySkills(id: number | null | undefined) {
  return useQuery({
    queryKey: ['company-skills', id],
    queryFn: () => fetchCompanySkills(id as number),
    enabled: typeof id === 'number' && Number.isFinite(id) && id > 0,
  });
}

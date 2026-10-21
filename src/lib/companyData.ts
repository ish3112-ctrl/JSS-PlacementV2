export type JsonRecord = Record<string, unknown>;
export interface CompanySummary { company_id:number; name:string; short_name:string; logo_url:string; category:string; company_type:string; incorporation_year:string; employee_size:string; headquarters_address:string; operating_countries:string[]; office_locations:string[]; yoy_growth_rate:string; website_url:string; short_json:JsonRecord; full_json:JsonRecord; skill_levels:JsonRecord[] }
export interface CompanyProfile extends JsonRecord { name:string; short_name:string; [key:string]:unknown }
export interface DashboardSkill { id:number; name:string; score:number; proficiency:string }
export const asString=(v:unknown,fallback=''):string=>v===null||v===undefined?'':String(v).trim()||fallback;
export const asRecord=(v:unknown):JsonRecord=>v&&typeof v==='object'&&!Array.isArray(v)?v as JsonRecord:{};
export const splitItems=(v:unknown):string[]=>asString(v).split(/[\n.;•]+/).map(s=>s.trim()).filter(Boolean);
export const titleCaseFromCode=(s:string):string=>s.replace(/[_-]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
export const scoreToDifficulty=(n:number):'EXPERT'|'ADVANCED'|'PRO'|'BEGINNER'=>n>=8?'EXPERT':n>=6?'ADVANCED':n>=4?'PRO':'BEGINNER';
export function normalizeCompanySummary(raw:unknown):CompanySummary {
 const r=asRecord(raw), s=asRecord(r.short_json), f=asRecord(r.full_json);
 const list=(v:unknown)=>asString(v).split(';').map(x=>x.trim()).filter(Boolean);
 return {company_id:Number(r.company_id??0),name:asString(s.name,asString(f.name,'Company')),short_name:asString(s.short_name,asString(f.short_name,'Company')),logo_url:asString(s.logo_url),category:asString(s.category),company_type:asString(s.company_type,'Dream'),incorporation_year:asString(s.incorporation_year),employee_size:asString(s.employee_size),headquarters_address:asString(s.headquarters_address),operating_countries:list(s.operating_countries),office_locations:list(s.office_locations),yoy_growth_rate:asString(s.yoy_growth_rate),website_url:asString(s.website_url),short_json:s,full_json:f,skill_levels:Array.isArray(r.skill_levels)?r.skill_levels.map(asRecord):[]};
}
export function normalizeCompanyProfile(full_json:unknown,short_json:unknown):CompanyProfile { return {...asRecord(short_json),...asRecord(full_json)} as CompanyProfile; }
export function normalizeDashboardSkills(skillLevels:unknown[]):DashboardSkill[] { return (skillLevels||[]).map((v,i)=>{const r=asRecord(v);return {id:Number(r.skill_set_id??i+1),name:asString(r.skill_set_name,'Unnamed skill'),score:Number(r.required_level??0),proficiency:asString(r.required_proficiency)}}); }

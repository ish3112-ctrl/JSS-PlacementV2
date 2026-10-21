import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2, ChevronDown, GraduationCap, LockKeyhole, Target } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useCompanies, useCompanySkills } from '../lib/companyApi';
import { CompanyLogo } from '../components/CompanyLogo';

const blooms = [['CU', 'Remember & understand', '#3b82f6'], ['AP', 'Apply', '#22c55e'], ['AS', 'Analyze', '#eab308'], ['EV', 'Evaluate', '#ef4444'], ['CR', 'Create', '#a855f7']];
const bloom = (score: number) => score <= 2 ? 'CU' : score <= 4 ? 'AP' : score <= 6 ? 'AS' : score <= 8 ? 'EV' : 'CR';
const criticality = (score: number) => score >= 7 ? 'Critical' : score >= 5 ? 'Important' : 'Baseline';

export function SkillIntelligence() {
  const { company } = useCompany();
  const { isLoading: companiesLoading } = useCompanies();
  const skillsQuery = useCompanySkills(company?.company_id);
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<number | null>(null);
  useEffect(() => {
    if (!company && !companiesLoading) navigate('/', { replace: true });
  }, [company, companiesLoading, navigate]);
  const skills = useMemo(() => [...(skillsQuery.data?.skills ?? [])].sort((a, b) => b.score - a.score), [skillsQuery.data]);

  if (skillsQuery.isError) return <div role="alert" className="skills-page"><p>{skillsQuery.error instanceof Error ? skillsQuery.error.message : 'Could not load company skills.'}</p><button className="primary-button" onClick={() => void skillsQuery.refetch()}>Retry</button></div>;
  if (skillsQuery.isLoading || (company && !skillsQuery.data)) return <div className="loading-screen">Loading skill intelligence…</div>;
  if (!company) return companiesLoading ? <div className="loading-screen">Loading companies…</div> : null;

  return <div className="skills-page">
    <div className="page-title-row"><div className="page-title-company"><CompanyLogo name={company.name} logoUrl={company.logo_url}/><div><div className="eyebrow">PLACEMENT PREPARATION</div><h1>{company.name} Skill Intelligence</h1><p>Role-relevant capabilities, target proficiency, and a practical learning roadmap.</p></div></div><span className="skill-total">{skills.length} skills mapped</span></div>
    <section className="legend-panel"><div className="legend-block"><h2><GraduationCap size={17}/> Bloom proficiency levels</h2><div className="bloom-legend">{blooms.map(([code, label, color]) => <div className="bloom-legend-item" key={code}><b style={{ backgroundColor: color }}>{code}</b><span>{label}</span></div>)}</div></div><div className="legend-block"><h2><Target size={17}/> Criticality</h2><div className="criticality-legend"><span className="critical">Critical</span><span className="important">Important</span><span className="baseline">Baseline</span></div></div></section>
    <div className="skill-list">{skills.map((skill) => { const level = bloom(skill.score); const priority = criticality(skill.score); const topics = skillsQuery.data?.topics[skill.name] || []; return <article className="skill-card" key={skill.id}><button className="skill-card-main" onClick={() => setExpanded(expanded === skill.id ? null : skill.id)} aria-expanded={expanded === skill.id}><div className="skill-symbol"><BookOpen size={19}/></div><div className="skill-main-copy"><h3>{skill.name}</h3><div className="skill-badges"><span className={`bloom-badge bloom-${level.toLowerCase()}`}>{level} · {bloomLabel(level)}</span><span className={`criticality-badge ${priority.toLowerCase()}`}>{priority}</span></div><div className="progress-track"><div className={`progress-fill fill-${level.toLowerCase()}`} style={{ width: `${skill.score * 10}%` }}/></div></div><div className="skill-score"><strong>{skill.score}<small>/10</small></strong><span>Target score</span></div><ChevronDown className={`expand-chevron ${expanded === skill.id ? 'expanded' : ''}`} size={19}/></button>{expanded === skill.id && <div className="roadmap"><div className="roadmap-heading"><div><h4>10-level learning roadmap</h4><p>Work through fundamentals first, then progress toward applied practice.</p></div><span>{skill.score}/10 target</span></div><div className="roadmap-levels">{Array.from({ length: 10 }, (_, index) => { const levelNumber = index + 1; const locked = levelNumber > skill.score; return <div className={`roadmap-level ${locked ? 'locked' : levelNumber === skill.score ? 'target-level' : ''}`} key={levelNumber}><div className="level-number">{locked ? <LockKeyhole size={14}/> : levelNumber === skill.score ? <CheckCircle2 size={15}/> : levelNumber}</div><div className="level-copy"><b>Level {levelNumber}{levelNumber === skill.score ? ' · Target' : ''}</b><span>{topics[levelNumber - 1] || 'Practice core concepts and apply them to a small project'}</span></div>{locked && <span className="beyond-scope">Beyond scope</span>}</div>; })}</div></div>}</article>; })}</div>
    <p className="skills-disclaimer">Skill targets are part of the provided reference dataset, not an official hiring guarantee.</p>
  </div>;
}

function bloomLabel(code: string) {
  return ({ CU: 'Understand', AP: 'Apply', AS: 'Analyze', EV: 'Evaluate', CR: 'Create' } as Record<string, string>)[code] || code;
}

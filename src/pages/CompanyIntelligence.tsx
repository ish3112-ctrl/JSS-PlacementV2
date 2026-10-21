import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ExternalLink, Globe, Link2 } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useCompanies, useCompanyProfile } from '../lib/companyApi';
import { buildIntelligenceSections } from '../data/intelligenceData';
import { CompanyLogo } from '../components/CompanyLogo';

const nullish = (value: unknown) => value === null || value === undefined || ['', 'na', 'n/a', 'null', '-', 'none', 'undefined'].includes(String(value).trim().toLowerCase());

function Value({ value }: { value: unknown }) {
  if (nullish(value)) return <span className="na-pill">Not Available</span>;
  if (typeof value === 'string' && /^https?:\/\//i.test(value)) return <a href={value} target="_blank" rel="noreferrer" className="value-link">{value.replace(/^https?:\/\//, '')} <ExternalLink size={13}/></a>;
  if (typeof value === 'string' && (/rating/i.test(value) && /\d/.test(value))) return <span className="rating-value">★ {value}</span>;
  if (Array.isArray(value)) return <div className="value-chips">{value.map((item, index) => <span key={index}>{String(item)}</span>)}</div>;
  const text = String(value);
  if (text.includes(';') || text.includes('•')) return <div className="value-chips">{text.split(/[;•]/).map((item) => item.trim()).filter(Boolean).map((item, index) => <span key={index}>{item}</span>)}</div>;
  return <span className={text.length > 105 ? 'paragraph-value' : ''}>{text}</span>;
}

function RetryState({ message, retry }: { message: string; retry: () => unknown }) {
  return <div role="alert" className="intelligence-page"><p>{message}</p><button className="primary-button" onClick={() => void retry()}>Retry</button></div>;
}

export function CompanyIntelligence() {
  const { company } = useCompany();
  const { isLoading: companiesLoading } = useCompanies();
  const profileQuery = useCompanyProfile(company?.company_id);
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const scrolling = useRef(false);
  const profile = profileQuery.data;
  const sections = useMemo(() => profile ? buildIntelligenceSections(profile) : [], [profile]);

  useEffect(() => {
    if (!company && !companiesLoading) navigate('/', { replace: true });
  }, [company, companiesLoading, navigate]);
  useEffect(() => {
    if (!profile) return;
    const onScroll = () => {
      if (scrolling.current) return;
      let index = 0;
      sections.forEach((section, position) => {
        const element = document.getElementById(`section-${position}`);
        if (element && element.getBoundingClientRect().top < 170) index = position;
      });
      setActive(index);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [profile, sections]);

  if (profileQuery.isError) return <RetryState message={profileQuery.error instanceof Error ? profileQuery.error.message : 'Could not load the company profile.'} retry={profileQuery.refetch}/>;
  if (profileQuery.isLoading || (company && !profile)) return <div className="loading-screen">Loading company profile…</div>;
  if (!company) return companiesLoading ? <div className="loading-screen">Loading companies…</div> : null;

  const go = (index: number) => {
    setActive(index);
    scrolling.current = true;
    document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => { scrolling.current = false; }, 700);
  };

  return <div className="intelligence-page">
    <div className="company-info-bar"><div className="company-info-main"><CompanyLogo name={company.name} logoUrl={company.logo_url}/><div><h1>{company.name}</h1><div className="company-info-sub"><span className="industry-badge">{company.category}</span><span>{company.headquarters_address}</span></div></div></div><div className="company-actions"><a className="outline-button" href={String(profile?.website_url || '#')} target="_blank" rel="noreferrer"><Globe size={15}/> Website</a><a className="outline-button" href={String(profile?.linkedin_url || '#')} target="_blank" rel="noreferrer"><Link2 size={15}/> LinkedIn</a></div></div>
    <div className="sticky-tabs"><div className="tabs-track">{sections.map((section, index) => <button key={section.title} className={`section-tab ${active === index ? 'active' : ''}`} onClick={() => go(index)}>{section.title}</button>)}</div></div>
    <div className="sections-stack">{sections.map((section, index) => { const Icon = section.icon; const fields = section.fields.filter((field) => !nullish(profile?.[field.key])); return <section id={`section-${index}`} key={section.title} className="intelligence-card"><div className="intelligence-card-head"><div className="section-icon"><Icon size={18}/></div><h2>{section.title}</h2><span className="field-count">{fields.length} fields</span></div><div className="field-list">{fields.map((field) => <div className="field-row" key={field.key}><div className="field-label">{field.label}</div><div className="field-value"><Value value={profile?.[field.key]}/></div></div>)}{!fields.length && <p className="muted-empty">No public data is available for this section.</p>}</div></section>; })}</div>
    <div className="source-note"><ArrowUpRight size={15}/> Profile fields are loaded from the configured data source; confirm time-sensitive facts with official sources.</div>
  </div>;
}

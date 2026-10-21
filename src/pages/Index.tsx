import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Building2, Search, X } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { CompanyCard } from '../components/CompanyCard';
import { useCompanies } from '../lib/companyApi';

const filters = ['All', 'Super Dream', 'Dream', 'Standard', 'Regular'];

export function Index() {
  const { selectCompany } = useCompany();
  const { data: companies = [], isLoading, isError, error, refetch } = useCompanies();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query), 200);
    return () => window.clearTimeout(id);
  }, [query]);

  const counts = useMemo(() => Object.fromEntries(filters.map((item) => [
    item,
    item === 'All' ? companies.length : companies.filter((company) => company.company_type === item).length,
  ])), [companies]);
  const shown = companies.filter((company) =>
    (filter === 'All' || company.company_type === filter)
      && `${company.name} ${company.short_name} ${company.category} ${company.headquarters_address}`
        .toLowerCase().includes(debounced.toLowerCase()),
  );
  const pick = (company: typeof companies[number]) => {
    selectCompany(company);
    navigate('/company/intelligence');
  };

  return <div className="index-page">
    <section className="hero">
      <div className="hero-topline">
        <span className="platform-pill">JSS · INTELLIGENCE PLATFORM</span>
        <span className="seed-note"><span/> {isLoading ? 'Connecting to Supabase' : isError ? 'Database connection issue' : 'Connected to Supabase'}</span>
      </div>
      <h1>JSS UNIVERSITY NOIDA Companies Research &amp; Placement Analytics Portal</h1>
      <p>Your strategic edge for campus placements</p>
      <div className="search-wrap"><Search size={19}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search companies, industries, locations..." aria-label="Search companies"/>{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={17}/></button>}<kbd>⌘ K</kbd></div>
    </section>
    {isError && <div role="alert" className="mx-auto max-w-7xl px-6 pt-4 text-sm text-amber-700">{error instanceof Error ? error.message : 'Could not load companies.'} <button className="underline" onClick={() => void refetch()}>Retry</button></div>}
    {isLoading ? <div className="company-grid" aria-label="Loading companies"><div className="loading-screen">Loading companies…</div></div> : <section className="company-section">
      <div className="section-heading"><div><h2>Company directory</h2><p>Explore company profiles and role-relevant skill expectations.</p></div><span className="result-count">{shown.length} {shown.length === 1 ? 'company' : 'companies'}</span></div>
      <div className="filter-row">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`filter-pill ${filter === item ? 'selected' : ''} ${item.toLowerCase().replace(' ', '-')}`}><span>{item}</span><b>{counts[item]}</b></button>)}</div>
      {shown.length ? <div className="company-grid">{shown.map((company) => <CompanyCard key={company.company_id} company={company} onClick={() => pick(company)}/>)}</div> : <div className="empty-state"><div className="empty-icon"><Building2 size={24}/></div><h3>No companies found</h3><p>Try another search term or reset the filters.</p><button className="primary-button" onClick={() => { setQuery(''); setFilter('All'); }}>Reset filters <ArrowUpRight size={16}/></button></div>}
      <div className="directory-footnote">Company records loaded from your Supabase project.</div>
    </section>}
  </div>;
}

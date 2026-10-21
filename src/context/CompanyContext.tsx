import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { CompanySummary } from '../lib/companyData';
import { useCompanies } from '../lib/companyApi';

type ContextValue = {
  company: CompanySummary | null;
  selectCompany: (company: CompanySummary) => void;
};

const CompanyContext = createContext<ContextValue | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { data: companies = [] } = useCompanies();
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('selected-company');
      const id = saved ? Number(JSON.parse(saved).companyId) : NaN;
      return Number.isFinite(id) ? id : null;
    } catch {
      return null;
    }
  });
  const company = companies.find((item) => item.company_id === selectedId) ?? null;
  const selectCompany = (selected: CompanySummary) => {
    try {
      localStorage.setItem('selected-company', JSON.stringify({ companyId: selected.company_id }));
    } catch {
      // Selection remains available for this session when storage is disabled.
    }
    setSelectedId(selected.company_id);
  };
  const value = useMemo(() => ({ company, selectCompany }), [company]);
  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export const useCompany = () => {
  const value = useContext(CompanyContext);
  if (!value) throw new Error('useCompany must be used inside CompanyProvider');
  return value;
};

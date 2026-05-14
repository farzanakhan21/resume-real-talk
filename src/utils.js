export const ROLE_CATEGORIES = [
  { id: 'consulting', label: 'Consulting / Advisory' },
  { id: 'data', label: 'Data & Analytics Lead' },
  { id: 'engineering', label: 'Engineering Lead / CTO' },
  { id: 'ea-cos', label: 'Executive Assistant / Chief of Staff' },
  { id: 'finance', label: 'Finance / Strategy' },
  { id: 'general-manager', label: 'General Manager / Site Lead' },
  { id: 'talent-head', label: 'Head of Talent / Recruitment Lead' },
  { id: 'people-hr', label: 'HR Director / Chief People Officer' },
  { id: 'ld-od', label: 'L&D / Organisational Development Lead' },
  { id: 'marketing', label: 'Marketing Lead / CMO' },
  { id: 'operations', label: 'Operations Manager / COO' },
  { id: 'people-culture', label: 'People & Culture Lead / HR Business Partner' },
  { id: 'product', label: 'Product Manager / CPO' },
  { id: 'sales', label: 'Sales / Business Development' },
  { id: 'founder', label: 'Startup Founder / CEO' },
  { id: 'talent', label: 'Talent Acquisition Lead' },
  { id: 'custom', label: 'Other: I\'ll describe my role below' },
];

export const scoreColor = (score) => {
  if (score >= 80) return '#6D28D9';
  if (score >= 65) return '#8B5CF6';
  if (score >= 50) return '#C48A10';
  return '#B33A2A';
};

export const scoreLabel = (score) => {
  if (score >= 85) return 'Exceptional';
  if (score >= 70) return 'Strong';
  if (score >= 55) return 'Developing';
  if (score >= 40) return 'Needs Work';
  return 'Critical';
};

export const riskColor = (level) => {
  const map = { Low: '#6D28D9', Medium: '#C48A10', High: '#B33A2A', Critical: '#B33A2A' };
  return map[level] || 'var(--text-tertiary)';
};

export const copyToClipboard = async (text, onSuccess) => {
  try {
    await navigator.clipboard.writeText(text);
    onSuccess?.();
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    onSuccess?.();
  }
};

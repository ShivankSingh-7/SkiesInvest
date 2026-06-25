/**
 * Source Quality Ranking System
 *
 * Assigns a quality score (0-100) to a URL based on its domain.
 * Higher scores = more reliable, authoritative sources.
 */

const DOMAIN_SCORES = [
  // SEC / Government / Regulatory (100)
  { pattern: /sec\.gov/i, score: 100, type: 'regulatory' },
  { pattern: /edgar\.sec\.gov/i, score: 100, type: 'regulatory' },
  { pattern: /ftc\.gov/i, score: 95, type: 'regulatory' },
  { pattern: /federalreserve\.gov/i, score: 95, type: 'regulatory' },

  // Official Investor Relations / Annual Reports (90-95)
  { pattern: /investor\./i, score: 92, type: 'investor_relations' },
  { pattern: /ir\./i, score: 90, type: 'investor_relations' },
  { pattern: /annualreport\./i, score: 95, type: 'annual_report' },
  { pattern: /annual-report/i, score: 95, type: 'annual_report' },

  // Premium Financial News (85-90)
  { pattern: /reuters\.com/i, score: 90, type: 'financial_news' },
  { pattern: /bloomberg\.com/i, score: 90, type: 'financial_news' },
  { pattern: /ft\.com/i, score: 88, type: 'financial_news' },
  { pattern: /wsj\.com/i, score: 88, type: 'financial_news' },
  { pattern: /economist\.com/i, score: 85, type: 'financial_news' },
  { pattern: /barrons\.com/i, score: 85, type: 'financial_news' },

  // Financial Data Platforms (78-82)
  { pattern: /finance\.yahoo\.com/i, score: 82, type: 'financial_data' },
  { pattern: /marketwatch\.com/i, score: 80, type: 'financial_data' },
  { pattern: /morningstar\.com/i, score: 82, type: 'financial_data' },
  { pattern: /macrotrends\.net/i, score: 78, type: 'financial_data' },
  { pattern: /stockanalysis\.com/i, score: 75, type: 'financial_data' },
  { pattern: /wisesheets\.io/i, score: 72, type: 'financial_data' },

  // Mainstream Business News (72-80)
  { pattern: /cnbc\.com/i, score: 80, type: 'business_news' },
  { pattern: /businessinsider\.com/i, score: 72, type: 'business_news' },
  { pattern: /fortune\.com/i, score: 75, type: 'business_news' },
  { pattern: /forbes\.com/i, score: 72, type: 'business_news' },
  { pattern: /businesswire\.com/i, score: 78, type: 'press_release' },
  { pattern: /prnewswire\.com/i, score: 76, type: 'press_release' },
  { pattern: /globenewswire\.com/i, score: 74, type: 'press_release' },

  // Tech / Startup News (60-70)
  { pattern: /techcrunch\.com/i, score: 68, type: 'tech_news' },
  { pattern: /theverge\.com/i, score: 62, type: 'tech_news' },
  { pattern: /wired\.com/i, score: 65, type: 'tech_news' },
  { pattern: /venturebeat\.com/i, score: 62, type: 'tech_news' },
  { pattern: /crunchbase\.com/i, score: 70, type: 'startup_data' },
  { pattern: /pitchbook\.com/i, score: 75, type: 'startup_data' },

  // General News (50-60)
  { pattern: /nytimes\.com/i, score: 60, type: 'general_news' },
  { pattern: /theguardian\.com/i, score: 58, type: 'general_news' },
  { pattern: /bbc\.com/i, score: 60, type: 'general_news' },
  { pattern: /apnews\.com/i, score: 62, type: 'general_news' },

  // Wikipedia (informational, low confidence)
  { pattern: /wikipedia\.org/i, score: 35, type: 'encyclopedia' },

  // Social Media (low quality)
  { pattern: /twitter\.com|x\.com/i, score: 20, type: 'social_media' },
  { pattern: /linkedin\.com/i, score: 30, type: 'social_media' },
  { pattern: /reddit\.com/i, score: 25, type: 'social_media' },
];

/**
 * Get quality score for a URL
 * @param {string} url
 * @returns {{ score: number, type: string, label: string }}
 */
export function getSourceQuality(url) {
  if (!url || typeof url !== 'string') {
    return { score: 20, type: 'unknown', label: 'Unknown Source' };
  }

  for (const { pattern, score, type } of DOMAIN_SCORES) {
    if (pattern.test(url)) {
      return { score, type, label: getTypeLabel(type) };
    }
  }

  // Default for unknown domains
  return { score: 30, type: 'general', label: 'General Source' };
}

/**
 * Get a human-readable label for a source type
 */
function getTypeLabel(type) {
  const labels = {
    regulatory: 'SEC / Regulatory Filing',
    investor_relations: 'Investor Relations',
    annual_report: 'Annual Report',
    financial_news: 'Financial News',
    financial_data: 'Financial Data Platform',
    business_news: 'Business News',
    press_release: 'Press Release',
    tech_news: 'Tech News',
    startup_data: 'Startup Database',
    general_news: 'General News',
    encyclopedia: 'Encyclopedia',
    social_media: 'Social Media',
    general: 'General Source',
    unknown: 'Unknown Source',
  };
  return labels[type] || 'General Source';
}

/**
 * Get the display name from a URL (hostname without www.)
 */
export function getSourceDisplayName(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return hostname;
  } catch {
    return url;
  }
}

/**
 * Rank an array of sources by quality score
 */
export function rankSources(sources) {
  return sources
    .map((src) => ({
      ...src,
      ...getSourceQuality(src.url),
    }))
    .sort((a, b) => b.score - a.score);
}

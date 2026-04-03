export interface ProbableProfile {
    id: string;
    label: string;
    summary: string;
    supportingSignalKeys: string[];
    rationale: string;
    confidence: number;
    rank: number;
  }
  
  export interface EmployabilityDirection {
    id: string;
    ecosystem: string;
    label: string;
    whyItFits: string;
    caution?: string;
  }
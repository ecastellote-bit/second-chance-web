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
    signalWeights?: {
        pattern_analysis?: number;
        system_thinking?: number;
        opportunity_detection?: number;
        practical_organizing?: number;
        cultural_curiosity?: number;
        narrative_creation?: number;
        social_coordination?: number;
        empathic_listening?: number;
      };
  }
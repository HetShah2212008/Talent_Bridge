export type Embedding = number[];

export type AiJobItem = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  embedding?: Embedding | null;
};

export type AiCandidateItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  embedding?: Embedding | null;
  resume_text?: string | null;
};

export type RankedJob = AiJobItem & {
  score: number;
  matchPercent: number;
};

export type RankedCandidate = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  score: number;
  matchPercent: number;
};

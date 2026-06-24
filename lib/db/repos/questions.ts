// SPDX-License-Identifier: MIT

import { getDb } from '../pool';

export interface DbQuestion {
  id: string;
  domain_id: string;
  subdomain_id: string | null;
  title: string;
  body_md: string | null;
  quality_score: number;
  open: number;
  canonical: number;
  source_requirements: string | null;
  question_type: string | null;
  difficulty: string | null;
  language: string | null;
  visibility: string;
  required_source_kinds: string | null;
  required_source_count: number | null;
  required_source_authority_min: number | null;
  required_answer_format: string | null;
  forbidden_phrases: string | null;
  min_confidence: number | null;
  max_answer_length: number | null;
  precision: number | null;
  answerability: number | null;
  verifiability: number | null;
  non_redundancy: number | null;
  scope_fit: number | null;
  status: string;
  labels: string | null;
  curated_by: string | null;
  curation_rule_id: string | null;
  schema_version: string;
  created_by: string;
  created_at: string;
  last_activity_at: string;
}

export function createQuestion(question: DbQuestion): void {
  getDb().prepare(
    `INSERT INTO questions (id, domain_id, subdomain_id, title, body_md, quality_score, open, canonical, source_requirements, question_type, difficulty, language, visibility, required_source_kinds, required_source_count, required_source_authority_min, required_answer_format, forbidden_phrases, min_confidence, max_answer_length, precision, answerability, verifiability, non_redundancy, scope_fit, status, labels, curated_by, curation_rule_id, schema_version, created_by, created_at, last_activity_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    question.id,
    question.domain_id,
    question.subdomain_id,
    question.title,
    question.body_md,
    question.quality_score,
    question.open,
    question.canonical,
    question.source_requirements,
    question.question_type,
    question.difficulty,
    question.language,
    question.visibility,
    question.required_source_kinds,
    question.required_source_count,
    question.required_source_authority_min,
    question.required_answer_format,
    question.forbidden_phrases,
    question.min_confidence,
    question.max_answer_length,
    question.precision,
    question.answerability,
    question.verifiability,
    question.non_redundancy,
    question.scope_fit,
    question.status,
    question.labels,
    question.curated_by,
    question.curation_rule_id,
    question.schema_version,
    question.created_by,
    question.created_at,
    question.last_activity_at,
  );
}

export function getQuestion(id: string): DbQuestion | null {
  const row = getDb().prepare('SELECT * FROM questions WHERE id = ? LIMIT 1').get(id) as DbQuestion | undefined;
  return row ?? null;
}

export function listQuestionsByDomain(domainId: string, limit = 30): DbQuestion[] {
  return getDb().prepare('SELECT * FROM questions WHERE domain_id = ? ORDER BY last_activity_at DESC LIMIT ?').all(domainId, limit) as DbQuestion[];
}

export function listQuestionsBySubdomain(subdomainId: string, limit = 30): DbQuestion[] {
  return getDb().prepare('SELECT * FROM questions WHERE subdomain_id = ? ORDER BY last_activity_at DESC LIMIT ?').all(subdomainId, limit) as DbQuestion[];
}

export function listOpenQuestions(limit = 50): DbQuestion[] {
  return getDb().prepare('SELECT * FROM questions WHERE open = 1 ORDER BY last_activity_at DESC LIMIT ?').all(limit) as DbQuestion[];
}

export function updateQuestion(id: string, updates: Partial<DbQuestion>): void {
  const allowed = [
    'title',
    'body_md',
    'quality_score',
    'open',
    'canonical',
    'source_requirements',
    'question_type',
    'difficulty',
    'language',
    'visibility',
    'required_source_kinds',
    'required_source_count',
    'required_source_authority_min',
    'required_answer_format',
    'forbidden_phrases',
    'min_confidence',
    'max_answer_length',
    'precision',
    'answerability',
    'verifiability',
    'non_redundancy',
    'scope_fit',
    'status',
    'labels',
    'curated_by',
    'curation_rule_id',
    'schema_version',
    'last_activity_at',
  ] as const;
  const sets: string[] = [];
  const values: any[] = [];

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      sets.push(`${key} = ?`);
      values.push(updates[key]);
    }
  }

  if (!sets.length) return;
  values.push(id);
  getDb().prepare(`UPDATE questions SET ${sets.join(', ')} WHERE id = ?`).run(...values);
}

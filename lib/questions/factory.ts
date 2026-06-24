// SPDX-License-Identifier: MIT

// QuestionFactory converts normalized question definitions into DB-ready
// question payloads and provides minimal lifecycle helpers.

import { getDb } from '@/lib/db/pool';
import { QuestionDefinition, QuestionStatus, buildQuestionId } from '@/lib/questions/schema';

export interface DbQuestionPayload {
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

export function toDbQuestionPayload(definition: QuestionDefinition): DbQuestionPayload {
  return {
    id: buildQuestionId(definition.statement),
    domain_id: definition.domain_id,
    subdomain_id: definition.subdomain_id || null,
    title: definition.statement,
    body_md: definition.context || null,
    quality_score: definition.quality_score ?? 0,
    open: definition.status === 'open' ? 1 : 0,
    canonical: 0,
    source_requirements: definition.required_answer_format || null,
    question_type: definition.question_type || null,
    difficulty: definition.difficulty || null,
    language: definition.language || null,
    visibility: definition.visibility || 'draft',
    required_source_kinds: definition.required_source_kinds ? JSON.stringify(definition.required_source_kinds) : null,
    required_source_count: definition.required_source_count || null,
    required_source_authority_min: definition.required_source_authority_min || null,
    required_answer_format: definition.required_answer_format || null,
    forbidden_phrases: definition.forbidden_phrases ? JSON.stringify(definition.forbidden_phrases) : null,
    min_confidence: definition.min_confidence || null,
    max_answer_length: definition.max_answer_length || null,
    precision: definition.precision || null,
    answerability: definition.answerability || null,
    verifiability: definition.verifiability || null,
    non_redundancy: definition.non_redundancy || null,
    scope_fit: definition.scope_fit || null,
    status: definition.status || 'draft',
    labels: definition.labels ? JSON.stringify(definition.labels) : null,
    curated_by: definition.curated_by || null,
    curation_rule_id: definition.curation_rule_id || null,
    schema_version: '1.0.0',
    created_by: definition.created_by,
    created_at: definition.created_at || new Date().toISOString().slice(0, 19).replace('T', ' '),
    last_activity_at: definition.last_activity_at || definition.created_at || new Date().toISOString().slice(0, 19).replace('T', ' '),
  };
}

export function canTransition(status: QuestionStatus, next: QuestionStatus): boolean {
  if (status === next) return true;
  if (status === 'draft' && next === 'validating') return true;
  if (status === 'validating' && next === 'open') return true;
  if (status === 'validating' && next === 'draft') return true;
  if (status === 'open' && next === 'frozen') return true;
  if (status === 'open' && next === 'archived') return true;
  if (status === 'frozen' && next === 'merged') return true;
  if (status === 'frozen' && next === 'archived') return true;
  if (status === 'merged' && next === 'archived') return true;
  return false;
}

export function transitionQuestion(id: string, next: QuestionStatus, curatedBy?: string, ruleId?: string): void {
  const row = getDb().prepare('SELECT id, status FROM questions WHERE id = ? LIMIT 1').get(id) as { id: string; status: string } | undefined;
  if (!row) {
    throw new Error('question not found');
  }
  if (!canTransition(row.status as QuestionStatus, next)) {
    throw new Error(`invalid question transition from ${row.status} to ${next}`);
  }
  const sets = ['status = ?', 'last_activity_at = ?'];
  const values: any[] = [next, new Date().toISOString().slice(0, 19).replace('T', ' ')];
  if (curatedBy) {
    sets.push('curated_by = ?');
    values.push(curatedBy);
  }
  if (ruleId) {
    sets.push('curation_rule_id = ?');
    values.push(ruleId);
  }
  values.push(id);
  getDb().prepare(`UPDATE questions SET ${sets.join(', ')} WHERE id = ?`).run(...values);
}

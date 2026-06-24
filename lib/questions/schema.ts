// SPDX-License-Identifier: MIT

// Structured question definition schema and validation runtime.
// This module does not depend on the database layer so it can be reused
// in tests, API routes, and future worker pipelines.

export type QuestionType = 'exploratory' | 'comparison' | 'causal' | 'procedural' | 'factual' | 'normative';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type Visibility = 'draft' | 'internal' | 'public';
export type QuestionStatus = 'draft' | 'validating' | 'open' | 'frozen' | 'merged' | 'archived';
export type SourceKind = 'web' | 'paper' | 'report' | 'internal' | 'external_api';

export interface QuestionDefinition {
  statement: string;
  context?: string;
  domain_id: string;
  subdomain_id?: string;
  question_type: QuestionType;
  difficulty?: Difficulty;
  language?: string;
  visibility?: Visibility;
  required_source_kinds?: SourceKind[];
  required_source_count?: number;
  required_source_authority_min?: number;
  required_answer_format?: string;
  forbidden_phrases?: string[];
  min_confidence?: number;
  max_answer_length?: number;
  quality_score?: number;
  precision?: number;
  answerability?: number;
  verifiability?: number;
  non_redundancy?: number;
  scope_fit?: number;
  status?: QuestionStatus;
  labels?: string[];
  curated_by?: string;
  curation_rule_id?: string;
  created_by: string;
  created_at?: string;
  last_activity_at?: string;
}

export interface QuestionValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const QUESTION_TYPES: QuestionType[] = ['exploratory', 'comparison', 'causal', 'procedural', 'factual', 'normative'];

export function validateQuestionDefinition(question: Partial<QuestionDefinition>): QuestionValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!question.statement || typeof question.statement !== 'string' || question.statement.trim().length === 0) {
    errors.push('statement is required');
  }

  if (!question.domain_id || typeof question.domain_id !== 'string') {
    errors.push('domain_id is required');
  }

  if (question.subdomain_id && typeof question.subdomain_id !== 'string') {
    errors.push('subdomain_id must be a string when provided');
  }

  if (!question.question_type || !QUESTION_TYPES.includes(question.question_type as QuestionType)) {
    errors.push(`question_type must be one of: ${QUESTION_TYPES.join(', ')}`);
  }

  if (question.difficulty && !['beginner', 'intermediate', 'advanced'].includes(question.difficulty)) {
    errors.push('difficulty must be beginner, intermediate, or advanced');
  }

  if (question.visibility && !['draft', 'internal', 'public'].includes(question.visibility)) {
    errors.push('visibility must be draft, internal, or public');
  }

  if (question.status && !['draft', 'validating', 'open', 'frozen', 'merged', 'archived'].includes(question.status)) {
    errors.push('status must be draft, validating, open, frozen, merged, or archived');
  }

  if (question.required_source_kinds) {
    const invalid = question.required_source_kinds.filter((kind) => !REQUIRED_SOURCE_KINDS.includes(kind));
    if (invalid.length) {
      errors.push(`required_source_kinds contains invalid values: ${invalid.join(', ')}`);
    }
  }

  if (question.required_source_count !== undefined && (!Number.isInteger(question.required_source_count) || question.required_source_count < 0)) {
    errors.push('required_source_count must be a non-negative integer');
  }

  if (question.required_source_authority_min !== undefined && (typeof question.required_source_authority_min !== 'number' || question.required_source_authority_min < 0 || question.required_source_authority_min > 1)) {
    errors.push('required_source_authority_min must be a number between 0 and 1');
  }

  if (question.min_confidence !== undefined && (typeof question.min_confidence !== 'number' || question.min_confidence < 0 || question.min_confidence > 1)) {
    errors.push('min_confidence must be a number between 0 and 1');
  }

  if (question.max_answer_length !== undefined && (!Number.isInteger(question.max_answer_length) || question.max_answer_length <= 0)) {
    errors.push('max_answer_length must be a positive integer');
  }

  if (question.quality_score !== undefined && (typeof question.quality_score !== 'number' || question.quality_score < 0 || question.quality_score > 1)) {
    warnings.push('quality_score should be between 0 and 1');
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function normalizeQuestionDefinition(input: Partial<QuestionDefinition> & { statement: string; domain_id: string; question_type: QuestionType; status: QuestionStatus; created_by: string }): QuestionDefinition {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const created_at = input.created_at || now;
  const last_activity_at = input.last_activity_at || created_at;

  return {
    statement: input.statement.trim(),
    context: input.context?.trim() || undefined,
    domain_id: input.domain_id,
    subdomain_id: input.subdomain_id || undefined,
    question_type: input.question_type,
    difficulty: input.difficulty || undefined,
    language: input.language || undefined,
    visibility: input.visibility || 'draft',
    required_source_kinds: input.required_source_kinds || undefined,
    required_source_count: input.required_source_count || undefined,
    required_source_authority_min: input.required_source_authority_min || undefined,
    required_answer_format: input.required_answer_format || undefined,
    forbidden_phrases: input.forbidden_phrases || undefined,
    min_confidence: input.min_confidence || undefined,
    max_answer_length: input.max_answer_length || undefined,
    quality_score: input.quality_score ?? 0,
    precision: input.precision || undefined,
    answerability: input.answerability || undefined,
    verifiability: input.verifiability || undefined,
    non_redundancy: input.non_redundancy || undefined,
    scope_fit: input.scope_fit || undefined,
    status: input.status,
    labels: input.labels || undefined,
    curated_by: input.curated_by || undefined,
    curation_rule_id: input.curation_rule_id || undefined,
    created_by: input.created_by,
    created_at,
    last_activity_at,
  };
}

const REQUIRED_SOURCE_KINDS: SourceKind[] = ['web', 'paper', 'report', 'internal', 'external_api'];

export function buildQuestionId(statement: string): string {
  return `${statement.slice(0, 8)}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`;
}

export function isQuestionReadyForValidation(question: QuestionDefinition): boolean {
  const validation = validateQuestionDefinition(question);
  if (!validation.valid) return false;
  return Boolean(question.statement.trim().length > 0 && question.domain_id);
}

export function isQuestionReadyToOpen(question: QuestionDefinition): boolean {
  const requiredSourceCount = question.required_source_count ?? 0;
  const minConfidence = question.min_confidence ?? 0;
  const qualityScore = question.quality_score ?? 0;

  if (requiredSourceCount > 0) {
    return false;
  }

  if (minConfidence > 0 && qualityScore < minConfidence) {
    return false;
  }

  return true;
}

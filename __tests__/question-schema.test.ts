// SPDX-License-Identifier: MIT

import { describe, it, expect } from 'vitest';
import { validateQuestionDefinition, normalizeQuestionDefinition, QuestionStatus } from '@/lib/questions/schema';
import { applyQualityScores } from '@/lib/questions/quality';
import { curateQuestion, isQuestionReadyForValidation, isQuestionReadyToOpen } from '@/lib/questions/curation';
import { toDbQuestionPayload } from '@/lib/questions/factory';

describe('validateQuestionDefinition', () => {
  it('rejects invalid question_type and missing statement', () => {
    const result = validateQuestionDefinition({ statement: '', domain_id: 'ai', question_type: 'invalid' as any, status: 'draft' as QuestionStatus, created_by: 'u1' });
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'statement is required',
        'question_type must be one of: exploratory, comparison, causal, procedural, factual, normative',
      ]),
    );
  });

  it('accepts a minimal valid definition', () => {
    const result = validateQuestionDefinition({ statement: 'What?', domain_id: 'ai', question_type: 'exploratory', status: 'draft' as QuestionStatus, created_by: 'u1' });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('normalizeQuestionDefinition', () => {
  it('defaults timestamps, visibility, and schema_version', () => {
    const normalized = normalizeQuestionDefinition({
      statement: 'What?',
      domain_id: 'ai',
      question_type: 'comparison',
      status: 'draft',
      created_by: 'u1',
    });
    expect(normalized).toMatchObject({
      statement: 'What?',
      domain_id: 'ai',
      question_type: 'comparison',
      visibility: 'draft',
      schema_version: '1.0.0',
      created_by: 'u1',
    });
    expect(normalized.created_at).toBe(normalized.last_activity_at);
    expect(normalized.created_at).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });
});

describe('question curation', () => {
  const base = {
    statement: 'What?',
    context: 'Context',
    domain_id: 'ai',
    subdomain_id: 'sub_1',
    question_type: 'exploratory' as const,
    visibility: 'draft',
    status: 'draft' as QuestionStatus,
    created_by: 'u1',
    created_at: '2026-06-24 00:00:00',
    last_activity_at: '2026-06-24 00:00:00',
  };

  it('promotes draft to validating when the question is ready', () => {
    const curated = curateQuestion({ question: base, scores: { precision: 1, answerability: 1, verifiability: 1, non_redundancy: 1, scope_fit: 1 } });
    expect(curated.status).toBe('validating');
    expect(curated.quality_score).toBe(1);
    expect(curated.precision).toBe(1);
  });

  it('does not open when required source count is not satisfied', () => {
    const curated = curateQuestion({
      question: { ...base, status: 'validating' },
      scores: { precision: 1, answerability: 1, verifiability: 1, non_redundancy: 1, scope_fit: 1 },
    });
    expect(curated.status).toBe('validating');
  });

  it('opens when source requirements are satisfied', () => {
    const curated = curateQuestion({
      question: { ...base, status: 'validating', required_source_count: 0, min_confidence: 0 },
      scores: { precision: 1, answerability: 1, verifiability: 1, non_redundancy: 1, scope_fit: 1 },
    });
    expect(curated.status).toBe('open');
  });
});

describe('toDbQuestionPayload', () => {
  it('serializes structured fields for persistence', () => {
    const payload = toDbQuestionPayload({
      schema_version: '1.0.0',
      statement: 'What?',
      context: 'Context',
      domain_id: 'ai',
      subdomain_id: 'sub_1',
      question_type: 'exploratory',
      visibility: 'public',
      required_source_kinds: ['web', 'paper'],
      forbidden_phrases: ['secret'],
      labels: ['core'],
      status: 'open',
      curated_by: 'curator',
      curation_rule_id: 'rule_1',
      created_by: 'u1',
      created_at: '2026-06-24 00:00:00',
      last_activity_at: '2026-06-24 00:00:00',
    });
    expect(payload).toMatchObject({
      domain_id: 'ai',
      title: 'What?',
      body_md: 'Context',
      visibility: 'public',
      required_source_kinds: '["web","paper"]',
      forbidden_phrases: '["secret"]',
      labels: '["core"]',
      status: 'open',
      schema_version: '1.0.0',
    });
    expect(payload.id).toMatch(/^What-.{8}$/);
  });
});

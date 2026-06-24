// SPDX-License-Identifier: MIT

// Curation runtime for question lifecycle events.
// This module focuses on question status transitions and validation;
// downstream products can extend it with custom rules.

import { QuestionDefinition, QuestionStatus, validateQuestionDefinition } from '@/lib/questions/schema';
import { transitionQuestion } from '@/lib/questions/factory';
import { applyQualityScores } from '@/lib/questions/quality';

export interface CurationContext {
  question: QuestionDefinition;
  scores?: {
    precision?: number;
    answerability?: number;
    verifiability?: number;
    non_redundancy?: number;
    scope_fit?: number;
  };
  curatedBy?: string;
  ruleId?: string;
}

export function curateQuestion(context: CurationContext): QuestionDefinition {
  const quality = applyQualityScores(context.scores);
  const updated: QuestionDefinition = {
    ...context.question,
    quality_score: quality.quality_score,
    precision: quality.precision ?? context.question.precision,
    answerability: quality.answerability ?? context.question.answerability,
    verifiability: quality.verifiability ?? context.question.verifiability,
    non_redundancy: quality.non_redundancy ?? context.question.non_redundancy,
    scope_fit: quality.scope_fit ?? context.question.scope_fit,
    last_activity_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
  };

  if (updated.status === 'draft' && isQuestionReadyForValidation(updated)) {
    updated.status = 'validating';
  }

  if (updated.status === 'validating' && isQuestionReadyToOpen(updated)) {
    updated.status = 'open';
  }

  return updated;
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

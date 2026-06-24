// SPDX-License-Identifier: MIT

import Database from 'better-sqlite3';
import { getDb } from '../pool';

export default function migrateQuestionsDefinition(db: Database.Database): void {
  const hasColumn = (name: string) =>
    db.prepare("SELECT name FROM pragma_table_info('questions') WHERE name = ?").get(name) as { name: string } | undefined;

  if (!hasColumn('question_type')) db.exec(`ALTER TABLE questions ADD COLUMN question_type TEXT NULL`);
  if (!hasColumn('difficulty')) db.exec(`ALTER TABLE questions ADD COLUMN difficulty TEXT NULL`);
  if (!hasColumn('language')) db.exec(`ALTER TABLE questions ADD COLUMN language TEXT NULL`);
  if (!hasColumn('visibility')) db.exec(`ALTER TABLE questions ADD COLUMN visibility TEXT NOT NULL DEFAULT 'draft'`);
  if (!hasColumn('required_source_kinds')) db.exec(`ALTER TABLE questions ADD COLUMN required_source_kinds TEXT NULL`);
  if (!hasColumn('required_source_count')) db.exec(`ALTER TABLE questions ADD COLUMN required_source_count INT NULL`);
  if (!hasColumn('required_source_authority_min')) db.exec(`ALTER TABLE questions ADD COLUMN required_source_authority_min DECIMAL(4,2) NULL`);
  if (!hasColumn('required_answer_format')) db.exec(`ALTER TABLE questions ADD COLUMN required_answer_format TEXT NULL`);
  if (!hasColumn('forbidden_phrases')) db.exec(`ALTER TABLE questions ADD COLUMN forbidden_phrases TEXT NULL`);
  if (!hasColumn('min_confidence')) db.exec(`ALTER TABLE questions ADD COLUMN min_confidence DECIMAL(4,2) NULL`);
  if (!hasColumn('max_answer_length')) db.exec(`ALTER TABLE questions ADD COLUMN max_answer_length INT NULL`);
  if (!hasColumn('precision')) db.exec(`ALTER TABLE questions ADD COLUMN precision DECIMAL(4,2) NULL`);
  if (!hasColumn('answerability')) db.exec(`ALTER TABLE questions ADD COLUMN answerability DECIMAL(4,2) NULL`);
  if (!hasColumn('verifiability')) db.exec(`ALTER TABLE questions ADD COLUMN verifiability DECIMAL(4,2) NULL`);
  if (!hasColumn('non_redundancy')) db.exec(`ALTER TABLE questions ADD COLUMN non_redundancy DECIMAL(4,2) NULL`);
  if (!hasColumn('scope_fit')) db.exec(`ALTER TABLE questions ADD COLUMN scope_fit DECIMAL(4,2) NULL`);
  if (!hasColumn('status')) db.exec(`ALTER TABLE questions ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'`);
  if (!hasColumn('labels')) db.exec(`ALTER TABLE questions ADD COLUMN labels TEXT NULL`);
  if (!hasColumn('curated_by')) db.exec(`ALTER TABLE questions ADD COLUMN curated_by VARCHAR(64) NULL`);
  if (!hasColumn('curation_rule_id')) db.exec(`ALTER TABLE questions ADD COLUMN curation_rule_id VARCHAR(64) NULL`);
  if (!hasColumn('schema_version')) db.exec(`ALTER TABLE questions ADD COLUMN schema_version TEXT NOT NULL DEFAULT '1.0.0'`);

  db.exec('CREATE INDEX IF NOT EXISTS idx_questions_domain ON questions(domain_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_questions_subdomain ON questions(subdomain_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_questions_open ON questions(open)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status)');
}

CREATE TABLE IF NOT EXISTS classes (id TEXT PRIMARY KEY, teacher_code TEXT NOT NULL UNIQUE, label TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS learners (id TEXT PRIMARY KEY, class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE, name TEXT NOT NULL, avatar TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS learners_by_class ON learners(class_id);
CREATE TABLE IF NOT EXISTS progress (learner_id TEXT PRIMARY KEY REFERENCES learners(id) ON DELETE CASCADE, data TEXT NOT NULL, updated_at TEXT NOT NULL);
INSERT INTO classes (id, teacher_code, label, created_at) VALUES ('grade-6-term-1-cu5j', 'grade-6-term-1-teach-hxw3grhy', 'Grade 6 Term 1', datetime('now'));

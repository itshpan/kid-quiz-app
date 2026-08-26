-- Learning Lab progress storage (Cloudflare D1 / SQLite).
--
-- Access model: no passwords and no email addresses. A class has two codes.
-- The learner code lets you pick your name and save progress. The teacher
-- code additionally unlocks the progress dashboard. Both are long random
-- strings, so this is possession-of-a-code security — appropriate for quiz
-- scores, and deliberately not used for anything more sensitive than that.

CREATE TABLE IF NOT EXISTS classes (
    id           TEXT PRIMARY KEY,        -- the learner code
    teacher_code TEXT NOT NULL UNIQUE,    -- unlocks the dashboard
    label        TEXT NOT NULL,
    created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS learners (
    id         TEXT PRIMARY KEY,
    class_id   TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    avatar     TEXT NOT NULL,
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS learners_by_class ON learners(class_id);

-- Progress is one JSON document per learner. At family and classroom scale
-- that is far simpler than a normalised schema, and the dashboard parses it
-- directly. Attempt-level history can be added later without a migration.
CREATE TABLE IF NOT EXISTS progress (
    learner_id TEXT PRIMARY KEY REFERENCES learners(id) ON DELETE CASCADE,
    data       TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

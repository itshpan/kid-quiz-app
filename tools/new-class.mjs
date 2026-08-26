/* ==========================================================================
   new-class.mjs — prints the SQL to create a class and its two codes.

     node tools/new-class.mjs "Ezra · Grade 6"           # print the SQL
     npm run db:class -- "Ezra · Grade 6"                # print it
     ... | npx wrangler d1 execute learning-lab --remote --file=-

   Codes are generated here rather than typed, because a guessable code is
   the only thing standing between a stranger and a child's quiz scores.
   ========================================================================== */

import { randomBytes } from 'node:crypto';

// No 0/O/1/l — these get read aloud and typed by a twelve-year-old at 7am.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
const chunk = n => Array.from(randomBytes(n)).map(b => ALPHABET[b % ALPHABET.length]).join('');

const label = process.argv[2] || 'Learning Lab class';
const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 14) || 'class';

const learnerCode = `${slug}-${chunk(4)}`;
const teacherCode = `${slug}-teach-${chunk(8)}`;
const esc = s => s.replace(/'/g, "''");

console.error(`
  Class:        ${label}
  Learner code: ${learnerCode}       <- give this to the learners
  Teacher code: ${teacherCode}   <- keep this one for the dashboard
`);

console.log(`INSERT INTO classes (id, teacher_code, label, created_at)
VALUES ('${esc(learnerCode)}', '${esc(teacherCode)}', '${esc(label)}', datetime('now'));`);

-- PostgreSQL search indexes for article keyword search.
-- Prisma schema cannot fully express pg_trgm GIN operator-class indexes.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS article_title_zh_trgm_idx
  ON "Article" USING GIN ("titleZh" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS article_title_en_trgm_idx
  ON "Article" USING GIN ("titleEn" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS article_summary_zh_trgm_idx
  ON "Article" USING GIN ("summaryZh" gin_trgm_ops);

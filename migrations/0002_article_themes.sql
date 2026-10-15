CREATE TABLE articles_with_extended_themes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT NOT NULL,
  theme TEXT NOT NULL CHECK (theme IN ('red', 'yellow', 'green', 'blue', 'purple')),
  published INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO articles_with_extended_themes
  (id, title, excerpt, body, icon, theme, published, sort_order, created_at, updated_at)
SELECT id, title, excerpt, body, icon, theme, published, sort_order, created_at, updated_at
FROM articles;

DROP TABLE articles;
ALTER TABLE articles_with_extended_themes RENAME TO articles;

CREATE INDEX articles_publication_order ON articles (published, sort_order, created_at);

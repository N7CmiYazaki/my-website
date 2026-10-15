ALTER TABLE articles
ADD COLUMN article_type TEXT NOT NULL DEFAULT 'interest'
CHECK (article_type IN ('interest', 'blog'));

CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT NOT NULL,
  theme TEXT NOT NULL CHECK (theme IN ('blue', 'yellow', 'green')),
  published INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX articles_publication_order ON articles (published, sort_order, created_at);

INSERT INTO articles (id, title, excerpt, body, icon, theme, published, sort_order) VALUES
  (
    'web',
    'Webをつくる',
    '使いやすくて、心地よいWebのこと。',
    'Webサイトをつくるとき、見た目だけでなく「迷わず使えること」も大切にしています。

小さな工夫を積み重ねながら、使う人にとって心地よい場所をつくっていきたいです。',
    '⌘',
    'blue',
    1,
    1
  ),
  (
    'design',
    'デザインを考える',
    '色や形で、伝わり方を工夫すること。',
    '色や形、余白の取り方ひとつで、伝わり方は変わります。

情報を整理して、必要なことが自然と伝わるデザインを考えるのが好きです。',
    '◉',
    'yellow',
    1,
    2
  ),
  (
    'learning',
    '新しいことを学ぶ',
    '知らなかった世界をのぞいてみること。',
    '知らなかったことに出会うと、新しいアイデアのきっかけになります。

少しずつ試して、学んだことを自分なりの形にしていきます。',
    '✳',
    'green',
    1,
    3
  );

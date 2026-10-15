import type { InterestArticle } from "../../types/article";

type InterestCardProps = {
  article: InterestArticle;
  number: number;
  isDuplicate?: boolean;
};

export function InterestCard({ article, number, isDuplicate = false }: InterestCardProps) {
  return (
    <a
      class={`interest-card interest-${article.theme}`}
      href={`/articles/${article.id}`}
      aria-label={`${article.title}の記事を読む`}
      tabIndex={isDuplicate ? -1 : undefined}
    >
      <span class="interest-number">{String(number).padStart(2, "0")}</span>
      <div class="interest-icon" aria-hidden="true">{article.icon}</div>
      <h3>{article.title}</h3>
      <p>{article.excerpt}</p>
      <span class="card-arrow" aria-hidden="true">↗</span>
    </a>
  );
}

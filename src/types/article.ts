export type Article = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  icon: string;
  theme: "blue" | "yellow" | "green";
  published: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type InterestArticle = Pick<
  Article,
  "id" | "title" | "excerpt" | "icon" | "theme"
>;

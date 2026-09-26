const HIDDEN_PUBLIC_CATEGORY_SLUGS = new Set([
  "attention-letter",
  "international-theatre-festival",
  "international-theatre-festival-solo",
  "national-theatre-festival",
  "festival-live-stage",
]);

type BlogCategoryLike = {
  slug: string;
  title: string;
};

export function isPublicBlogCategory(category: BlogCategoryLike) {
  return !HIDDEN_PUBLIC_CATEGORY_SLUGS.has(category.slug);
}

export function displayBlogCategoryTitle(category: BlogCategoryLike) {
  return category.title === "Press Release" ? "Newsletter" : category.title;
}

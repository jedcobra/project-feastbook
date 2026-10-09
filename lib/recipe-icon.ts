import {
  BottleIcon,
  BowlIcon,
  CakeIcon,
  CupIcon,
  DrumstickIcon,
  FishIcon,
  ForkIcon,
  LeafIcon,
  PigIcon,
  WheatIcon,
} from '@/components/icons';

export type RecipeIconCategory =
  | 'fish'
  | 'pork'
  | 'meat'
  | 'sauce'
  | 'dessert'
  | 'bread'
  | 'soup'
  | 'drink'
  | 'vegetarian'
  | 'default';

// Checked in this order: what kind of dish it is (soup, dessert, bread,
// drink, sauce) beats what's in it, so "Chicken Noodle Soup" gets a soup
// bowl rather than a drumstick just because "chicken" is also in there.
// Specific proteins (fish, pork) come next, "meat" last as the catch-all
// for everything else animal — chicken, beef, turkey, lamb.
const KEYWORDS: [RecipeIconCategory, string[]][] = [
  ['soup', ['soup', 'stew', 'broth', 'chowder', 'bisque', 'chili']],
  ['dessert', ['cake', 'cookie', 'dessert', 'pie', 'chocolate', 'brownie', 'cupcake', 'pastry', 'tart', 'pudding', 'sweet']],
  ['bread', ['bread', 'loaf', 'dough', 'bun', 'baguette', 'focaccia', 'pizza', 'naan', 'roll', 'cornbread']],
  ['drink', ['smoothie', 'cocktail', 'juice', 'latte', 'shake', 'lemonade', 'coffee']],
  ['sauce', ['sauce', 'dressing', 'marinade', 'salsa', 'vinaigrette', 'gravy', 'glaze']],
  ['fish', ['salmon', 'tuna', 'shrimp', 'prawn', 'seafood', 'cod', 'trout', 'halibut', 'crab', 'lobster', 'anchovy', 'sardine', 'fish']],
  ['pork', ['pork', 'bacon', 'ham', 'sausage', 'prosciutto', 'chorizo', 'pancetta']],
  ['vegetarian', ['salad', 'veggie', 'vegetable', 'tofu', 'bean', 'lentil', 'greens', 'kale', 'spinach', 'vegan', 'vegetarian']],
  ['meat', ['chicken', 'turkey', 'beef', 'steak', 'burger', 'lamb', 'meatball', 'drumstick', 'brisket', 'ribs', 'duck', 'meat']],
];

export const RECIPE_ICON_BY_CATEGORY: Record<RecipeIconCategory, typeof ForkIcon> = {
  fish: FishIcon,
  pork: PigIcon,
  meat: DrumstickIcon,
  sauce: BottleIcon,
  dessert: CakeIcon,
  bread: WheatIcon,
  soup: BowlIcon,
  drink: CupIcon,
  vegetarian: LeafIcon,
  default: ForkIcon,
};

// A recipe without a cover photo gets a category icon instead of a blank
// box — guessed from the title/subtitle/tags, the only fields every list
// view already has loaded (ingredients aren't fetched for list rows).
export function classifyRecipeIcon(recipe: { title: string; subtitle?: string; tags?: string[] }): RecipeIconCategory {
  const haystack = `${recipe.title} ${recipe.subtitle ?? ''} ${(recipe.tags ?? []).join(' ')}`.toLowerCase();
  for (const [category, words] of KEYWORDS) {
    if (words.some((word) => new RegExp(`\\b${word}\\b`).test(haystack))) return category;
  }
  return 'default';
}

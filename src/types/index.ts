//ComputedRef
import type { ComputedRef } from 'vue';

export interface Recipe {
  id: string,
  title: string,
  category: string,
  cookTime?: number
  prepTime?: number,
  servings: string,
  cookedCount: number,
  tags?: Tag[],
  ingredients: string,
  steps: string,
  notes: string,
  imageName: string,
  imagePublicId: string,
  imageUrl?: string
}

export interface DBRecipe {
  id: string,
  title: string,
  category: string,
  cookTime?: number
  prepTime?: number,
  servings: string,
  cookedCount: number,
  tags?: Tag[]
  ingredients: string
  steps: string
  notes: string
  imageName: string,
  imagePublicId: string
}

export interface Tag {
  id?: string,
  name: string
}

export interface RecipeExtract {
  id: string,
  title: string,
  category: string,
  imageUrl?: string,
  imagePublicId?: string
}

export interface DBRecipeExtract {
  id: string,
  title: string,
  category: string,
  imagePublicId?: string
}

export interface User {
  id: string,
  createdAt: string
};

export interface ShoppingList {
  id: string,
  items: ShoppingListItem[]
}

export interface ShoppingListItem {
  checked: boolean,
  name: string
}

export interface FoodList {
  vegetables: Food[],
  fruits: Food[]
}

export interface Food {
  name_EN: string,
  name_HU: string,
  inSeason_HU: number[],
  inSeason_NL: number[],
  stored_HU: number[],
  stored_NL: number[],
  imageId?: string
}
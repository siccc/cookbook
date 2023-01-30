//ComputedRef
import type { ComputedRef } from 'vue';

export interface Recipe {
  id: number,
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
  id: number,
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
  id?: number,
  name: string
}

export interface RecipeExtract {
  id: number,
  title: string,
  category: string,
  imageUrl?: string
}

export interface DBRecipeExtract {
  id: number,
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
  inSeason: number[]
}
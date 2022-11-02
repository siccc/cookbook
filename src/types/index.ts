//ComputedRef
import type { ComputedRef } from 'vue';

export interface Recipe {
  id: number,
  title: string,
  category: string,
  cookTime: number
  prepTime?: number,
  servings: string,
  cookedCount: number,
  tags?: Tag[],
  ingredients: string,
  steps: string,
  notes: string,
  imageName?: string,
  totalTime?: ComputedRef<number>,
  imageUrl?: string
}

export interface DBRecipe {
  id: number,
  title: string,
  category: string,
  cookTime: number
  prepTime?: number,
  servings: string,
  cookedCount: number,
  tags?: Tag[]
  ingredients: string
  steps: string
  notes: string
  imageName: string
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
  imageName?: string
}


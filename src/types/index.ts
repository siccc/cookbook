export type Recipe = {
  id: number,
  title: string,
  category: string,
  cookTime: number
  prepTime?: number,
  servings: string,
  cookedCount: number,
  // TODO: tags: []
  ingredients: string
  steps: string
  notes: string
}
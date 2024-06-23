import foodsJson from '@/assets/seasonalFoods.json?raw';
import type { Food, FoodList } from '@/types';

const currentMonthIndex = new Date().getMonth();
const months = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december'
];

export function getSeasonalFoods(): FoodList {
  const foods = JSON.parse(foodsJson);
  return foods;
}

export function getSeasonalFoodsByMonth(month: string): FoodList {
  const monthIndex = months.indexOf(month);
  const foods = getSeasonalFoods();
  return {
    fruits: foods.fruits
      .filter((fruit: Food) => {
        return isInSeason(fruit, monthIndex);
      })
      .sort((a: Food, b: Food) => a.id.localeCompare(b.id)),
    vegetables: foods.vegetables
      .filter((veggie: Food) => {
        return isInSeason(veggie, monthIndex);
      })
      .sort((a: Food, b: Food) => a.id.localeCompare(b.id))
  };
}

function isInSeason(food: Food, monthIndex: number): boolean {
  if (food.inSeason_HU && !food.stored_HU) {
    return !!food.inSeason_HU[monthIndex];
  } else if (food.inSeason_HU && food.stored_HU) {
    return !!food.inSeason_HU[monthIndex] || !!food.stored_HU[monthIndex];
  }
  return false;
}

export function getCurrentMonth() {
  return { month: months[currentMonthIndex], monthIndex: currentMonthIndex };
}

export function getMonths() {
  return months;
}
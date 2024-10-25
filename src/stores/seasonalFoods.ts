import foodsJson from '@/assets/seasonalFoods.json?raw';
import hasOwnProperty from '@/utils/typeHelper';
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

export function getSeasonalFoodsByMonth(month: string, location: string): FoodList {
  const monthIndex = months.indexOf(month);
  const foods = getSeasonalFoods();
  return {
    fruits: foods.fruits
      .filter((fruit: Food) => {
        return shouldShowFood(fruit, monthIndex, location);
      })
      .sort((a: Food, b: Food) => a.id.localeCompare(b.id)),
    vegetables: foods.vegetables
      .filter((veggie: Food) => {
        return shouldShowFood(veggie, monthIndex, location);
      })
      .sort((a: Food, b: Food) => a.id.localeCompare(b.id))
  };
}

export function getFoodDataByLocation(prefix: string, location: string, food: Food): number[] {
  const propName = `${prefix}_${location.toUpperCase()}`;
  const fallBack = `${prefix}_HU`;

  if (hasOwnProperty(food, propName)) {
    return food[propName] as number[];
  } else if (hasOwnProperty(food, fallBack)) {
    return food[fallBack] as number[];
  } else {
    return [];
  }
};

export function getCurrentMonth() {
  return { month: months[currentMonthIndex], monthIndex: currentMonthIndex };
}

export function getMonths() {
  return months;
}

function shouldShowFood(food: Food, monthIndex: number, location: string): boolean {
  const foodStored = getFoodDataByLocation('stored', location, food)
  const foodInSeason = getFoodDataByLocation('inSeason', location, food)
  if (foodInSeason && !foodStored) {
    return !!foodInSeason[monthIndex];
  } else if (foodInSeason && foodStored) {
    return !!foodInSeason[monthIndex] || !!foodStored[monthIndex];
  }
  return false;
}

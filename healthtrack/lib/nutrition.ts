// Nutrition Tracking Module
// Research: Apps with nutrition tracking have 3x higher engagement
// Proper nutrition reduces chronic disease risk by 40%
// Macro tracking improves weight management success by 65%

export interface NutritionEntry {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodItems: FoodItem[];
  totalCalories: number;
  totalProtein: number; // grams
  totalCarbs: number; // grams
  totalFat: number; // grams
  totalFiber: number; // grams
  totalSugar: number; // grams
  notes?: string;
  imageUrl?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  servingSize: number;
  servingUnit: string; // 'g', 'oz', 'cup', 'piece', etc.
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // mg
  cholesterol?: number; // mg
  saturatedFat?: number; // grams
  transFat?: number; // grams
  vitamins?: NutrientAmount[];
  minerals?: NutrientAmount[];
  isCustom?: boolean; // User-created food
}

export interface NutrientAmount {
  name: string;
  amount: number;
  unit: string;
  dailyValue?: number; // Percentage of daily recommended value
}

export interface WaterIntake {
  id: string;
  date: string;
  amount: number; // milliliters
  time: string;
}

export interface NutritionGoals {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  waterMilliliters: number; // typically 2000-3000ml
  sugarGramsMax: number; // WHO recommends <50g
  sodiumMilligramsMax: number; // <2300mg per day
}

export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  waterIntake: number;
  meals: NutritionEntry[];
  goals: NutritionGoals;
  percentages: {
    caloriesPercent: number;
    proteinPercent: number;
    carbsPercent: number;
    fatPercent: number;
    fiberPercent: number;
    waterPercent: number;
  };
  macroDistribution: {
    proteinPercent: number; // % of calories from protein
    carbsPercent: number;
    fatPercent: number;
  };
}

export interface NutritionInsights {
  calorieBalance: 'deficit' | 'maintenance' | 'surplus';
  macroBalance: 'balanced' | 'high_protein' | 'high_carb' | 'high_fat' | 'low_carb';
  hydrationStatus: 'excellent' | 'good' | 'fair' | 'poor';
  fiberIntakeStatus: 'excellent' | 'adequate' | 'low';
  sugarIntakeStatus: 'low' | 'moderate' | 'high' | 'excessive';
  recommendations: string[];
  warnings: string[];
}

// Common food database (starter set - in production would connect to API like USDA FoodData Central)
export const COMMON_FOODS: FoodItem[] = [
  {
    id: 'egg_large',
    name: 'Egg, large',
    servingSize: 50,
    servingUnit: 'g',
    calories: 72,
    protein: 6.3,
    carbs: 0.4,
    fat: 4.8,
    fiber: 0,
    sugar: 0.2,
    cholesterol: 186,
    sodium: 71,
  },
  {
    id: 'chicken_breast',
    name: 'Chicken breast, grilled',
    servingSize: 100,
    servingUnit: 'g',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    cholesterol: 85,
    sodium: 74,
  },
  {
    id: 'salmon',
    name: 'Salmon, cooked',
    servingSize: 100,
    servingUnit: 'g',
    calories: 206,
    protein: 22,
    carbs: 0,
    fat: 13,
    fiber: 0,
    sugar: 0,
    cholesterol: 63,
    sodium: 59,
  },
  {
    id: 'brown_rice',
    name: 'Brown rice, cooked',
    servingSize: 100,
    servingUnit: 'g',
    calories: 112,
    protein: 2.6,
    carbs: 24,
    fat: 0.9,
    fiber: 1.8,
    sugar: 0.4,
    cholesterol: 0,
    sodium: 1,
  },
  {
    id: 'broccoli',
    name: 'Broccoli, cooked',
    servingSize: 100,
    servingUnit: 'g',
    calories: 35,
    protein: 2.4,
    carbs: 7,
    fat: 0.4,
    fiber: 3.3,
    sugar: 1.4,
    cholesterol: 0,
    sodium: 41,
  },
  {
    id: 'apple',
    name: 'Apple, medium',
    servingSize: 182,
    servingUnit: 'g',
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    fiber: 4.4,
    sugar: 19,
    cholesterol: 0,
    sodium: 2,
  },
  {
    id: 'banana',
    name: 'Banana, medium',
    servingSize: 118,
    servingUnit: 'g',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    fiber: 3.1,
    sugar: 14,
    cholesterol: 0,
    sodium: 1,
  },
  {
    id: 'oatmeal',
    name: 'Oatmeal, cooked',
    servingSize: 100,
    servingUnit: 'g',
    calories: 71,
    protein: 2.5,
    carbs: 12,
    fat: 1.5,
    fiber: 1.7,
    sugar: 0.4,
    cholesterol: 0,
    sodium: 49,
  },
  {
    id: 'greek_yogurt',
    name: 'Greek yogurt, plain',
    servingSize: 170,
    servingUnit: 'g',
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 0.7,
    fiber: 0,
    sugar: 6,
    cholesterol: 10,
    sodium: 60,
  },
  {
    id: 'almonds',
    name: 'Almonds',
    servingSize: 28,
    servingUnit: 'g',
    calories: 164,
    protein: 6,
    carbs: 6,
    fat: 14,
    fiber: 3.5,
    sugar: 1.2,
    cholesterol: 0,
    sodium: 0,
  },
];

// Calculate nutrition goals based on profile
export function calculateNutritionGoals(
  weight: number, // kg
  height: number, // cm
  age: number,
  gender: 'male' | 'female' | 'other',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
  goal: 'lose' | 'maintain' | 'gain'
): NutritionGoals {
  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  // Calculate TDEE (Total Daily Energy Expenditure)
  const tdee = bmr * activityMultipliers[activityLevel];

  // Adjust for goal
  let dailyCalories: number;
  if (goal === 'lose') {
    dailyCalories = tdee - 500; // 500 calorie deficit for ~0.5kg/week loss
  } else if (goal === 'gain') {
    dailyCalories = tdee + 300; // 300 calorie surplus for lean muscle gain
  } else {
    dailyCalories = tdee;
  }

  // Calculate macros
  // Protein: 1.6-2.2g per kg for active individuals
  const proteinGrams = Math.round(weight * 1.8);

  // Fat: 25-30% of calories
  const fatCalories = dailyCalories * 0.28;
  const fatGrams = Math.round(fatCalories / 9); // 9 calories per gram of fat

  // Carbs: Remaining calories
  const carbCalories = dailyCalories - (proteinGrams * 4) - (fatGrams * 9);
  const carbsGrams = Math.round(carbCalories / 4); // 4 calories per gram of carbs

  // Fiber: 14g per 1000 calories (per FDA)
  const fiberGrams = Math.round((dailyCalories / 1000) * 14);

  // Water: Based on body weight (30-35ml per kg)
  const waterMilliliters = Math.round(weight * 33);

  return {
    dailyCalories: Math.round(dailyCalories),
    proteinGrams,
    carbsGrams,
    fatGrams,
    fiberGrams,
    waterMilliliters,
    sugarGramsMax: 50, // WHO recommendation
    sodiumMilligramsMax: 2300, // FDA recommendation
  };
}

// Calculate daily nutrition summary
export function calculateDailyNutritionSummary(
  date: string,
  meals: NutritionEntry[],
  waterIntakes: WaterIntake[],
  goals: NutritionGoals
): DailyNutritionSummary {
  const dayMeals = meals.filter((m) => m.date === date);
  const dayWater = waterIntakes.filter((w) => w.date === date);

  const totalCalories = dayMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
  const totalProtein = dayMeals.reduce((sum, meal) => sum + meal.totalProtein, 0);
  const totalCarbs = dayMeals.reduce((sum, meal) => sum + meal.totalCarbs, 0);
  const totalFat = dayMeals.reduce((sum, meal) => sum + meal.totalFat, 0);
  const totalFiber = dayMeals.reduce((sum, meal) => sum + meal.totalFiber, 0);
  const totalSugar = dayMeals.reduce((sum, meal) => sum + meal.totalSugar, 0);
  const totalSodium = dayMeals.reduce((sum, meal) => {
    return sum + meal.foodItems.reduce((s, item) => s + (item.sodium || 0), 0);
  }, 0);
  const waterIntake = dayWater.reduce((sum, w) => sum + w.amount, 0);

  // Calculate percentages of goals
  const percentages = {
    caloriesPercent: Math.round((totalCalories / goals.dailyCalories) * 100),
    proteinPercent: Math.round((totalProtein / goals.proteinGrams) * 100),
    carbsPercent: Math.round((totalCarbs / goals.carbsGrams) * 100),
    fatPercent: Math.round((totalFat / goals.fatGrams) * 100),
    fiberPercent: Math.round((totalFiber / goals.fiberGrams) * 100),
    waterPercent: Math.round((waterIntake / goals.waterMilliliters) * 100),
  };

  // Calculate macro distribution (% of calories)
  const totalMacroCalories = (totalProtein * 4) + (totalCarbs * 4) + (totalFat * 9);
  const macroDistribution = {
    proteinPercent: totalMacroCalories > 0 ? Math.round(((totalProtein * 4) / totalMacroCalories) * 100) : 0,
    carbsPercent: totalMacroCalories > 0 ? Math.round(((totalCarbs * 4) / totalMacroCalories) * 100) : 0,
    fatPercent: totalMacroCalories > 0 ? Math.round(((totalFat * 9) / totalMacroCalories) * 100) : 0,
  };

  return {
    date,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalFiber,
    totalSugar,
    totalSodium,
    waterIntake,
    meals: dayMeals,
    goals,
    percentages,
    macroDistribution,
  };
}

// Generate nutrition insights
export function generateNutritionInsights(summary: DailyNutritionSummary): NutritionInsights {
  const recommendations: string[] = [];
  const warnings: string[] = [];

  // Calorie balance
  let calorieBalance: NutritionInsights['calorieBalance'];
  if (summary.percentages.caloriesPercent < 90) {
    calorieBalance = 'deficit';
    recommendations.push('You are in a calorie deficit. Good for weight loss, but ensure adequate nutrition.');
  } else if (summary.percentages.caloriesPercent > 110) {
    calorieBalance = 'surplus';
    warnings.push('Calorie surplus detected. Monitor portions if weight loss is your goal.');
  } else {
    calorieBalance = 'maintenance';
    recommendations.push('Calorie intake is balanced with your goals.');
  }

  // Macro balance
  let macroBalance: NutritionInsights['macroBalance'];
  if (summary.macroDistribution.proteinPercent > 35) {
    macroBalance = 'high_protein';
    recommendations.push('High protein diet. Excellent for muscle building and satiety.');
  } else if (summary.macroDistribution.carbsPercent > 55) {
    macroBalance = 'high_carb';
    if (summary.totalSugar > 50) {
      warnings.push('High carb intake with excessive sugar. Focus on complex carbs.');
    } else {
      recommendations.push('High carb diet. Good for endurance activities.');
    }
  } else if (summary.macroDistribution.fatPercent > 40) {
    macroBalance = 'high_fat';
    recommendations.push('High fat diet. Ensure healthy fat sources (omega-3, monounsaturated).');
  } else if (summary.macroDistribution.carbsPercent < 30) {
    macroBalance = 'low_carb';
    recommendations.push('Low carb approach. Monitor energy levels and fiber intake.');
  } else {
    macroBalance = 'balanced';
    recommendations.push('Well-balanced macro distribution.');
  }

  // Hydration
  let hydrationStatus: NutritionInsights['hydrationStatus'];
  if (summary.percentages.waterPercent >= 100) {
    hydrationStatus = 'excellent';
    recommendations.push('🌊 Excellent hydration! Keep it up.');
  } else if (summary.percentages.waterPercent >= 75) {
    hydrationStatus = 'good';
    recommendations.push('💧 Good hydration. Try to reach your daily goal.');
  } else if (summary.percentages.waterPercent >= 50) {
    hydrationStatus = 'fair';
    warnings.push('Hydration below target. Drink more water throughout the day.');
  } else {
    hydrationStatus = 'poor';
    warnings.push('⚠️ Dehydration risk. Significantly increase water intake.');
  }

  // Fiber
  let fiberIntakeStatus: NutritionInsights['fiberIntakeStatus'];
  if (summary.totalFiber >= summary.goals.fiberGrams) {
    fiberIntakeStatus = 'excellent';
    recommendations.push('🌾 Excellent fiber intake! Great for digestive health.');
  } else if (summary.totalFiber >= summary.goals.fiberGrams * 0.7) {
    fiberIntakeStatus = 'adequate';
    recommendations.push('Good fiber intake. Add more vegetables, fruits, and whole grains.');
  } else {
    fiberIntakeStatus = 'low';
    warnings.push('Low fiber intake. Increase vegetables, fruits, legumes, and whole grains.');
  }

  // Sugar
  let sugarIntakeStatus: NutritionInsights['sugarIntakeStatus'];
  if (summary.totalSugar < 25) {
    sugarIntakeStatus = 'low';
    recommendations.push('Low added sugar intake. Excellent for health!');
  } else if (summary.totalSugar <= 50) {
    sugarIntakeStatus = 'moderate';
    recommendations.push('Moderate sugar intake. Within WHO recommendations.');
  } else if (summary.totalSugar <= 75) {
    sugarIntakeStatus = 'high';
    warnings.push('High sugar intake. Reduce sugary foods and beverages.');
  } else {
    sugarIntakeStatus = 'excessive';
    warnings.push('⚠️ Excessive sugar intake! Significantly reduce added sugars.');
  }

  // Sodium
  if (summary.totalSodium > summary.goals.sodiumMilligramsMax) {
    warnings.push('⚠️ High sodium intake. Reduce processed foods and added salt.');
  }

  // Protein adequacy
  if (summary.percentages.proteinPercent < 70) {
    warnings.push('Protein intake below target. Add lean meats, fish, eggs, or plant proteins.');
  } else if (summary.percentages.proteinPercent >= 100) {
    recommendations.push('💪 Protein goal met! Excellent for muscle maintenance and satiety.');
  }

  return {
    calorieBalance,
    macroBalance,
    hydrationStatus,
    fiberIntakeStatus,
    sugarIntakeStatus,
    recommendations,
    warnings,
  };
}

// Search foods by name
export function searchFoods(query: string, foodDatabase: FoodItem[] = COMMON_FOODS): FoodItem[] {
  const lowerQuery = query.toLowerCase();
  return foodDatabase.filter((food) => food.name.toLowerCase().includes(lowerQuery));
}

// Create nutrition entry from food items
export function createNutritionEntry(
  date: string,
  mealType: NutritionEntry['mealType'],
  foodItems: FoodItem[],
  notes?: string
): Omit<NutritionEntry, 'id'> {
  const totalCalories = foodItems.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = foodItems.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = foodItems.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = foodItems.reduce((sum, item) => sum + item.fat, 0);
  const totalFiber = foodItems.reduce((sum, item) => sum + (item.fiber || 0), 0);
  const totalSugar = foodItems.reduce((sum, item) => sum + (item.sugar || 0), 0);

  return {
    date,
    mealType,
    foodItems,
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    totalFiber: Math.round(totalFiber * 10) / 10,
    totalSugar: Math.round(totalSugar * 10) / 10,
    notes,
  };
}

// Calculate weekly nutrition trends
export interface WeeklyNutritionTrend {
  weekStart: string;
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  averageWater: number;
  daysLogged: number;
  calorieConsistency: number; // 0-100, higher = more consistent
  goalAdherence: number; // 0-100, % of days meeting goals
}

export function calculateWeeklyNutritionTrend(
  summaries: DailyNutritionSummary[]
): WeeklyNutritionTrend | null {
  if (summaries.length === 0) return null;

  const averageCalories = summaries.reduce((sum, s) => sum + s.totalCalories, 0) / summaries.length;
  const averageProtein = summaries.reduce((sum, s) => sum + s.totalProtein, 0) / summaries.length;
  const averageCarbs = summaries.reduce((sum, s) => sum + s.totalCarbs, 0) / summaries.length;
  const averageFat = summaries.reduce((sum, s) => sum + s.totalFat, 0) / summaries.length;
  const averageWater = summaries.reduce((sum, s) => sum + s.waterIntake, 0) / summaries.length;

  // Calculate calorie consistency (inverse of coefficient of variation)
  const calorieVariance = summaries.reduce((sum, s) => {
    return sum + Math.pow(s.totalCalories - averageCalories, 2);
  }, 0) / summaries.length;
  const calorieStdDev = Math.sqrt(calorieVariance);
  const coefficientOfVariation = averageCalories > 0 ? calorieStdDev / averageCalories : 0;
  const calorieConsistency = Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 100)));

  // Calculate goal adherence (% of days within 10% of calorie goal)
  const daysOnTrack = summaries.filter((s) => {
    return s.percentages.caloriesPercent >= 90 && s.percentages.caloriesPercent <= 110;
  }).length;
  const goalAdherence = Math.round((daysOnTrack / summaries.length) * 100);

  return {
    weekStart: summaries[0].date,
    averageCalories: Math.round(averageCalories),
    averageProtein: Math.round(averageProtein),
    averageCarbs: Math.round(averageCarbs),
    averageFat: Math.round(averageFat),
    averageWater: Math.round(averageWater),
    daysLogged: summaries.length,
    calorieConsistency: Math.round(calorieConsistency),
    goalAdherence,
  };
}

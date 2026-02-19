import { MilkType, Session } from '../backend';

export function calculateVLCAmount(quantity: number, fat: number, snf: number, rate: number): number {
  return quantity * ((fat * rate * 6 / 650) + (snf * rate * 4 / 900));
}

export function calculateThekadariLessAdd(fat: number, quantity: number): number {
  return (fat - 65) * quantity * 1.5 / 100;
}

export function calculateThekadariNetMilk(quantity: number, lessAdd: number): number {
  return quantity + lessAdd;
}

export function calculateThekadariAmount(netMilk: number, rate: number): number {
  return netMilk * rate;
}

export function calculateAmount(
  milkType: MilkType,
  quantity: number,
  fat: number,
  snf: number | undefined,
  rate: number
): { amount: number; lessAdd?: number; netMilk?: number } {
  if (milkType === MilkType.vlc) {
    const amount = calculateVLCAmount(quantity, fat, snf || 0, rate);
    return { amount };
  } else {
    const lessAdd = calculateThekadariLessAdd(fat, quantity);
    const netMilk = calculateThekadariNetMilk(quantity, lessAdd);
    const amount = calculateThekadariAmount(netMilk, rate);
    return { amount, lessAdd, netMilk };
  }
}

export function getCurrentSession(): Session {
  const hour = new Date().getHours();
  return hour >= 3 && hour < 15 ? Session.morning : Session.evening;
}

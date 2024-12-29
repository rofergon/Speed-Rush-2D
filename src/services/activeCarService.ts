import { Car } from '../types/car';

const ACTIVE_CAR_KEY = 'active_car';

export const activeCarService = {
  setActiveCar(car: Car) {
    localStorage.setItem(ACTIVE_CAR_KEY, JSON.stringify(car));
  },

  getActiveCar(): Car | null {
    const stored = localStorage.getItem(ACTIVE_CAR_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  },

  clearActiveCar() {
    localStorage.removeItem(ACTIVE_CAR_KEY);
  }
}; 
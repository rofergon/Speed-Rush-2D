import { Car } from '../types/car';

class ActiveCarService {
  private activeCar: Car | undefined;

  setActiveCar(car: Car) {
    this.activeCar = car;
  }

  getActiveCar(): Car | undefined {
    return this.activeCar;
  }

  clearActiveCar() {
    this.activeCar = undefined;
  }
}

export const activeCarService = new ActiveCarService(); 
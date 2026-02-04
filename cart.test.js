const calculateCartTotal = require('./cart');

describe('Функция calculateCartTotal', () => {

  // --- ПОЗИТИВНЫЕ СЦЕНАРИИ ---
  describe('Позитивные сценарии (Успех)', () => {

    test('Должна корректно считать сумму без автоскидки', () => {
      const prices = [500, 100, 100];
      const discount = 10;

      const result = calculateCartTotal(prices, discount);

      // (500 + 100 + 100) = 700 → -10% = 630
      expect(result).toEqual({
        status: 'success',
        total: 630
      });
    });

    test('Должна корректно применять персональную и автоматическую скидки', () => {
      const prices = [4000, 2000];
      const discount = 10;

      const result = calculateCartTotal(prices, discount);

      // 6000 → -10% = 5400 → -5% = 5130
      expect(result.total).toBe(5130);
    });

  });

  // --- НЕГАТИВНЫЕ СЦЕНАРИИ ---
  describe('Негативные сценарии (Ошибки)', () => {

    test('Должна выбросить ошибку, если список цен товаров пуст или не массив', () => {
      expect(() => calculateCartTotal([], 10))
        .toThrow('Список товаров пуст');

      expect(() => calculateCartTotal(null, 10))
        .toThrow('Список товаров пуст');
    });

    test('Должна выбросить ошибку при отрицательной цене', () => {
      expect(() => calculateCartTotal([500, -100], 5))
        .toThrow('Цена товара не может быть отрицательной');
    });

    test('Должна выбросить ошибку при отрицательной персональной скидке', () => {
      expect(() => calculateCartTotal([500], -10))
        .toThrow('Процент скидки не может быть отрицательным');
    });

  });

  // --- ГРАНИЧНЫЕ ЗНАЧЕНИЯ ---
  describe('Граничные значения', () => {

    test('Должна корректно работать при нулевой персональной скидке', () => {
      const result = calculateCartTotal([1000], 0);
      expect(result.total).toBe(1000);
    });

    test('Должна применить автоскидку при сумме чуть больше 5000', () => {
      const result = calculateCartTotal([5001], 0);
      expect(result.total).toBe(4750.95);
    });

    test('Не должна применять автоскидку при сумме ровно 5000', () => {
      const result = calculateCartTotal([5000], 0);
      expect(result.total).toBe(5000);
    });

  });

});

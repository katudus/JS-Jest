const calculateCartTotal = require('./cart');

describe('Функция calculateCartTotal', () => {

  // --- ПОЗИТИВНЫЕ СЦЕНАРИИ ---
  describe('Позитивные сценарии (Успех)', () => {

    test('Должна корректно считать сумму с учетом количества без автоскидки', () => {
      const items = [
        { name: 'Книга', quantity: 2 },
        { name: 'Ручка', quantity: 3 }
      ];
      const prices = [500, 100];
      const discount = 10;

      const result = calculateCartTotal(items, prices, discount);

      // (2*500 + 3*100) = 1300 → -10% = 1170
      expect(result).toEqual({
        status: 'success',
        total: 1170
      });
    });

    test('Должна корректно применять персональную и автоматическую скидки', () => {
      const items = [
        { name: 'Телефон', quantity: 1 },
        { name: 'Наушники', quantity: 2 }
      ];
      const prices = [4000, 1000];
      const discount = 10;

      const result = calculateCartTotal(items, prices, discount);

      // 6000 → -10% = 5400 → -5% = 5130
      expect(result.status).toBe('success');
      expect(result.total).toBe(5130);
    });

  });

  // --- НЕГАТИВНЫЕ СЦЕНАРИИ ---
  describe('Негативные сценарии (Ошибки)', () => {

    test('Должна выбросить ошибку, если список товаров пуст или не массив', () => {
      expect(() => calculateCartTotal([], [], 10))
        .toThrow('Список товаров пуст');

      expect(() => calculateCartTotal(null, [], 10))
        .toThrow('Список товаров пуст');
    });

    test('Должна выбросить ошибку при несоответствии товаров и цен', () => {
      const items = [{ name: 'Книга', quantity: 1 }];
      const prices = [];

      expect(() => calculateCartTotal(items, prices, 5))
        .toThrow('Список цен должен соответствовать списку товаров');
    });

    test('Должна выбросить ошибку при отрицательной цене', () => {
      const items = [{ name: 'Книга', quantity: 1 }];
      const prices = [-500];

      expect(() => calculateCartTotal(items, prices, 5))
        .toThrow('Цена товара не может быть отрицательной');
    });

    test('Должна выбросить ошибку при отрицательной персональной скидке', () => {
      const items = [{ name: 'Книга', quantity: 1 }];
      const prices = [500];

      expect(() => calculateCartTotal(items, prices, -10))
        .toThrow('Процент скидки не может быть отрицательным');
    });

    test('Должна выбросить ошибку при нулевом или отрицательном количестве товара', () => {
      const items = [{ name: 'Книга', quantity: 0 }];
      const prices = [500];

      expect(() => calculateCartTotal(items, prices, 10))
        .toThrow('Количество товара должно быть положительным');
    });

  });

  // --- ГРАНИЧНЫЕ ЗНАЧЕНИЯ ---
  describe('Граничные значения', () => {

    test('Должна корректно работать при нулевой персональной скидке', () => {
      const items = [{ name: 'Товар', quantity: 1 }];
      const prices = [1000];

      const result = calculateCartTotal(items, prices, 0);

      expect(result.total).toBe(1000);
    });

    test('Должна применить автоскидку ровно при сумме чуть больше 5000', () => {
      const items = [{ name: 'Товар', quantity: 1 }];
      const prices = [5001];

      const result = calculateCartTotal(items, prices, 0);

      // 5001 → -5% = 4750.95
      expect(result.total).toBe(4750.95);
    });

    test('Не должна применять автоскидку при сумме ровно 5000', () => {
      const items = [{ name: 'Товар', quantity: 1 }];
      const prices = [5000];

      const result = calculateCartTotal(items, prices, 0);

      expect(result.total).toBe(5000);
    });

  });

});
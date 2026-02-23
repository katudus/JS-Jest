jest.mock('./notificationService', () => ({
    sendPromoCoupon: jest.fn()
}));

const calculateCartTotal = require('./cart');
const NotificationService = require('./notificationService');

describe('Функция calculateCartTotal', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- ПОЗИТИВНЫЕ СЦЕНАРИИ ---
    describe('Позитивные сценарии', () => {

        test('Корректный расчёт суммы без автоскидки и без купона', async () => {

            const result = await calculateCartTotal({
                userId: 1,
                prices: [500,100,100],
                discount: 10
            });

            expect(result).toEqual({
                status: 'success',
                total: 630
            });

            expect(NotificationService.sendPromoCoupon).not.toHaveBeenCalled();
        });

        test('Применяются обе скидки без отправки купона', async () => {

            const result = await calculateCartTotal({
                userId: 1,
                prices: [4000,2000],
                discount: 10
            });

            expect(result.total).toBe(5130);
            expect(NotificationService.sendPromoCoupon).not.toHaveBeenCalled();
        });

        test('Отправка купона если сумма > 10000', async () => {

            const result = await calculateCartTotal({
                userId: 42,
                prices: [6000,6000],
                discount: 0
            });

            expect(result.total).toBeGreaterThan(10000);
            expect(NotificationService.sendPromoCoupon).toHaveBeenCalledTimes(1);
            expect(NotificationService.sendPromoCoupon).toHaveBeenCalledWith(42);
        });
    });

    // --- НЕГАТИВНЫЕ СЦЕНАРИИ ---
    describe('Ошибки', () => {

        test('Пустая корзина', async () => {

            await expect(calculateCartTotal({
                userId: 1,
                prices: [],
                discount: 10
            })).rejects.toThrow('Список товаров пуст');

            expect(NotificationService.sendPromoCoupon).not.toHaveBeenCalled();
        });

        test('Отрицательная скидка', async () => {

            await expect(calculateCartTotal({
                userId: 1,
                prices: [1000],
                discount: -5
            })).rejects.toThrow('Процент скидки не может быть отрицательным');
        });

        test('Отрицательная цена', async () => {

            await expect(calculateCartTotal({
                userId: 1,
                prices: [1000,-200],
                discount: 0
            })).rejects.toThrow('Цена товара не может быть отрицательной');
        });
    });

    // --- ГРАНИЦЫ ---
    describe('Граничные значения', () => {

        test('Ровно 5000 — без автоскидки', async () => {

            const result = await calculateCartTotal({
                userId: 1,
                prices: [5000],
                discount: 0
            });

            expect(result.total).toBe(5000);
            expect(NotificationService.sendPromoCoupon).not.toHaveBeenCalled();
        });

        test('Чуть больше 5000 — автоскидка применяется', async () => {

            const result = await calculateCartTotal({
                userId: 1,
                prices: [5001],
                discount: 0
            });

            expect(result.total).toBe(4750.95);
            expect(NotificationService.sendPromoCoupon).not.toHaveBeenCalled();
        });

        test('Чуть меньше 10000 — купон НЕ отправляется', async () => {

            const result = await calculateCartTotal({
                userId: 7,
                prices: [10526],
                discount: 0
            });

            expect(result.total).toBeLessThan(10000);
            expect(NotificationService.sendPromoCoupon).not.toHaveBeenCalled();
        });

        test('Чуть больше 10000 — купон отправляется', async () => {

            const result = await calculateCartTotal({
                userId: 42,
                prices: [10527],
                discount: 0
            });

            expect(result.total).toBeGreaterThan(10000);
            expect(NotificationService.sendPromoCoupon).toHaveBeenCalledTimes(1);
            expect(NotificationService.sendPromoCoupon).toHaveBeenCalledWith(42);
        });
    });
});
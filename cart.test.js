jest.mock('./cartRepository', () => ({
    getCartPrices: jest.fn()
}));

jest.mock('./notificationService', () => ({
    sendPromoCoupon: jest.fn()
}));

const calculateCartTotal = require('./cart');
const CartRepository = require('./cartRepository');
const NotificationService = require('./notificationService');

describe('Функция calculateCartTotal', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- ПОЗИТИВНЫЕ СЦЕНАРИИ ---
    describe('Позитивные сценарии', () => {

        test('Корректный расчёт суммы без автоматической скидки и без уведомления', async () => {
            CartRepository.getCartPrices.mockResolvedValue([500, 100, 100]);

            const result = await calculateCartTotal(1, 10);

            expect(result).toEqual({
                status: 'success',
                total: 630
            });

            expect(NotificationService.sendPromoCoupon).not.toHaveBeenCalled();
        });

        test('Применение персональной и автоматической скидок без отправки купона', async () => {
            CartRepository.getCartPrices.mockResolvedValue([4000, 2000]);

            const result = await calculateCartTotal(1, 10);

            expect(result.total).toBe(5130);
            expect(NotificationService.sendPromoCoupon).not.toHaveBeenCalled();
        });

        test('Отправка купона при сумме больше 10 000 рублей', async () => {
            CartRepository.getCartPrices.mockResolvedValue([6000, 6000]);

            const result = await calculateCartTotal(42, 0);

            expect(result.total).toBeGreaterThan(10000);
            expect(NotificationService.sendPromoCoupon).toHaveBeenCalledTimes(1);
            expect(NotificationService.sendPromoCoupon).toHaveBeenCalledWith(42);
        });
    });

    // --- НЕГАТИВНЫЕ СЦЕНАРИИ ---
    describe('Негативные сценарии', () => {

        test('Пустая корзина из БД — расчёт не производится и уведомление не отправляется', async () => {
            CartRepository.getCartPrices.mockResolvedValue([]);

            await expect(calculateCartTotal(1, 10))
                .rejects
                .toThrow('Список товаров пуст');

            expect(NotificationService.sendPromoCoupon).not.toHaveBeenCalled();
        });

        test('Ошибка при отрицательной персональной скидке', async () => {
            CartRepository.getCartPrices.mockResolvedValue([1000]);

            await expect(calculateCartTotal(1, -5))
                .rejects
                .toThrow('Процент скидки не может быть отрицательным');
        });

        test('Ошибка при отрицательной цене товара', async () => {
            CartRepository.getCartPrices.mockResolvedValue([1000, -200]);

            await expect(calculateCartTotal(1, 0))
                .rejects
                .toThrow('Цена товара не может быть отрицательной');
        });
    });

    // --- ГРАНИЧНЫЕ ЗНАЧЕНИЯ ---
    describe('Граничные значения', () => {

        test('Сумма ровно 5000 — автоматическая скидка не применяется', async () => {
            CartRepository.getCartPrices.mockResolvedValue([5000]);

            const result = await calculateCartTotal(1, 0);

            expect(result.total).toBe(5000);
            expect(NotificationService.sendPromoCoupon).not.toHaveBeenCalled();
        });

        test('Сумма чуть больше 5000 — применяется автоматическая скидка', async () => {
            CartRepository.getCartPrices.mockResolvedValue([5001]);

            const result = await calculateCartTotal(1, 0);

            expect(result.total).toBe(4750.95);
            expect(NotificationService.sendPromoCoupon).not.toHaveBeenCalled();
        });

        test('Сумма чуть меньше 10 000 — купон не отправляется', async () => {
            CartRepository.getCartPrices.mockResolvedValue([10526]);

            const result = await calculateCartTotal(7, 0);

            expect(result.total).toBeLessThan(10000);
            expect(NotificationService.sendPromoCoupon).not.toHaveBeenCalled();
        });

        test('Отправка купона при сумме чуть больше 10 000 рублей', async () => {
            CartRepository.getCartPrices.mockResolvedValue([10527]);

            const result = await calculateCartTotal(42, 0);

            expect(result.total).toBeGreaterThan(10000);
            expect(NotificationService.sendPromoCoupon).toHaveBeenCalledTimes(1);
            expect(NotificationService.sendPromoCoupon).toHaveBeenCalledWith(42);
        });
    });
});
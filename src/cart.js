const NotificationService = require('./notificationService');

async function calculateCartTotal({ userId, prices, discount }) {

    if (!Array.isArray(prices) || prices.length === 0) {
        throw new Error('Список товаров пуст');
    }

    if (discount < 0) {
        throw new Error('Процент скидки не может быть отрицательным');
    }

    const total = prices.reduce((sum, price) => {
        if (price < 0) {
            throw new Error('Цена товара не может быть отрицательной');
        }
        return sum + price;
    }, 0);

    // Персональная скидка
    let result = total * (1 - discount / 100);

    // Автоматическая скидка 5%
    if (result > 5000) {
        result *= 0.95;
    }

    if (result > 10000) {
        NotificationService.sendPromoCoupon(userId);
    }

    return {
        status: 'success',
        total: Number(result.toFixed(2))
    };
}

module.exports = calculateCartTotal;
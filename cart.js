function calculateCartTotal(items, prices, personalDiscountPercent) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Список товаров пуст');
    }

    if (!Array.isArray(prices) || prices.length !== items.length) {
        throw new Error('Список цен должен соответствовать списку товаров');
    }

    if (personalDiscountPercent < 0) {
        throw new Error('Процент скидки не может быть отрицательным');
    }

    // Подсчёт общей суммы
    const total = items.reduce((sum, item, index) => {
        const price = prices[index];

        if (price < 0) {
            throw new Error('Цена товара не может быть отрицательной');
        }

        if (item.quantity <= 0) {
            throw new Error('Количество товара должно быть положительным');
        }

        return sum + price * item.quantity;
    }, 0);

    // Персональная скидка
    let result = total * (1 - personalDiscountPercent / 100);

    // Автоматическая скидка 5%
    if (result > 5000) {
        result *= 0.95;
    }

    return {
        status: 'success',
        total: Number(result.toFixed(2))
    };
}

module.exports = calculateCartTotal;

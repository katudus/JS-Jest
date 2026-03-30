const { test, expect } = require('@playwright/test');
const CartPage = require('./pages/CartPage');

test.describe('Корзина интернет-магазина', () => {

    let cartPage;

    test.beforeEach(async ({ page }) => {
        cartPage = new CartPage(page);
        await cartPage.navigate();
    });

    // ─────────────────────────────────────────────────────────────
    // ПОЗИТИВНЫЕ СЦЕНАРИИ
    // ─────────────────────────────────────────────────────────────

    test('Позитивный: сумма < 5000 – купон не выдается', async () => {
        await cartPage.applyUserId(1);
        await cartPage.getDiscountText();

        await cartPage.addProductByPrice(150);
        await cartPage.addProductByPrice(200);
        await cartPage.checkout();

        const coupon = await cartPage.getCouponMsg();
        expect(coupon).toBe('');
    });

    test('Позитивный: сумма > 10000 – купон выдается (coupon_sent = true)', async () => {
        await cartPage.applyUserId(1);
        await cartPage.getDiscountText();

        await cartPage.addProductByPrice(6000);
        await cartPage.addProductByPrice(6000);
        await cartPage.checkout();

        const coupon = await cartPage.waitForCoupon();
        expect(coupon).toContain('Ваш купон №');
    });

    test('Позитивный: скидка пользователя отображается после ввода ID', async () => {
        await cartPage.applyUserId(1);
        const text = await cartPage.getDiscountText();
        expect(text).toContain('10%');
    });

    test('Позитивный: подсказка про купон появляется когда сумма > 10000', async () => {
        await cartPage.applyUserId(1);
        await cartPage.getDiscountText();

        await cartPage.addProductByPrice(6000);
        await cartPage.addProductByPrice(6000);

        const visible = await cartPage.isCouponHintVisible();
        expect(visible).toBe(true);
    });

    // ─────────────────────────────────────────────────────────────
    // DATA-DRIVEN: разные комбинации товаров
    // ─────────────────────────────────────────────────────────────

    const combinations = [
        { prices: [150],             label: 'Блокнот (150 ₽)',               expectCoupon: false },
        { prices: [200, 500],        label: 'Ручка + Книга (700 ₽)',         expectCoupon: false },
        { prices: [3000, 3000],      label: 'два Наушника (6000 ₽)',         expectCoupon: false },
        { prices: [6000, 6000],      label: 'две Клавиатуры (12000 ₽)',      expectCoupon: true  },
        { prices: [500, 3000, 6000], label: 'Книга + Наушники + Клавиатура', expectCoupon: false },
    ];

    for (const combo of combinations) {
        test(`Data-Driven: ${combo.label}`, async () => {
            await cartPage.applyUserId(1);
            await cartPage.getDiscountText();

            for (const price of combo.prices) {
                await cartPage.addProductByPrice(price);
            }
            await cartPage.checkout();

            if (combo.expectCoupon) {
                const coupon = await cartPage.waitForCoupon();
                expect(coupon).toContain('Ваш купон №');
            } else {
                const coupon = await cartPage.getCouponMsg();
                expect(coupon).toBe('');
            }
        });
    }

    // ─────────────────────────────────────────────────────────────
    // НЕГАТИВНЫЕ СЦЕНАРИИ
    // ─────────────────────────────────────────────────────────────

    test('Негативный: пустая корзина – кнопка заблокирована', async () => {
        await cartPage.applyUserId(1);
        await cartPage.getDiscountText();

        const enabled = await cartPage.isCheckoutEnabled();
        expect(enabled).toBe(false);
    });

    test('Негативный: пустой ID – ошибка при нажатии «Применить»', async () => {
        await cartPage.applyUserId('');
        const error = await cartPage.getErrorText();
        expect(error).toContain('Введите ID пользователя');
    });

    test('Негативный: нечисловой ID – ошибка', async () => {
        await cartPage.applyUserId('abc');
        const error = await cartPage.getErrorText();
        expect(error).toContain('должен быть целым числом');
    });

    test('Негативный: отрицательный ID – ошибка', async () => {
        await cartPage.applyUserId(-1);
        const error = await cartPage.getErrorText();
        expect(error).toContain('положительным числом');
    });

    test('Негативный: оформление без ввода ID – ошибка', async () => {
        await cartPage.addProductByPrice(150);
        await cartPage.checkout();

        const error = await cartPage.getErrorText();
        expect(error).toContain('Сначала введите ID пользователя');
    });

    // ─────────────────────────────────────────────────────────────
    // ПОСЛЕДОВАТЕЛЬНЫЙ СЦЕНАРИЙ
    // ─────────────────────────────────────────────────────────────

    test('Последовательный: полный путь пользователя с купоном', async () => {
        // 1. Вводим ID — проверяем скидку
        await cartPage.applyUserId(3);
        const discountText = await cartPage.getDiscountText();
        expect(discountText).toContain('10%');

        // 2. Добавляем товары на сумму > 10000
        await cartPage.addProductByPrice(6000);
        await cartPage.addProductByPrice(6000);

        // 3. До оформления видим подсказку про купон
        const hintVisible = await cartPage.isCouponHintVisible();
        expect(hintVisible).toBe(true);

        // 4. Оформляем заказ
        await cartPage.checkout();

        // 5. Итоговая сумма > 10000
        const total = await cartPage.getResultTotal();
        expect(Number(total.replace(/\s/g, ''))).toBeGreaterThan(10000);

        // 6. Купон выдан
        const coupon = await cartPage.waitForCoupon();
        expect(coupon).toContain('Ваш купон №');
    });
});
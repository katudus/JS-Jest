class CartPage {
    constructor(page) {
        this.page = page;

        // Шаг 1 — идентификация
        this.userIdInput    = '#userId';
        this.applyIdBtn     = '#applyIdBtn';
        this.discountBadge  = '#discountBadge';
        this.discountText   = '#discountText';

        // Шаг 2 — корзина / итог
        this.checkoutBtn    = '#checkoutBtn';
        this.finalTotal     = '#finalTotal';
        this.couponHint     = '#couponHint';

        // Шаг 3 — результат и ошибка
        this.resultArea     = '#resultArea';
        this.totalResult    = '#totalResult';
        this.couponMsg      = '#couponMsg';
        this.errorArea      = '#errorArea';
        this.errorMsg       = '#errorMsg';
    }

    async navigate() {
        await this.page.goto('/');
    }

    async applyUserId(id) {
        await this.page.fill(this.userIdInput, String(id));
        await this.page.click(this.applyIdBtn);
    }

    async addProductByPrice(price) {
        await this.page.click(`.add-btn[data-price="${price}"]`);
    }

    async checkout() {
        await this.page.click(this.checkoutBtn);
    }

    async getDiscountText() {
        await this.page.waitForSelector(this.discountBadge + ':not(.hidden)');
        return this.page.textContent(this.discountText);
    }

    async getResultTotal() {
        await this.page.waitForSelector(this.resultArea + ':not(.hidden)');
        return this.page.textContent(this.totalResult);
    }

    /** Просто читает текст купона (для случаев когда купона нет) */
    async getCouponMsg() {
        await this.page.waitForSelector(this.resultArea + ':not(.hidden)');
        return this.page.textContent(this.couponMsg);
    }

    /** Ждёт пока купон реально появится в тексте */
    async waitForCoupon() {
        await this.page.waitForSelector(this.resultArea + ':not(.hidden)');
        await this.page.waitForFunction(
            () => document.querySelector('#couponMsg').textContent.includes('Ваш купон №')
        );
        return this.page.textContent(this.couponMsg);
    }

    async getErrorText() {
        await this.page.waitForSelector(this.errorArea + ':not(.hidden)');
        return this.page.textContent(this.errorMsg);
    }

    async isResultVisible() {
        return this.page.isVisible(this.resultArea);
    }

    async isErrorVisible() {
        return this.page.isVisible(this.errorArea);
    }

    async isCouponHintVisible() {
        return this.page.isVisible(this.couponHint);
    }

    async isCheckoutEnabled() {
        return this.page.isEnabled(this.checkoutBtn);
    }
}

module.exports = CartPage;
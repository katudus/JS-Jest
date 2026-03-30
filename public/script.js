const cart = [];
let currentDiscount = 0;
let currentUserId = null;

// Шаг 1: Применить ID и получить скидку
document.getElementById('applyIdBtn').addEventListener('click', applyUserId);
document.getElementById('userId').addEventListener('keydown', e => {
    if (e.key === 'Enter') applyUserId();
});

async function applyUserId() {
    const input = document.getElementById('userId').value.trim();
    const badge = document.getElementById('discountBadge');
    const discountText = document.getElementById('discountText');

    badge.classList.add('hidden');

    if (!input) {
        showError('Введите ID пользователя');
        return;
    }

    const userId = Number(input);
    if (isNaN(userId) || !Number.isInteger(userId)) {
        showError('ID пользователя должен быть целым числом');
        return;
    }
    if (userId <= 0) {
        showError('ID пользователя должен быть положительным числом');
        return;
    }

    try {
        const res = await fetch(`/api/users/${userId}/discount`);
        if (!res.ok) {
            showError('Пользователь не найден');
            return;
        }
        const data = await res.json();
        currentDiscount = data.discount;
        currentUserId = userId;

        discountText.innerHTML = `Пользователь #${userId} — персональная скидка: <strong>${currentDiscount}%</strong>`;
        badge.classList.remove('hidden');

        // Обновляем итог с учётом новой скидки
        recalcSummary();
        hideError();
    } catch (e) {
        showError('Ошибка соединения с сервером');
    }
}

// Шаг 2: Добавление товаров
document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const price = Number(btn.dataset.price);
        const name = btn.dataset.name;
        cart.push(price);
        addCartItem(name, price);
        recalcSummary();
    });
});

function addCartItem(name, price) {
    const list = document.getElementById('cartList');
    const emptyMsg = document.getElementById('emptyMsg');
    if (emptyMsg) emptyMsg.remove();

    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `<span>${name}</span><span class="cart-item-price">${price.toLocaleString('ru')} ₽</span>`;
    list.appendChild(li);

    document.getElementById('checkoutBtn').disabled = false;
}

// Пересчёт итога в реальном времени
function recalcSummary() {
    if (cart.length === 0) return;

    const raw = cart.reduce((s, p) => s + p, 0);
    const afterPersonal = raw * (1 - currentDiscount / 100);
    const afterAuto = afterPersonal > 5000 ? afterPersonal * 0.95 : afterPersonal;
    const final = afterAuto;

    const discountRow = document.getElementById('discountRow');
    const autoDiscountRow = document.getElementById('autoDiscountRow');
    const couponHint = document.getElementById('couponHint');

    document.getElementById('rawTotal').textContent = fmt(raw);
    document.getElementById('finalTotal').textContent = fmt(final);

    // Персональная скидка
    if (currentDiscount > 0) {
        const saved = raw - afterPersonal;
        document.getElementById('discountPct').textContent = currentDiscount;
        document.getElementById('discountAmount').textContent = `−${fmt(saved)}`;
        discountRow.classList.remove('hidden');
    } else {
        discountRow.classList.add('hidden');
    }

    // Автоскидка 5%
    if (afterPersonal > 5000) {
        const saved = afterPersonal - afterAuto;
        document.getElementById('autoDiscountAmount').textContent = `−${fmt(saved)}`;
        autoDiscountRow.classList.remove('hidden');
    } else {
        autoDiscountRow.classList.add('hidden');
    }

    // Подсказка про купон
    if (final > 10000) {
        couponHint.classList.remove('hidden');
    } else {
        couponHint.classList.add('hidden');
    }
}

function fmt(n) {
    return Number(n.toFixed(2)).toLocaleString('ru') + ' ₽';
}

// Шаг 3: Оформление заказа
document.getElementById('checkoutBtn').addEventListener('click', async () => {
    hideError();

    if (cart.length === 0) {
        showError('Корзина пуста');
        return;
    }

    if (!currentUserId) {
        showError('Сначала введите ID пользователя (шаг 01)');
        return;
    }

    try {
        const response = await fetch('/api/cart/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUserId,
                prices: cart,
                discount: currentDiscount
            })
        });

        const data = await response.json();

        if (data.status === 'error') {
            showError(data.message);
            return;
        }

        document.getElementById('totalResult').textContent =
            Number(data.total).toLocaleString('ru');

        const couponMsg = document.getElementById('couponMsg');
        if (data.coupon_sent) {
            const num = Math.floor(Math.random() * 9000) + 1000;
            couponMsg.textContent = `🎉 Ваш купон №${num}`;
        } else {
            couponMsg.textContent = '';
        }

        document.getElementById('resultArea').classList.remove('hidden');
        document.getElementById('checkoutBtn').disabled = true;
    } catch (e) {
        showError('Ошибка соединения с сервером');
    }
});

// Утилиты 
function showError(msg) {
    const area = document.getElementById('errorArea');
    document.getElementById('errorMsg').textContent = msg;
    area.classList.remove('hidden');
}

function hideError() {
    document.getElementById('errorArea').classList.add('hidden');
}

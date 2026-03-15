/====================== ONLINE SHOP ======================
$(function () {
    const STORAGE_KEY = 'tarucho_cart';

    // カートのバッジ（数字）を更新する共通関数
    function updateBadge() {
        const cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        // 全商品の数量の合計を計算
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

        const $badge = $('.cart-badge');
        if ($badge.length > 0) {
            if (totalCount > 0) {
                $badge.text(totalCount).show();
            } else {
                $badge.hide();
            }
        }
    }

    // 1. ページ読み込み時にバッジを更新
    updateBadge();

    // ＋ボタンの処理
    $(document).on('click', '.plus-btn', function () {
        const $input = $(this).siblings('.cartInput');
        $input.val(parseInt($input.val()) + 1);
    });

    // －ボタンの処理
    $(document).on('click', '.minus-btn', function () {
        const $input = $(this).siblings('.cartInput');
        const currentVal = parseInt($input.val());
        if (currentVal > 1) {
            $input.val(currentVal - 1);
        }
    });

    // 2. カートボタンをクリックした時の処理（統合版）
    $(document).on('click', '.cartBtn', function () {
        const $btn = $(this);
        const $item = $btn.closest('.shopContent');

        // HTMLのdata属性から商品情報を取得
        const itemData = {
            id: $item.data('id'),
            name: $item.data('name'),
            price: parseInt($item.data('price')),
            image: $item.data('image'),
            quantity: parseInt($item.find('.cartInput').val()) || 1
        };

        // 現在のカートデータをLocalStorageから取得
        let cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

        // すでに同じ商品がカートにあるか確認
        const existingItem = cart.find(item => item.id === itemData.id);

        if (existingItem) {
            existingItem.quantity += itemData.quantity; // 既存分に加算
        } else {
            cart.push(itemData); // 新規追加
        }

        // LocalStorageに保存
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));

        // --- UIの更新演出 ---
        updateBadge();

        // トースト通知を表示
        showToast();

        // カートアイコンを揺らす
        $('.header-cart-icon').addClass('shake');
        setTimeout(() => $('.header-cart-icon').removeClass('shake'), 500);

        // ボタンのテキスト変更
        const originalText = $btn.text();
        $btn.text('追加しました！').css('background-color', '#91A363');
        setTimeout(() => {
            $btn.text(originalText).css('background-color', '');
            $item.find('.cartInput').val(1); // 数量を1に戻す
        }, 1500);
        
        console.log('現在のカート内:', cart);
    });

    function showToast() {
        const toast = $('#toast');
        toast.addClass('show');
        setTimeout(() => toast.removeClass('show'), 2000);
    }
});

// cart.html の表示処理（こちらは既存のままでも動きますが、STORAGE_KEYを統一してください）
$(function () {
    const STORAGE_KEY = 'tarucho_cart';

    function displayCart() {
        const cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        const $list = $('#cart-list');
        const $summary = $('#cart-summary');
        if (!$list.length) return; // カートページ以外では実行しない

        $list.empty();

        if (cart.length === 0) {
            $list.append('<p class="empty-msg">カートは空です。</p>');
            $summary.hide();
            return;
        }

        let total = 0;
        cart.forEach((item, index) => {
            const subtotal = item.price * item.quantity;
            total += subtotal;

            const html = `
                <div class="cart-item">
                    <div>
                        <strong>${item.name}</strong><br>
                        ${item.price.toLocaleString()} yen × ${item.quantity}
                    </div>
                    <div>
                        <span>${subtotal.toLocaleString()} yen</span>
                        <button class="remove-btn" data-index="${index}">削除</button>
                    </div>
                </div>
            `;
            $list.append(html);
        });

        $('#total-amount').text(total.toLocaleString());
        $summary.show();
    }

    $(document).on('click', '.remove-btn', function () {
        const index = $(this).data('index');
        let cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        cart.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        displayCart();
    });

    displayCart();
});


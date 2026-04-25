//===============================================================
// debounce関数
//===============================================================
function debounce(func, wait) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


//===============================================================
// メニュー関連
//===============================================================

// 変数でセレクタを管理
var $menubar = $('#menubar');
var $menubarHdr = $('#menubar_hdr');
var $headerNav = $('header nav');

// menu
$(window).on("load resize", debounce(function () {
    if (window.innerWidth < 9999) {	// ここがブレイクポイント指定箇所です
        // 小さな端末用の処理
        $('body').addClass('small-screen').removeClass('large-screen');
        $menubar.addClass('display-none').removeClass('display-block');
        $menubarHdr.removeClass('display-none ham').addClass('display-block');
    } else {
        // 大きな端末用の処理
        $('body').addClass('large-screen').removeClass('small-screen');
        $menubar.addClass('display-block').removeClass('display-none');
        $menubarHdr.removeClass('display-block').addClass('display-none');

        // ドロップダウンメニューが開いていれば、それを閉じる
        $('.ddmenu_parent > ul').hide();
    }
}, 10));

$(function () {

    // ハンバーガーメニューをクリックした際の処理
    $menubarHdr.click(function () {
        $(this).toggleClass('ham');
        if ($(this).hasClass('ham')) {
            $menubar.addClass('display-block');
        } else {
            $menubar.removeClass('display-block');
        }
    });

    // アンカーリンクの場合にメニューを閉じる処理
    $menubar.find('a[href*="#"]').click(function () {
        $menubar.removeClass('display-block');
        $menubarHdr.removeClass('ham');
    });

    // ドロップダウンの親liタグ（空のリンクを持つaタグのデフォルト動作を防止）
    $menubar.find('a[href=""]').click(function () {
        return false;
    });
    $headerNav.find('a[href=""]').click(function () {
        return false;
    });

    // ドロップダウンメニューの処理
    $menubar.find('li:has(ul)').addClass('ddmenu_parent');
    $('.ddmenu_parent > a').addClass('ddmenu');
    $headerNav.find('li:has(ul)').addClass('ddmenu_parent');
    $('.ddmenu_parent > a').addClass('ddmenu');

    // タッチ開始位置を格納する変数
    var touchStartY = 0;

    // タッチデバイス用
    $('.ddmenu').on('touchstart', function (e) {
        // タッチ開始位置を記録
        touchStartY = e.originalEvent.touches[0].clientY;
    }).on('touchend', function (e) {
        // タッチ終了時の位置を取得
        var touchEndY = e.originalEvent.changedTouches[0].clientY;

        // タッチ開始位置とタッチ終了位置の差分を計算
        var touchDifference = touchStartY - touchEndY;

        // スクロール動作でない（差分が小さい）場合にのみドロップダウンを制御
        if (Math.abs(touchDifference) < 10) { // 10px以下の移動ならタップとみなす
            var $nextUl = $(this).next('ul');
            if ($nextUl.is(':visible')) {
                $nextUl.stop().hide();
            } else {
                $nextUl.stop().show();
            }
            $('.ddmenu').not(this).next('ul').hide();
            return false; // ドロップダウンのリンクがフォローされるのを防ぐ
        }
    });

    //PC用
    $('.ddmenu_parent').hover(function () {
        $(this).children('ul').stop().show();
    }, function () {
        $(this).children('ul').stop().hide();
    });

    // ドロップダウンをページ内リンクで使った場合に、ドロップダウンを閉じる
    $('.ddmenu_parent ul a').click(function () {
        $('.ddmenu_parent > ul').hide();
    });

});


//===============================================================
// 小さなメニューが開いている際のみ、body要素のスクロールを禁止。
//===============================================================
$(document).ready(function () {
    function toggleBodyScroll() {
        // 条件をチェック
        if ($('#menubar_hdr').hasClass('ham') && !$('#menubar_hdr').hasClass('display-none')) {
            // #menubar_hdr が 'ham' クラスを持ち、かつ 'display-none' クラスを持たない場合、スクロールを禁止
            $('body').css({
                overflow: 'hidden',
                height: '100%'
            });
        } else {
            // その他の場合、スクロールを再び可能に
            $('body').css({
                overflow: '',
                height: ''
            });
        }
    }

    // 初期ロード時にチェックを実行
    toggleBodyScroll();

    // クラスが動的に変更されることを想定して、MutationObserverを使用
    const observer = new MutationObserver(toggleBodyScroll);
    observer.observe(document.getElementById('menubar_hdr'), { attributes: true, attributeFilter: ['class'] });
});


//===============================================================
// スムーススクロール（※バージョン2024-1）※通常タイプ
//===============================================================
$(function () {
    // ページ上部へ戻るボタンのセレクター
    var topButton = $('.pagetop');
    // ページトップボタン表示用のクラス名
    var scrollShow = 'pagetop-show';

    // スムーススクロールを実行する関数
    // targetにはスクロール先の要素のセレクターまたは'#'（ページトップ）を指定
    function smoothScroll(target) {
        var headerHeight = 55;
        // スクロール先の位置を計算（ページトップの場合は0、それ以外は要素の位置）
        var scrollTo = target === '#' ? 0 : $(target).offset().top - headerHeight;
        // アニメーションでスムーススクロールを実行
        $('html, body').animate({ scrollTop: scrollTo }, 500);
    }

    // ページ内リンクとページトップへ戻るボタンにクリックイベントを設定
    $('a[href^="#"], .pagetop').click(function (e) {
        e.preventDefault(); // デフォルトのアンカー動作をキャンセル
        var id = $(this).attr('href') || '#'; // クリックされた要素のhref属性を取得、なければ'#'
        smoothScroll(id); // スムーススクロールを実行
    });

    // スクロールに応じてページトップボタンの表示/非表示を切り替え
    $(topButton).hide(); // 初期状態ではボタンを隠す
    $(window).scroll(function () {
        if ($(this).scrollTop() >= 300) { // スクロール位置が300pxを超えたら
            $(topButton).fadeIn().addClass(scrollShow); // ボタンを表示
        } else {
            $(topButton).fadeOut().removeClass(scrollShow); // それ以外では非表示
        }
    });

    // ページロード時にURLのハッシュが存在する場合の処理
    if (window.location.hash) {
        // ページの最上部に即時スクロールする
        $('html, body').scrollTop(0);
        // 少し遅延させてからスムーススクロールを実行
        setTimeout(function () {
            smoothScroll(window.location.hash);
        }, 10);
    }
});


//===============================================================
// 汎用開閉処理
//===============================================================
$(function () {
    $('.openclose').next().hide();
    $('.openclose').click(function () {
        $(this).next().slideToggle();
        $('.openclose').not(this).next().slideUp();
    });
});


//===============================================================
// テキストのフェードイン効果
//===============================================================
$(function () {
    $('.fade-in-text').on('inview', function (event, isInView) {
        // この要素が既にアニメーションされたかどうかを確認
        if (isInView && !$(this).data('animated')) {
            // アニメーションがまだ実行されていない場合
            let innerHTML = '';
            const text = $(this).text();
            $(this).text('');

            for (let i = 0; i < text.length; i++) {
                innerHTML += `<span class="char" style="animation-delay: ${i * 0.1}s;">${text[i]}</span>`;
            }

            $(this).html(innerHTML).css('visibility', 'visible');
            // アニメーションが実行されたことをマーク
            $(this).data('animated', true);
        }
    });
});


//===============================================================
// 背景切り替え
//===============================================================
$(document).ready(function () {
    function checkVisibility() {
        const viewportHeight = $(window).height();
        const scrollTop = $(window).scrollTop();

        $(".section").each(function () {
            const sectionTop = $(this).offset().top;
            const sectionHeight = $(this).outerHeight();

            if (
                sectionTop < scrollTop + viewportHeight * 0.6 &&
                sectionTop + sectionHeight > scrollTop + viewportHeight * 0.4
            ) {
                $(this).addClass("active").removeClass("inactive");

                // セクションのIDを取得
                var sectionId = $(this).attr("id");

                // すべてのメニュー項目からactiveクラスを削除
                $("#header-menu li").removeClass("active");

                // 対応するメニュー項目にactiveクラスを追加
                $('#header-menu li a[href="#' + sectionId + '"]')
                    .parent()
                    .addClass("active");
            } else {
                $(this).addClass("inactive").removeClass("active");
            }
        });
    }

    $(window).on("scroll", checkVisibility);
    checkVisibility();
});


//===============================================================
// 横スライドインタイプのスライドショー
//===============================================================
$(function () {
    $('.slide5').each(function () {
        var $this = $(this);
        var slides = $this.find('.slide');
        var slideCount = slides.length;
        var currentIndex = 0;
        var isAnimating = false;

        // インジケータを表示する要素を取得
        var indicators = $this.find('.slide-indicators');

        // スライドの数に応じたインジケータを生成
        for (var i = 0; i < slideCount; i++) {
            indicators.append('<span class="indicator" data-index="' + i + '"></span>');
        }

        // インジケータの初期状態を設定
        var indicatorElements = indicators.find('.indicator');
        indicatorElements.eq(currentIndex).addClass('active');

        // 初期状態で全てのスライドに .hidden クラスを追加
        slides.addClass('hidden');

        // 最初のスライドに .active と .initial クラスを追加し、.hidden クラスを削除
        slides.eq(currentIndex).addClass('active initial').removeClass('hidden');

        // 遅延後に .initial クラスを削除
        setTimeout(function () {
            slides.eq(currentIndex).removeClass('initial');
        }, 50);

        // インジケータをクリックしたときの動作を設定
        indicatorElements.on('click', function () {
            var clickedIndex = $(this).data('index');

            // アニメーション中は操作を受け付けない
            if (isAnimating) return;

            // 現在のスライドと同じ場合は何もしない
            if (clickedIndex === currentIndex) return;

            // スライドの切り替え
            changeSlide(clickedIndex);
        });

        // 自動スライドのタイマー
        setInterval(function () {
            var nextIndex = (currentIndex + 1) % slideCount;
            changeSlide(nextIndex);
        }, 4000); // 4秒ごとにスライドを切り替える

        function changeSlide(nextIndex) {
            isAnimating = true;

            // 現在のスライドを左に移動
            slides.eq(currentIndex).removeClass('active').addClass('left');

            // 次のスライドを表示
            slides.eq(nextIndex).addClass('active').removeClass('hidden');

            // インジケータの更新
            indicatorElements.eq(currentIndex).removeClass('active');
            indicatorElements.eq(nextIndex).addClass('active');

            // アニメーション終了後の処理
            setTimeout(function () {
                // 左に移動したスライドに .hidden クラスを追加
                slides.eq(currentIndex).removeClass('left').addClass('hidden');

                currentIndex = nextIndex;
                isAnimating = false;
            }, 700); // cssの「.slide5 .slide」の行の時間と合わせる
        }
    });
});


//===============================================================
// サムネイルスライドショー
//===============================================================
$(document).ready(function () {
    $('.slide-thumbnail1 .img').each(function () {
        var $imgParts = $(this);
        var $divs = $imgParts.children('div');
        var divCount = $divs.length;

        // 各 div の幅を計算
        var divWidth = 100 / (divCount * 2);

        // 基準値と速度係数を定義
        var baseAnimationTime = 10; // 「10がアニメーションの速度。小さいと早く、大きいとゆっくりになります。
        var baseSlideWidth = 200;
        var speedFactor = divCount / 2;	// 画面内に表示させる枚数。２枚。

        // アニメーション時間とスライド幅を計算
        var animationTime = (baseAnimationTime * speedFactor) + 's';
        var slideWidth = (baseSlideWidth * speedFactor) + '%';

        // 各 div に幅を設定
        $divs.css({
            'flex': '0 0 ' + divWidth + '%',
            'width': divWidth + '%'
        });

        // .img に animation と width を設定
        $imgParts.css({
            'animation-duration': animationTime,
            'width': slideWidth
        });

        // 子要素を複製して追加
        $divs.clone().appendTo($imgParts);

        // アニメーションの一時停止と再開
        $imgParts.on('mouseenter', function () {
            $(this).css('animation-play-state', 'paused');
        });
        $imgParts.on('mouseleave', function () {
            $(this).css('animation-play-state', 'running');
        });
    });
});

//====================== ONLINE SHOP ======================
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
// $(function () {
//     const STORAGE_KEY = 'tarucho_cart';

//     function displayCart() {
//         const cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
//         const $list = $('#cart-list');
//         const $summary = $('#cart-summary');
//         $list.empty();

//         if (cart.length === 0) {
//             $list.append('<p class="empty-msg">カートは空です。</p>');
//             $summary.hide();
//             return;
//         }

//         let total = 0;
//         cart.forEach((item, index) => {
//             const subtotal = item.price * item.quantity;
//             total += subtotal;

//             const html = `
//                 <div class="cart-item">
//                     <div>
//                         <strong>${item.name}</strong><br>
//                         ${item.price} yen × ${item.quantity}
//                     </div>
//                     <div class="cart-item-name">
//                         <span>￥${subtotal}</span>
//                         <button class="remove-btn" data-index="${index}">削除</button>
//                     </div>
//                 </div>
//             `;
//             $list.append(html);
//         });

//         $('#total-amount').text(total.toLocaleString());
//         $summary.show();
//     }

//     // 削除ボタンの処理
//     $(document).on('click', '.remove-btn', function () {
//         const index = $(this).data('index');
//         let cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
//         cart.splice(index, 1);
//         localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
//         displayCart();
//     });

//     displayCart();
// });


//Stripeを使用した決済////////////////////////////////////////////////////////////////////////////
// $(function () {
//     // 1. Stripeを初期化（Stripeから取得した公開鍵を貼り付け）
//     const stripe = Stripe('pk_test_ご自身の公開鍵を入れてください');

//     // フォームが送信された時の処理
//     $('#payment-form').on('submit', async function (e) {
//         e.preventDefault();

//         // ボタンを無効化して連打を防ぐ
//         const $btn = $(this).find('button');
//         $btn.prop('disabled', true).text('決済ページへ移動中...');

//         // ローカルストレージからカートの中身を取得
//         const cart = JSON.parse(localStorage.getItem('tarucho_cart')) || [];

//         if (cart.length === 0) {
//             alert('カートが空です');
//             $btn.prop('disabled', false).text('注文を確定する');
//             return;
//         }

//         try {
//             // 2. サーバー側のPHP（create-session.php）を呼び出す
//             const response = await fetch('create-session.php', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ items: cart })
//             });

//             const session = await response.json();

//             if (session.error) {
//                 throw new Error(session.error);
//             }

//             // 3. Stripeの決済専用ページへリダイレクト
//             const result = await stripe.redirectToCheckout({
//                 sessionId: session.id
//             });

//             if (result.error) {
//                 alert(result.error.message);
//             }

//         } catch (error) {
//             console.error('Error:', error);
//             alert('エラーが発生しました。時間を置いて再度お試しください。');
//         } finally {
//             $btn.prop('disabled', false).text('注文を確定する');
//         }
//     });
// });

// $(function () {
//     // 【重要】ここにあなたのStripe公開鍵(pk_test_...)を入れてください
//     // const stripe = Stripe('pk_live_51SozopRsGlsC2tGIELjEAuJAJqXklhfxmTDFnPDfDiluJYJdO2SmUGQIaCENlFcSUFmanTM3ZAL9E04GPAiGj6Wf00T4AIR8ME');
//     const stripe = Stripe('pk_test_51Sozp02No4lhavLWeGlqNgEyX03BpqsWH6KSfxLcqVPOEaESrEOxj82J5NJlEvttNGdia8BJeXhFhO6OMmP73PEr00SEzsnNPK');

//     // --- 1. カートの中身を表示する処理 ---
//     const cart = JSON.parse(localStorage.getItem('tarucho_cart')) || [];
//     let total = 0;
//     const $container = $('#checkout-items');

//     if (cart.length === 0) {
//         $container.html('<p>カートが空です</p>');
//     } else {
//         cart.forEach(item => {
//             total += item.price * item.quantity;
//             $container.append(`<p>${item.name} × ${item.quantity} (${(item.price * item.quantity).toLocaleString()} yen)</p>`);
//         });
//         $('#final-amount').text(total.toLocaleString());
//     }

//     // --- 2. 注文確定ボタンを押した時の処理 ---
//     $('#payment-form').on('submit', async function (e) {
//         e.preventDefault();
//         const $btn = $(this).find('button');
//         $btn.prop('disabled', true).text('決済ページへ移動中...');

//         // FormDataを使用する形式に変更
//         const formData = new FormData();
//         formData.append('cart_data', JSON.stringify(cart));

//         try {
//             const response = await fetch('create-session.php', {
//                 method: 'POST',
//                 // FormDataを使う場合、Content-Typeヘッダーを自分で設定してはいけません（ブラウザが自動設定します）
//                 body: formData
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.error || 'サーバーエラー');
//             }

//             const session = await response.json();

//             // Stripeの決済画面へリダイレクト
//             const result = await stripe.redirectToCheckout({
//                 sessionId: session.id
//             });

//             if (result.error) {
//                 throw new Error(result.error.message);
//             }

//         } catch (error) {
//             console.error('Error:', error);
//             alert('エラー: ' + error.message);
//         } finally {
//             $btn.prop('disabled', false).text('注文を確定して決済へ進む');
//         }
//     });
// });


document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('full-calendar-container');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ja', // 日本語にするよ！
        googleCalendarApiKey: API_CONFIG.calendarKey,
        events: '1c8900b430b36b7bcc4431607043e8327c66503d5bf0427db585eeba4d6aec7f@group.calendar.google.com', // ノブヲさんのカレンダーID！
        height: 'auto',
        headerToolbar: {
            left: 'title',
            center: 'logoSpacer',
            right: 'today prev,next'
        },

        customButtons: {
            logoSpacer: {
                text: '',
                click: function() {
                    //action none//
                }
            }
        },

eventContent: function(arg) {
          let event = arg.event;
          let title = event.title; // 予定のタイトル（出店場所など）
          
          // もし時間設定がない「終日予定」なら、タイトルだけ表示する
          if (event.allDay || !event.start) {
            return { html: '<div style="white-space: normal; padding: 2px; text-align: left;">' + title + '</div>' };
          }

          // 時間を取り出して「11:00」のような綺麗な形にする仕組み
          function formatTime(date) {
            if (!date) return '';
            let h = String(date.getHours()).padStart(2, '0');
            let m = String(date.getMinutes()).padStart(2, '0');
            return h + ':' + m;
          }

          let startTime = formatTime(event.start);
          let endTime = formatTime(event.end);
          
          // 「11:00 ~ 17:00」という文字列を作る
          let timeString = startTime;
          if (endTime) {
            timeString += ' ~ ' + endTime;
          }

          // 時間とタイトルを <br> で改行して合体！
          let htmlStr = '<div style="white-space: normal; word-break: break-word; padding: 2px; line-height: 1.4; text-align: left;">' + 
                        '<span style="font-size: 0.85em; color: #222;">' + timeString + '</span><br>' + 
                        '<span style="font-weight: bold; color: #333; font-size: 0.7em;">' + title + '</span>' + 
                        '</div>';

          return { html: htmlStr };
        },

        fixedWeekCount: false,
        showNonCurrentDates: false,
        dayCellContent: function (arg) {
            return arg.dayNumberText.replace('日', ''); // 「日」っていう文字を消す設定！
        }
    });
calendar.render();
});

//===============================================================
// お問い合わせ用ポップアップ（モーダルウィンドウ）の開閉
//===============================================================
$(function () {
    // 「こちらから」をクリックした時
    $('.open-contact-modal').on('click', function(e) {
        e.preventDefault(); // 画面の一番上に飛んでしまうのを防ぐ
        $('#contact-modal').fadeIn(300); // 0.3秒かけてフワッと表示
        $('body').css('overflow', 'hidden'); // 後ろの画面がスクロールしないように固定
    });

    // 「×」ボタン、または暗い背景部分をクリックした時
    $('.modal-close, #contact-modal').on('click', function(e) {
        // フォーム本体をクリックした時は閉じないようにする条件分岐
        if (e.target === this) {
            $('#contact-modal').fadeOut(300); // フワッと消える
            $('body').css('overflow', ''); // スクロール固定を解除
        }
    });
});

// ==========================================
// カレンダーモーダルの開閉処理
// ==========================================
// ==========================================
// カレンダーモーダルの開閉とFullCalendar描画
// ==========================================
$(function() {
    let modalCalendar = null; // カレンダーを1度だけ生成するための変数

    // 「Calendar」ボタンをクリックした時
    $('.open-calendar-modal').on('click', function(e) {
        e.preventDefault(); 
        
        // モーダルをフワッと表示し、完全に開ききってからカレンダーを描画する
        $('#calendar-modal').fadeIn(300, function() {
            if (!modalCalendar) {
                var calendarEl = document.getElementById('modal-calendar-container');
                if (calendarEl) {
                    modalCalendar = new FullCalendar.Calendar(calendarEl, {
                        initialView: 'dayGridMonth',
                        locale: 'ja',
                        googleCalendarApiKey: API_CONFIG.calendarKey, 
                        events: '1c8900b430b36b7bcc4431607043e8327c66503d5bf0427db585eeba4d6aec7f@group.calendar.google.com',
                        height: 'auto',
                        headerToolbar: {
                            left: 'title',
                            center: '',
                            right: 'today prev,next'
                        },
                        fixedWeekCount: false,
                        showNonCurrentDates: false,
                        dayCellContent: function (arg) {
                            return arg.dayNumberText.replace('日', ''); 
                        },
                        // トップページと同じ綺麗な表示形式を適用
                        eventContent: function(arg) {
                            let event = arg.event;
                            let title = event.title;
                            
                            if (event.allDay || !event.start) {
                                return { html: '<div style="white-space: normal; padding: 2px; text-align: left;">' + title + '</div>' };
                            }

                            function formatTime(date) {
                                if (!date) return '';
                                let h = String(date.getHours()).padStart(2, '0');
                                let m = String(date.getMinutes()).padStart(2, '0');
                                return h + ':' + m;
                            }

                            let startTime = formatTime(event.start);
                            let endTime = formatTime(event.end);
                            let timeString = startTime;
                            if (endTime) timeString += ' ~ ' + endTime;

                            let htmlStr = '<div style="white-space: normal; word-break: break-word; padding: 2px; line-height: 1.4; text-align: left;">' + 
                                          '<span style="font-size: 0.85em; color: #222;">' + timeString + '</span><br>' + 
                                          '<span style="font-weight: bold; color: #333; font-size: 0.7em;">' + title + '</span>' + 
                                          '</div>';

                            return { html: htmlStr };
                        }
                    });
                    modalCalendar.render();
                }
            }
        });
    });

    // 「×」ボタン、または黒い背景部分をクリックして閉じる処理
    $('.calendar-modal-close, #calendar-modal').on('click', function(e) {
        if (!$(e.target).closest('.modal-content').length || $(e.target).hasClass('calendar-modal-close')) {
            $('#calendar-modal').fadeOut(300);
        }
    });
});

// ==========================================
// カートモーダルの表示と操作
// ==========================================
$(function() {
    const STORAGE_KEY = 'tarucho_cart';

    // カートのバッジ（数字）を更新する関数（どこからでも呼べるように）
    window.updateBadgeGlobal = function() {
        const cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        const $badge = $('.cart-badge');
        if ($badge.length > 0) {
            if (totalCount > 0) {
                $badge.text(totalCount).show();
            } else {
                $badge.hide();
            }
        }
    };

    // カートの中身をモーダル内に描画する関数
    function renderModalCart() {
        const cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        const $list = $('#modal-cart-list');
        const $summary = $('#modal-cart-summary');
        $list.empty();

        if (cart.length === 0) {
            $list.append('<p class="empty-msg" style="text-align:center; padding:30px;">カートは空です。</p>');
            $summary.hide();
            return;
        }

        let total = 0;
        cart.forEach((item, index) => {
            const subtotal = item.price * item.quantity;
            total += subtotal;

            const html = `
                <div class="modal-cart-item">
                    <div>
                        <strong>${item.name}</strong><br>
                        ${item.price.toLocaleString()} yen × ${item.quantity}
                    </div>
                    <div class="modal-cart-item-right">
                        <span>￥${subtotal.toLocaleString()}</span>
                        <button class="remove-btn" data-index="${index}">削除</button>
                    </div>
                </div>
            `;
            $list.append(html);
        });

        $('#modal-total-amount').text(total.toLocaleString());
        $summary.show();
    }

    // ①「Cart」アイコンをクリックした時
    $(document).on('click', '.open-cart-modal', function(e) {
        e.preventDefault();
        renderModalCart(); // 開くたびに最新の情報を描画する
        $('#cart-modal').fadeIn(300);
        $('body').css('overflow', 'hidden'); // 背景スクロール防止
    });

    // ②「×」ボタン、背景、または「お買い物を続ける」をクリックした時
    $(document).on('click', '.cart-modal-close, #cart-modal, .cart-modal-close-btn', function(e) {
        if (!$(e.target).closest('.modal-content').length || $(e.target).hasClass('cart-modal-close') || $(e.target).hasClass('cart-modal-close-btn')) {
            e.preventDefault();
            $('#cart-modal').fadeOut(300);
            $('body').css('overflow', '');
        }
    });

    // ③モーダル内の削除ボタンを押した時
    $(document).on('click', '#modal-cart-list .remove-btn', function () {
        const index = $(this).data('index');
        let cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        cart.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        
        renderModalCart(); // モーダルの中身を再描画
        window.updateBadgeGlobal(); // バッジの数字を更新
    });
});

// ==========================================
// Stripe決済処理（モーダル内から実行）
// ==========================================
$(function () {
    // 【重要】ここにStripe公開鍵を入れてください
    const stripe = Stripe('pk_test_51Sozp02No4lhavLWeGlqNgEyX03BpqsWH6KSfxLcqVPOEaESrEOxj82J5NJlEvttNGdia8BJeXhFhO6OMmP73PEr00SEzsnNPK');

    $('#modal-payment-form').on('submit', async function (e) {
        e.preventDefault();
        const $btn = $(this).find('button');
        $btn.prop('disabled', true).text('決済ページへ移動中...');

        const cart = JSON.parse(localStorage.getItem('tarucho_cart')) || [];
        const formData = new FormData();
        formData.append('cart_data', JSON.stringify(cart));

        try {
            const response = await fetch('create-session.php', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'サーバーエラー');
            }

            const session = await response.json();

            // Stripeの決済画面へリダイレクト
            const result = await stripe.redirectToCheckout({
                sessionId: session.id
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

        } catch (error) {
            console.error('Error:', error);
            alert('エラー: ' + error.message);
        } finally {
            $btn.prop('disabled', false).text('注文を確定して決済へ進む');
        }
    });
});
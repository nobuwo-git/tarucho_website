<?php
require_once('stripe-php/init.php');

// 1. config.phpを読み込む（1つ上の階層を指定）
$config_path = dirname(__DIR__) . '/config.php';
if (file_exists($config_path)) {
    require_once($config_path);
}

// 2. Stripe秘密鍵をセット
\Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);
// 署名シークレットをconfigから受け取る
$endpoint_secret = STRIPE_WEBHOOK_SECRET;


$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'];
$event = null;

try {
    $event = \Stripe\Webhook::constructEvent($payload, $sig_header, $endpoint_secret);
} catch(\UnexpectedValueException $e) {
    http_response_code(400); exit();
} catch(\Stripe\Exception\SignatureVerificationException $e) {
    http_response_code(400); exit();
}

// 3. 決済完了イベントが届いた場合
if ($event->type === 'checkout.session.completed') {
    $session = $event->data->object;

    // お名前と電話番号
    $customer_name = $session->customer_details->name ?? 'お名前なし';
    $customer_phone = $session->customer_details->phone ?? '未入力';
    
    // --- 修正：配送先・請求先のどちらに入力されても住所を拾う ---
    if (!empty($session->shipping_details->address)) {
        // 配送先住所が入力されている場合
        $address = $session->shipping_details->address;
        $address_title = "【配送先住所】";
    } elseif (!empty($session->customer_details->address)) {
        // 配送先がなくて、クレジットカードの請求先住所が入力されている場合
        $address = $session->customer_details->address;
        $address_title = "【請求先住所】";
    } else {
        $address = null;
        $address_title = "【住所情報】";
    }

    // 住所データの組み立て（エラー防止のために ?? '' を追加）
    if ($address) {
        $full_address = "〒" . ($address->postal_code ?? '') . "\n"
                      . ($address->state ?? '') . ($address->city ?? '') . ($address->line1 ?? '') . ($address->line2 ?? '');
    } else {
        $full_address = "（住所データがStripeから送られませんでした）";
    }

    // ---- 商品名と数量の取得 ----//
$items_text = $session->metadata->items_text ?? "（商品データなし）\n";

    $total_amount = number_format($session->amount_total);
    
    $to = "n.white.n9@gmail.com";
    
    $to = "n.white.n9@gmail.com";
    $from = "trc-shop@tarucho.com";
    $subject = "【TARUCHO】新しい注文が入りました";

    // --- 修正：タイトルも自動で切り替わるように変更 ---
    $message = "オンラインショップで注文がありました。\n\n"
             . "【注文内容】\n"
             . "{$items_text}\n"
             . "合計金額：{$total_amount}円\n\n"
             . "【注文者情報】\n"
             . "お名前：{$customer_name} 様\n"
             . "電話番号：{$customer_phone}\n\n"
             . "{$address_title}\n"
             . "{$full_address}\n\n"
             . "詳細はStripeダッシュボードを確認してください。";

    $headers = "From: " . $from;

    // 4. 日本語設定とメール送信
    mb_language("Japanese");
    mb_internal_encoding("UTF-8");
    
    mb_send_mail($to, $subject, $message, $headers, "-f " . $from);

    // --- 前略（通知メールの送信処理の後など） ---


// 5. お客様（購入者）への領収書メール送信
$customer_to = $session->customer_details->email; // お客様のメアド
$customer_subject = "【TARUCHO】ご注文ありがとうございます";
$customer_message = "{$customer_name} 様\n\n"
                  . "この度はネパール料理タルチョをご利用いただき、誠にありがとうございます。\n"
                  . "以下の内容でご注文を承りました。\n\n"
                  . "【注文内容】\n"
                  . "{$items_text}\n"
                  . "合計金額：{$total_amount}円\n\n"
                  . "【注文者情報】\n"
                  . "お名前：{$customer_name} 様\n"
                  . "電話番号：{$customer_phone}\n\n"
                  . "{$address_title}\n"
                  . "{$full_address}\n\n"
                  . "商品は準備が整い次第発送いたします。\n"
                  . "商品の到着まで今しばらくお待ちくださいませ。\n\n"
                  . "--------------------------------\n"
                  . "ネパール料理 タルチョ\n"
                  . "URL: https://tarucho.com/\n"
                  . "--------------------------------";

// 送信元（先ほど成功した自分のドメインのアドレス）
$headers_customer = "From: " . $from;

// お客様へ送信
mb_send_mail($customer_to, $customer_subject, $customer_message, $headers_customer, "-f " . $from);



}

http_response_code(200);
?>
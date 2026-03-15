<?php
require_once('stripe-php/init.php');

// 1. Stripeの秘密鍵
\Stripe\Stripe::setApiKey('sk_test_51Sozp02No4lhavLWr2ecOxBM3BSGpYEuKOQ8YJuXADJSTQfGOuiyknTEQ7A7ekytvhdqytQm91OBNzMWYqBC36W000tZuWCJUT');

// 2. Webhook署名シークレット（あとでStripe管理画面から取得します）
$endpoint_secret = 'whsec_6OaVTkIHlDIp8HymDkLqVlu47wdlVJ4w'; 

$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'];
$event = null;

try {
    // 署名の検証（なりすまし防止）
    $event = \Stripe\Webhook::constructEvent(
        $payload, $sig_header, $endpoint_secret
    );
} catch(\UnexpectedValueException $e) {
    http_response_code(400);
    exit();
} catch(\Stripe\Exception\SignatureVerificationException $e) {
    http_response_code(400);
    exit();
}

// 3. 決済完了イベント（checkout.session.completed）をキャッチ
if ($event->type == 'checkout.session.completed') {
    $session = $event->data->object;

    // 購入者情報の取得
    $customer_email = $session->customer_details->email;
    $customer_name  = $session->customer_details->name;
    $amount_total   = number_format($session->amount_total);

    // --- メールの設定 ---
    mb_language("Japanese");
    mb_internal_encoding("UTF-8");

    $shop_email = "your-email@example.com"; // あなたの（お店の）メールアドレス
    $subject_customer = "【タルチョ】ご注文ありがとうございました";
    $subject_admin    = "【新規受注】商品が購入されました";

    $body_common = "注文者名: {$customer_name} 様\n";
    $body_common .= "支払金額: {$amount_total} 円\n\n";
    $body_common .= "詳細はStripe管理画面をご確認ください。";

    // A. 購入者へ送信
    mb_send_mail($customer_email, $subject_customer, "{$customer_name} 様\n\nこの度はご購入ありがとうございます。\n\n" . $body_common, "From: " . $shop_email);

    // B. お店（自分）へ送信
    mb_send_mail($shop_email, $subject_admin, "管理画面を確認してください。\n\n" . $body_common, "From: " . $shop_email);
}

http_response_code(200);
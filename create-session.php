<?php
// 1. エラー表示設定（デバッグ用：本番稼働時は 0 にするのが理想ですが、今は 1 で確認しましょう）
ini_set('display_errors', 1);
error_reporting(E_ALL);

// 2. Stripeライブラリの読み込み
// フォルダ名が「stripe-php」であることを確認してください
require_once('stripe-php/init.php');

// 3. Stripeの秘密鍵を設定（上の階層のconfig.phpを読み込む安全な方法）
$config_path = dirname(__DIR__) . '/config.php';

// config.phpが存在するかチェックして読み込む
if (file_exists($config_path)) {
    require_once($config_path);
} else {
    // 見つからない場合はエラーを出して止める
    die(json_encode(['error' => 'サーバーの設定エラー（鍵ファイルが見つかりません）']));
}

// 読み込んだ鍵をStripeにセット！
\Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);

// 4. 【重要】ロリポップ等の共有サーバーで発生する証明書エラー(errno 77)を回避する設定
\Stripe\ApiRequestor::setHttpClient(new \Stripe\HttpClient\CurlClient([CURLOPT_SSL_VERIFYPEER => false]));

header('Content-Type: application/json');

try {
    // 5. JavaScriptから「cart_data」として送られてきたデータを受け取る
    if (!isset($_POST['cart_data'])) {
        throw new Exception('カートデータが届いていません。');
    }

    $raw_input = $_POST['cart_data'];
    $cart = json_decode($raw_input, true);
    
    // JSONの形式が正しいかチェック
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON解析失敗: ' . json_last_error_msg());
    }

    // ==========================================
    // 🛡️ セキュリティ対策：サーバー側の絶対的な価格表
    // 画面から送られてきた値段は信用せず、必ずここを見ます
    // ==========================================
    $product_catalog = [
        'Dalbhat kit' => 1500, // ダルバートキットの正しい値段
        'Chai kit'    => 500,  // チャイキットの正しい値段
    ];

    // 6. 商品リスト（Line Items）の作成
    $line_items = [];
    $items_text = "";

    foreach ($cart as $item) {
        $item_name = $item['name'] ?? '';

        // 送られてきた商品名が、上の価格表（カタログ）に存在するかチェック
        if (!array_key_exists($item_name, $product_catalog)) {
            // 存在しない不正な商品名の場合はエラーにしてブロックする
            throw new Exception("不正な商品データが検出されました。（商品名: {$item_name}）");
        }

        // 💥 【最重要】画面から送られてきた値段（$item['price']）は捨てて、
        // サーバー側（$product_catalog）の正しい値段を適用する！
        $real_price = $product_catalog[$item_name];

        $line_items[] = [
            'price_data' => [
                'currency' => 'jpy', // 日本円
                'product_data' => [
                    'name' => $item_name,
                ],
                'unit_amount' => $real_price, // ← ここで絶対に正しい値段になる
            ],
            'quantity' => (int)$item['quantity'], // 数量を数値に変換
        ];

        // メモ帳（メール用）の計算も、正しい値段（$real_price）で行う
        $subtotal = number_format($real_price * (int)$item['quantity']);
        // 修正：最後の閉じカッコ「 ) 」を追加しました
        $items_text .= "・" . $item_name . "×" . $item['quantity'] . "(" .$subtotal ."円)\n";
    }

    // 7. Stripe Checkout セッションの作成
    $checkout_session = \Stripe\Checkout\Session::create([
        'payment_method_types' => [
        'card',         // クレジットカード
        ],
        'line_items' => $line_items,
        'mode' => 'payment',
        'customer_creation' => 'always',

        // 配送先住所の入力欄（日本国内のみに制限）
        'shipping_address_collection' => [
            'allowed_countries' => ['JP'],
        ],
        // 電話番号の入力欄を必須にする
        'phone_number_collection' => [
            'enabled' => true,
        ],

        // 修正：正しい計算結果になったメモ帳をStripeに渡す
        'metadata' => [
            'items_text' => $items_text
        ],

        // 決済成功時：ドメイン名を含めたフルパスでthanks.htmlを指定
        'success_url' => 'https://' . $_SERVER['HTTP_HOST'] . '/thanks.html',
        // 決済キャンセル時：cart.htmlへ戻る
        'cancel_url' => 'https://' . $_SERVER['HTTP_HOST'] . '/shop.html',
    ]);

    // 8. 成功したらセッションIDをJSONで返す
    echo json_encode(['id' => $checkout_session->id]);

} catch (Exception $e) {
    // 9. エラーが発生した場合は詳細を返す
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
<?php
// 1. メールの設定
$to = "n.white.n9@gmail.com"; // ★あなたの普段使っているメアド
$subject = "サーバーからのテストメール";
$message = "このメールが届いたら、mb_send_mailは生きています。";
$from = "trc-shop@tarucho.com";

$headers = "From: " . $from;


// 2. 言語設定
mb_language("Japanese");
mb_internal_encoding("UTF-8");

// 3. 送信実行
if (mb_send_mail($to, $subject, $message, $headers, "-f " . $from)) {
    echo "送信成功と判定されました。受信ボックス（または迷惑メールフォルダ）を確認してください。";
} else {
    echo "送信失敗：サーバーの設定でメール送信が制限されている可能性があります。";
}
?>
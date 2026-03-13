<?php
session_start();

// 1. セッション変数をクリア
$_SESSION = array();

// 2. クッキー（セッションID）を削除
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// 3. セッションを破棄
session_destroy();

// 4. ログイン画面などへ飛ばす
header("Location: ../index.html");
exit;
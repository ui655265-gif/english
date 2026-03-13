<?php 
require __DIR__ . '/../vendor/autoload.php';
  $dsn = "mysql:host=localhost;dbname=my_english_vocab;charset=utf8mb4";
  $dotenv = Dotenv\Dotenv::createImmutable(__DIR__. '/../');
  $dotenv->load();
  $user = $_ENV['DB_USER'];
  $password = $_ENV['DB_PASS'];

try {
  $pdo = new PDO($dsn, $user, $password);
  $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
  exit('接続エラー: ' . $e->getMessage());
}
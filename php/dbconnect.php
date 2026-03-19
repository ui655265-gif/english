<?php 
require __DIR__ . '/../vendor/autoload.php';
  $dotenv = Dotenv\Dotenv::createImmutable(__DIR__. '/../');
  $dotenv->load();
  $host = $_ENV['DB_HOST'];
  $name = $_ENV['DB_NAME'];
  $user = $_ENV['DB_USER'];
  $password = $_ENV['DB_PASS'];
  $dsn = "mysql:host=$host;dbname=$name;charset=utf8mb4";

try {
  $pdo = new PDO($dsn, $user, $password);
  $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
  exit('接続エラー: ' . $e->getMessage());
}
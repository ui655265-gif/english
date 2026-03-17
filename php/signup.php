<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once('dbconnect.php');
$response = [];

$username = $_POST['username'];
$password = $_POST['password'];

if (mb_strlen($username)<4 || !preg_match('/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/', $password)) {
  $response['status'] = 'error';
  $response['message'] = '条件を満たしていません';
  echo json_encode($response);
  exit();
}
$hashpass = password_hash($password, PASSWORD_DEFAULT);
try {
  $stmt = $pdo->prepare('insert into users (username, password) values(:username, :password)');
  $stmt->bindParam(':username', $username, PDO::PARAM_STR);
  $stmt->bindParam(':password', $hashpass, PDO::PARAM_STR);
  $stmt->execute();
  $_SESSION['id'] = $pdo->lastInsertId();
  $response['status'] = 'success';
} catch (PDOException $e){
  if ($e->getCode() == 23000) {
        $response['status'] = 'error';
        $response['message'] = 'そのユーザー名は既に使用されています';
    } else {
        $response['status'] = 'error';
        $response['message'] = '登録に失敗しました';
    }
}
header('Content-Type: application/json; charset=UTF-8');
echo json_encode($response);
exit();

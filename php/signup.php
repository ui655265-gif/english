<?php
require_once 'session.php';
header('Content-Type: application/json; charset=UTF-8');
require_once 'dbconnect.php';
$response = [];

$username = strtolower(trim($_POST['username']));
$password = $_POST['password'];

if (!preg_match('/^[a-z0-9_]{3,15}$/', $username) || !preg_match('/^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_]).{8,}$/', $password)) {
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

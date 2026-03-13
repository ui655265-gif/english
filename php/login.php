<?php
session_start();
require_once('dbconnect.php');
$response=[];

try {
  $stmt = $pdo->prepare('SELECT * FROM users WHERE username=:name');

  $stmt->bindParam(':name', $_POST['name'], PDO::PARAM_STR);
  $stmt->execute();
  $row = $stmt->fetch();

  if ($row && password_verify($_POST["password"], $row["password"])) {
    $_SESSION["id"] = $row["id"];
    $_SESSION["name"] = $row["username"];
    $response['status'] = 'success';
  } else {
    $response['status'] = 'error';
  }
} catch (PDOException $e){
  $response['status'] = 'error';
}
header('Content-Type: application/json; charset=utf-8');

echo json_encode($response);
exit();
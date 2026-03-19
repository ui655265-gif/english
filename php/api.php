<?php
require_once 'session.php';
require_once 'dbconnect.php';

$response = [];

$stmt = $pdo->prepare('select id, words, meanings, type, status, date, last_study from english_words where user_id = :user_id');
$stmt->bindParam(':user_id', $_SESSION["id"], PDO::PARAM_INT);
$stmt->execute();
$response = $stmt->fetchAll();
foreach ($response as $key => $row) {
    $response[$key]['date'] = date('Y-m-d', strtotime($row['date']));
}
header('Content-Type: application/json; charset=utf-8');

echo json_encode($response);
exit();
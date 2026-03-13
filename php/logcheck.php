<?php
session_start();
$response = [];
if (isset($_SESSION['id'])) {
  $response["logstatus"] = true;
} else {
  $response["logstatus"] = false;
}
header('Content-Type: application/json; charset=utf-8');

echo json_encode($response);
exit();
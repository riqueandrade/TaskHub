<?php
require_once 'db_connection.php';

$sql = "SELECT id_usuario, nome, email, data_cadastro FROM usuarios ORDER BY nome";
$result = mysqli_query($conn, $sql);

$users = array();
while ($row = mysqli_fetch_assoc($result)) {
    $users[] = $row;
}

echo json_encode($users);

mysqli_close($conn);

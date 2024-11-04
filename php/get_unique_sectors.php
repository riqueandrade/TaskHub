<?php
require_once 'db_connection.php';

$sql = "SELECT DISTINCT setor FROM tarefas WHERE setor IS NOT NULL AND setor != '' ORDER BY setor";
$result = mysqli_query($conn, $sql);

$sectors = array();
while ($row = mysqli_fetch_assoc($result)) {
    $sectors[] = $row['setor'];
}

echo json_encode($sectors);
mysqli_close($conn); 
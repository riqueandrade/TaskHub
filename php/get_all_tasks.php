<?php
require_once 'db_connection.php';

// Define o charset para UTF-8
header('Content-Type: application/json; charset=utf-8');

// Garante que a conexão está usando UTF-8
mysqli_set_charset($conn, "utf8mb4");

// Busca todas as tarefas com informações do usuário responsável
$sql = "SELECT t.*, u.nome as nome_usuario 
        FROM tarefas t 
        LEFT JOIN usuarios u ON t.id_usuario = u.id_usuario 
        ORDER BY t.data_vencimento ASC";

$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode(['error' => mysqli_error($conn)]);
    exit;
}

$tasks = array();

while ($row = mysqli_fetch_assoc($result)) {
    // Remove a conversão UTF-8 pois já está configurada na conexão
    $tasks[] = $row;
}

echo json_encode($tasks, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

mysqli_close($conn);
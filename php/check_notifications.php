<?php
require_once 'db_connection.php';

// Busca tarefas que vencem em 2 dias ou menos
$sql = "SELECT t.*, u.nome as nome_usuario 
        FROM tarefas t
        LEFT JOIN usuarios u ON t.id_usuario = u.id_usuario
        WHERE t.data_vencimento <= DATE_ADD(CURDATE(), INTERVAL 2 DAY)
        AND t.data_vencimento >= CURDATE()
        AND t.status != 'Pronto'";

$result = mysqli_query($conn, $sql);
$notifications = array();

while ($row = mysqli_fetch_assoc($result)) {
    $notifications[] = array(
        'tarefa' => $row['tarefa'],
        'responsavel' => $row['nome_usuario'],
        'data_vencimento' => $row['data_vencimento']
    );
}

echo json_encode($notifications);
mysqli_close($conn);
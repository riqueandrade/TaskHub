<?php
require_once 'db_connection.php';

if (isset($_GET['id'])) {
    $userId = mysqli_real_escape_string($conn, $_GET['id']);
    $response = array();

    // Busca dados do usuário
    $userQuery = "SELECT * FROM usuarios WHERE id_usuario = $userId";
    $userResult = mysqli_query($conn, $userQuery);
    $response['user'] = mysqli_fetch_assoc($userResult);

    // Busca tarefas do usuário
    $tasksQuery = "SELECT * FROM tarefas WHERE id_usuario = $userId ORDER BY data_vencimento ASC";
    $tasksResult = mysqli_query($conn, $tasksQuery);

    $response['tasks'] = array();
    while ($task = mysqli_fetch_assoc($tasksResult)) {
        $response['tasks'][] = $task;
    }

    echo json_encode($response);
} else {
    echo json_encode(['error' => 'ID do usuário não fornecido']);
}

mysqli_close($conn);
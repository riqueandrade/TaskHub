<?php
require_once 'db_connection.php';

// Array para armazenar as estatísticas
$stats = array();

// Total de usuários
$sql_total = "SELECT COUNT(*) as total FROM usuarios";
$result = mysqli_query($conn, $sql_total);
$row = mysqli_fetch_assoc($result);
$stats['total_users'] = $row['total'];

// Usuários ativos (com tarefas atribuídas)
$sql_active = "SELECT COUNT(DISTINCT id_usuario) as active 
               FROM tarefas 
               WHERE id_usuario IS NOT NULL";
$result = mysqli_query($conn, $sql_active);
$row = mysqli_fetch_assoc($result);
$stats['active_users'] = $row['active'];

// Total de tarefas atribuídas
$sql_tasks = "SELECT COUNT(*) as total 
              FROM tarefas 
              WHERE id_usuario IS NOT NULL";
$result = mysqli_query($conn, $sql_tasks);
$row = mysqli_fetch_assoc($result);
$stats['assigned_tasks'] = $row['total'];

// Retorna as estatísticas em formato JSON
echo json_encode($stats);

// Fecha a conexão com o banco de dados
mysqli_close($conn);
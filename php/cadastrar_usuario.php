<?php
require_once 'db_connection.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $action = $_POST['action'] ?? 'add';

    switch ($action) {
        case 'add':
            $nome = mysqli_real_escape_string($conn, $_POST['nome']);
            $email = mysqli_real_escape_string($conn, $_POST['email']);

            // Verifica se o email já existe
            $check_email = "SELECT * FROM usuarios WHERE email = '$email'";
            $result = mysqli_query($conn, $check_email);

            if (mysqli_num_rows($result) > 0) {
                echo json_encode(['success' => false, 'error' => 'Este e-mail já está cadastrado']);
            } else {
                $sql = "INSERT INTO usuarios (nome, email) VALUES ('$nome', '$email')";
                if (mysqli_query($conn, $sql)) {
                    echo json_encode(['success' => true, 'message' => 'Usuário cadastrado com sucesso!']);
                } else {
                    echo json_encode(['success' => false, 'error' => mysqli_error($conn)]);
                }
            }
            break;

        case 'update':
            $id = mysqli_real_escape_string($conn, $_POST['id']);
            $nome = mysqli_real_escape_string($conn, $_POST['nome']);
            $email = mysqli_real_escape_string($conn, $_POST['email']);

            // Verifica se o email já existe para outro usuário
            $check_email = "SELECT * FROM usuarios WHERE email = '$email' AND id_usuario != $id";
            $result = mysqli_query($conn, $check_email);

            if (mysqli_num_rows($result) > 0) {
                echo json_encode(['success' => false, 'error' => 'Este e-mail já está cadastrado']);
            } else {
                $sql = "UPDATE usuarios SET nome = '$nome', email = '$email' WHERE id_usuario = $id";
                if (mysqli_query($conn, $sql)) {
                    echo json_encode(['success' => true, 'message' => 'Usuário atualizado com sucesso!']);
                } else {
                    echo json_encode(['success' => false, 'error' => mysqli_error($conn)]);
                }
            }
            break;

        case 'delete':
            $id = mysqli_real_escape_string($conn, $_POST['id']);

            // Primeiro, verifica se o usuário tem tarefas associadas
            $check_tasks = "SELECT COUNT(*) as total FROM tarefas WHERE id_usuario = $id";
            $result = mysqli_query($conn, $check_tasks);
            $row = mysqli_fetch_assoc($result);

            if ($row['total'] > 0) {
                // Se houver tarefas, atualiza para remover a referência ao usuário
                $update_tasks = "UPDATE tarefas SET id_usuario = NULL WHERE id_usuario = $id";
                mysqli_query($conn, $update_tasks);
            }

            // Depois, exclui o usuário
            $sql = "DELETE FROM usuarios WHERE id_usuario = $id";
            if (mysqli_query($conn, $sql)) {
                echo json_encode(['success' => true, 'message' => 'Usuário excluído com sucesso!']);
            } else {
                echo json_encode(['success' => false, 'error' => mysqli_error($conn)]);
            }
            break;

        default:
            echo json_encode(['success' => false, 'error' => 'Ação inválida']);
    }
}

mysqli_close($conn);

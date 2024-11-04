<?php

// Inclui o arquivo de conexão com o banco de dados
require_once 'db_connection.php';

// Verifica se a requisição é do tipo POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Verifica se a ação foi definida na requisição
    if (isset($_POST['action'])) {
        // Determina qual ação executar com base no valor de $_POST['action']
        switch ($_POST['action']) {
            case 'add':
                adicionarTarefa($conn);
                break;
            case 'move':
                moverTarefa($conn);
                break;
            case 'delete':
                excluirTarefa($conn);
                break;
            case 'update':
                atualizarTarefa($conn);
                break;
            default:
                // Retorna erro se a ação for inválida
                echo json_encode(['success' => false, 'error' => 'Ação inválida']);
        }
    } else {
        // Retorna erro se nenhuma ação foi especificada
        echo json_encode(['success' => false, 'error' => 'Ação não especificada']);
    }
} else {
    // Retorna erro se o método de requisição não for POST
    echo json_encode(['success' => false, 'error' => 'Método de requisição inválido']);
}

// Fecha a conexão com o banco de dados
mysqli_close($conn);

/**
 * Função para adicionar uma nova tarefa
 * @param mysqli $conn Conexão com o banco de dados
 */
function adicionarTarefa($conn)
{
    // Escapa os dados recebidos para evitar injeção de SQL
    $tarefa = mysqli_real_escape_string($conn, $_POST['task']);
    $descricao = mysqli_real_escape_string($conn, $_POST['description']);
    $setor = mysqli_real_escape_string($conn, $_POST['sector']);
    $prioridade = mysqli_real_escape_string($conn, $_POST['priority']);
    $id_usuario = mysqli_real_escape_string($conn, $_POST['user_id']);
    $status = "A Fazer";  // Garante que novas tarefas sejam adicionadas como "A Fazer"
    $data_vencimento = mysqli_real_escape_string($conn, $_POST['due_date']);

    // Prepara a query SQL para inserir a nova tarefa
    $sql = "INSERT INTO tarefas (tarefa, descricao, setor, prioridade, status, id_usuario, data_vencimento) 
            VALUES ('$tarefa', '$descricao', '$setor', '$prioridade', '$status', '$id_usuario', " .
        ($data_vencimento ? "'$data_vencimento'" : "NULL") . ")";

    // Executa a query e verifica se foi bem-sucedida
    executarQuery($conn, $sql);
}

/**
 * Função para mover uma tarefa (atualizar seu status)
 * @param mysqli $conn Conexão com o banco de dados
 */
function moverTarefa($conn)
{
    // Escapa os dados recebidos
    $id = mysqli_real_escape_string($conn, $_POST['id']);
    $new_status = mysqli_real_escape_string($conn, $_POST['new_status']);

    // Prepara a query SQL para atualizar o status da tarefa
    $sql = "UPDATE tarefas SET status = '$new_status' WHERE id_tarefas = $id";

    // Executa a query e verifica se foi bem-sucedida
    executarQuery($conn, $sql);
}

/**
 * Função para excluir uma tarefa
 * @param mysqli $conn Conexão com o banco de dados
 */
function excluirTarefa($conn)
{
    // Escapa o ID recebido
    $id = mysqli_real_escape_string($conn, $_POST['id']);

    // Prepara a query SQL para deletar a tarefa
    $sql = "DELETE FROM tarefas WHERE id_tarefas = $id";

    // Executa a query e verifica se foi bem-sucedida
    executarQuery($conn, $sql);
}

/**
 * Função para executar uma query SQL e retornar o resultado em JSON
 * @param mysqli $conn Conexão com o banco de dados
 * @param string $sql Query SQL a ser executada
 */
function executarQuery($conn, $sql)
{
    if (mysqli_query($conn, $sql)) {
        // Retorna sucesso se a query for executada com êxito
        echo json_encode(['success' => true]);
    } else {
        // Retorna erro se houver falha na execução da query
        echo json_encode(['success' => false, 'error' => mysqli_error($conn)]);
    }
}

/**
 * Função para atualizar uma tarefa
 * @param mysqli $conn Conexão com o banco de dados
 */
function atualizarTarefa($conn)
{
    $id = mysqli_real_escape_string($conn, $_POST['id']);
    $tarefa = mysqli_real_escape_string($conn, $_POST['task']);
    $descricao = mysqli_real_escape_string($conn, $_POST['description']);
    $setor = mysqli_real_escape_string($conn, $_POST['sector']);
    $prioridade = mysqli_real_escape_string($conn, $_POST['priority']);
    $id_usuario = mysqli_real_escape_string($conn, $_POST['user_id']);
    $data_vencimento = mysqli_real_escape_string($conn, $_POST['due_date']);

    $sql = "UPDATE tarefas 
            SET tarefa = '$tarefa', 
                descricao = '$descricao', 
                setor = '$setor', 
                prioridade = '$prioridade', 
                id_usuario = '$id_usuario',
                data_vencimento = " . ($data_vencimento ? "'$data_vencimento'" : "NULL") . "
            WHERE id_tarefas = $id";

    executarQuery($conn, $sql);
}

// Explicação do código:
// 1. O script começa incluindo o arquivo de conexão com o banco de dados.
// 2. Verifica se a requisição é do tipo POST.
// 3. Se for POST, verifica se uma ação foi especificada.
// 4. Dependendo da ação, chama a função correspondente (adicionar, mover, atualizar ou excluir tarefa).
// 5. Se a ação for inválida ou não especificada, retorna um erro.
// 6. Se a requisição não for POST, retorna um erro.
// 7. A conexão com o banco de dados é fechada ao final do script.
// 8. As funções adicionarTarefa(), moverTarefa(), atualizarTarefa() e excluirTarefa() manipulam as tarefas no banco de dados.
// 9. A função executarQuery() é usada para executar as queries SQL e retornar o resultado em formato JSON.
// 10. Todas as entradas do usuário são escapadas para prevenir injeção de SQL.
// 11. Os resultados das operações são sempre retornados em formato JSON para fácil manipulação no frontend.

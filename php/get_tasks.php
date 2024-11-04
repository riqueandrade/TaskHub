<?php
// Inclui o arquivo de conexão com o banco de dados
require_once 'db_connection.php';

// Obtém o status da tarefa da URL
$status = isset($_GET['status']) ? $_GET['status'] : 'A Fazer';

// Ajusta o status para corresponder exatamente ao que está no banco
switch ($status) {
    case 'A Fazer':
        $status = 'A Fazer';
        break;
    case 'Fazendo':
        $status = 'Fazendo';
        break;
    case 'Pronto':
        $status = 'Pronto';
        break;
    default:
        $status = 'A Fazer';
}

// Consulta SQL modificada para garantir correspondência exata
$sql = "SELECT t.*, u.nome as nome_usuario 
        FROM tarefas t 
        LEFT JOIN usuarios u ON t.id_usuario = u.id_usuario 
        WHERE t.status = '" . mysqli_real_escape_string($conn, $status) . "'
        ORDER BY t.prioridade DESC";

// Executa a consulta SQL
$result = mysqli_query($conn, $sql);

// Verifica se há tarefas encontradas
if (!$result) {
    echo "Erro na consulta: " . mysqli_error($conn);
    exit;
}

if (mysqli_num_rows($result) > 0) {
    // Loop através de cada tarefa encontrada
    while ($row = mysqli_fetch_assoc($result)) {
        // Cada tarefa é um <li> com classe card
        echo '<li class="card mb-3" data-priority="' . $row['prioridade'] . '" data-user-id="' . $row['id_usuario'] . '">';
        echo '<div class="card-body">';

        // Cabeçalho da tarefa (título e prioridade)
        echo '<div class="d-flex justify-content-between align-items-center mb-2">';
        echo '<h5 class="card-title mb-0">' . htmlspecialchars($row['tarefa']) . '</h5>';
        echo '<span class="badge todo-priority priority-' . $row['prioridade'] . '">'
            . ucfirst($row['prioridade']) . '</span>';
        echo '</div>';

        // Descrição da tarefa
        if (!empty($row['descricao'])) {
            echo '<p class="card-text todo-description">' . htmlspecialchars($row['descricao']) . '</p>';
        }

        // Informações adicionais (setor, responsável, data)
        echo '<div class="mb-3">';
        if (!empty($row['setor'])) {
            echo '<p class="todo-sector mb-1"><i class="bi bi-building"></i> Setor: '
                . htmlspecialchars($row['setor']) . '</p>';
        }
        if (!empty($row['nome_usuario'])) {
            echo '<p class="todo-user mb-1"><i class="bi bi-person"></i> Responsável: '
                . htmlspecialchars($row['nome_usuario']) . '</p>';
        } else {
            echo '<p class="todo-user mb-1"><i class="bi bi-person"></i> Responsável: Não atribuído</p>';
        }

        // Data de vencimento
        if (!empty($row['data_vencimento'])) {
            $data_vencimento = new DateTime($row['data_vencimento']);
            $hoje = new DateTime();
            $dias_restantes = $hoje->diff($data_vencimento)->days;
            $classe_vencimento = '';

            if ($data_vencimento < $hoje) {
                $classe_vencimento = 'text-danger';
            } elseif ($dias_restantes <= 2) {
                $classe_vencimento = 'text-warning';
            }

            echo '<p class="todo-due-date mb-1 ' . $classe_vencimento . '">';
            echo '<i class="bi bi-calendar-event"></i> Vence em: '
                . $data_vencimento->format('d/m/Y');
            echo '</p>';
        }
        echo '</div>'; // Fechando div das informações adicionais

        // Botões de ação
        echo '<div class="task-buttons">';
        if ($status !== 'Pronto') {
            echo '<button class="btn btn-primary move-btn me-2" data-id="' . $row['id_tarefas']
                . '" data-status="' . $status . '">Mover</button>';
        }
        echo '<button class="btn btn-warning edit-btn me-2" data-id="' . $row['id_tarefas']
            . '" data-task="' . htmlspecialchars($row['tarefa'])
            . '" data-description="' . htmlspecialchars($row['descricao'])
            . '" data-sector="' . htmlspecialchars($row['setor'])
            . '" data-priority="' . htmlspecialchars($row['prioridade'])
            . '" data-user="' . htmlspecialchars($row['id_usuario'])
            . '"><i class="bi bi-pencil-fill"></i></button>';
        echo '<button class="btn btn-danger delete-btn" data-id="' . $row['id_tarefas']
            . '">Excluir</button>';
        echo '</div>';

        echo '</div>'; // card-body
        echo '</li>';
    }
} else {
    // Mensagem exibida quando nenhuma tarefa é encontrada
    echo '<li class="text-center text-muted py-3">Nenhuma tarefa encontrada.</li>';
}

// Fecha a conexão com o banco de dados
mysqli_close($conn);



// Explicação do código:
// 1. O script começa incluindo o arquivo de conexão com o banco de dados.
// 2. Obtém o status da tarefa da URL ou define como 'A Fazer' se não estiver presente.
// 3. Ajusta o status para corresponder exatamente ao que está no banco.
// 4. Prepara uma consulta SQL para selecionar tarefas com o status especificado.
// 5. Executa a consulta SQL.
// 6. Verifica se há tarefas encontradas.
// 7. Se houver tarefas, itera sobre cada uma delas:
//    - Cria um item de lista (<li>) para cada tarefa.
//    - Exibe o título da tarefa e sua prioridade.
//    - Mostra a descrição da tarefa.
//    - Apresenta o setor da tarefa.
//    - Adiciona botões para mover e excluir a tarefa.
// 8. Se não houver tarefas, exibe uma mensagem informando que nenhuma tarefa foi encontrada.
// 9. Fecha a conexão com o banco de dados ao final do script.
// 10. As tarefas são exibidas em uma estrutura HTML que facilita a estilização e interação via JavaScript.

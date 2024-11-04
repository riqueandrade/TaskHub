$(document).ready(function () {
    // Configurar data mínima para o input de data de vencimento
    const today = new Date().toISOString().split('T')[0];
    $('#todo-due-date').attr('min', today);

    // Adicionar validação quando o usuário tenta submeter o formulário
    $('#todo-form').on('submit', function (e) {
        const selectedDate = $('#todo-due-date').val();
        if (selectedDate && selectedDate < today) {
            e.preventDefault();
            alert('A data de vencimento não pode ser anterior à data atual.');
            return false;
        }
    });

    // Carrega a lista de usuários quando a página carrega
    $.ajax({
        url: 'php/get_users.php',
        type: 'GET',
        success: function (response) {
            var users = JSON.parse(response);
            var select = $('#todo-user');
            select.empty(); // Limpa as opções existentes
            select.append($('<option>', {
                value: '',
                text: 'Selecione um responsável'
            }));
            users.forEach(function (user) {
                select.append($('<option>', {
                    value: user.id_usuario,
                    text: user.nome
                }));
            });

            // Inicializa o Select2
            select.select2({
                theme: 'bootstrap-5',
                placeholder: 'Selecione um responsável',
                allowClear: true,
                width: '100%',
                language: {
                    noResults: function () {
                        return "Nenhum usuário encontrado";
                    },
                    searching: function () {
                        return "Buscando...";
                    }
                }
            }).on('select2:open', function () {
                // Adiciona o ícone de busca quando o dropdown é aberto
                setTimeout(function () {
                    if (!$('.select2-search-icon').length) {
                        $('.select2-search--dropdown .select2-search__field')
                            .before('<span class="select2-search-icon"><i class="bi bi-search"></i></span>');
                    }
                }, 0);
            });

            // Adicionar ícone de busca manualmente
            $('.select2-search__field').before('<span class="select2-search-icon"><i class="bi bi-search"></i></span>');
        },
        error: function (xhr, status, error) {
            console.error("Erro ao carregar usuários:", error);
        }
    });

    // Quando o formulário de tarefas é submetido
    $('#todo-form').submit(function (e) {
        e.preventDefault(); // Previne o comportamento padrão
        e.stopPropagation(); // Impede a propagação do evento

        let formData = $(this).serialize();

        // Adiciona o ID da tarefa se estiver editando
        if (editingTaskId) {
            formData += '&action=update&id=' + editingTaskId;
        } else {
            formData += '&action=add';
        }

        $.ajax({
            url: 'php/script.php',
            type: 'POST',
            data: formData,
            success: function (response) {
                $('#todo-form')[0].reset();
                editingTaskId = null;
                $('button[type="submit"]').text('Adicionar');
                updateTaskLists();
            },
            error: function (xhr, status, error) {
                console.error("Erro na operação:", error);
            }
        });

        return false; // Garante que o formulário não será submetido normalmente
    });

    // Função para atualizar as listas de tarefas
    function updateTaskLists() {
        $('.card').each(function() {
            var status = $(this).find('.card-header h2').text().trim();
            var taskList = $(this).find('.task-list');
            taskList.load('php/get_tasks.php?status=' + encodeURIComponent(status), function() {
                updateTaskCounters(); // Atualiza os contadores após carregar as tarefas
            });
        });
    }

    // Atualiza as listas de tarefas inicialmente quando o documento está pronto
    updateTaskLists();

    // Evento para mover uma tarefa para o próximo status
    $(document).on('click', '.move-btn', function () {
        var taskId = $(this).data('id'); // Obtém o ID da tarefa
        var currentStatus = $(this).data('status'); // Obtém o status atual da tarefa
        // Define o novo status com base no status atual
        var newStatus = (currentStatus === 'A Fazer') ? 'Fazendo' :
            (currentStatus === 'Fazendo') ? 'Pronto' : 'A Fazer';

        // Envia uma requisição AJAX para mover a tarefa
        $.ajax({
            url: 'php/script.php',
            type: 'POST',
            data: {
                action: 'move', // Ação de mover
                id: taskId, // ID da tarefa
                new_status: newStatus // Novo status da tarefa
            },
            success: function (response) {
                // Atualiza as listas de tarefas após mover
                updateTaskLists();
            },
            error: function (xhr, status, error) {
                // Loga um erro no console se a requisição falhar
                console.error("Erro ao mover tarefa:", error);
            }
        });
    });

    // Evento para excluir uma tarefa
    $(document).on('click', '.delete-btn', function (e) {
        e.preventDefault(); // Previne qualquer comportamento padrão

        var confirmDelete = window.confirm('Tem certeza que deseja excluir esta tarefa?');

        if (confirmDelete) {
            var taskId = $(this).data('id'); // Obtém o ID da tarefa

            // Envia uma requisição AJAX para excluir a tarefa
            $.ajax({
                url: 'php/script.php',
                type: 'POST',
                data: {
                    action: 'delete', // Ação de excluir
                    id: taskId // ID da tarefa
                },
                success: function (response) {
                    // Atualiza as listas de tarefas após exclusão
                    updateTaskLists();
                },
                error: function (xhr, status, error) {
                    // Loga um erro no console se a requisição falhar
                    console.error("Erro ao excluir tarefa:", error);
                }
            });
        }
    });

    // No início do documento.ready, após as funções existentes:
    let editingTaskId = null;

    // Evento para editar uma tarefa
    $(document).on('click', '.edit-btn', function () {
        editingTaskId = $(this).data('id');

        // Preenche o formulário com os dados da tarefa
        $('#todo-input').val($(this).data('task'));
        $('#todo-description').val($(this).data('description'));
        $('#todo-sector').val($(this).data('sector'));
        $('#todo-priority').val($(this).data('priority'));
        $('#todo-user').val($(this).data('user'));

        // Muda o texto do botão
        $('button[type="submit"]').text('Atualizar Tarefa');

        // Scroll suave até o formulário
        $('html, body').animate({
            scrollTop: $('#todo-form').offset().top - 100
        }, 500);
    });

    // Função para verificar notificações
    function checkNotifications() {
        $.ajax({
            url: 'php/check_notifications.php',
            type: 'GET',
            success: function (response) {
                var notifications = JSON.parse(response);
                if (notifications.length > 0) {
                    var notificationHtml = '<ul class="list-group list-group-flush">';
                    notifications.forEach(function (notif) {
                        notificationHtml += `
                            <li class="list-group-item">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-1">${notif.tarefa}</h6>
                                        <p class="mb-0 text-muted small">
                                            <i class="bi bi-person-fill me-1"></i>
                                            Responsável: ${notif.responsavel || "Não atribuído"}
                                        </p>
                                    </div>
                                    <span class="badge bg-warning text-dark">
                                        <i class="bi bi-calendar-event me-1"></i>
                                        ${new Date(notif.data_vencimento).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            </li>
                        `;
                    });
                    notificationHtml += '</ul>';

                    $('#notification-list').html(notificationHtml);

                    // Mostra o modal
                    var notificationModal = new bootstrap.Modal(document.getElementById('notificationModal'));
                    notificationModal.show();
                }
            }
        });
    }

    // Verifica notificações quando a página carrega
    checkNotifications();

    // Verifica notificaçes a cada 5 minutos
    setInterval(checkNotifications, 300000);

    // Atualizar as funções de exportação
    $(document).ready(function () {
        // Função para obter todas as tarefas
        function getAllTasks(callback) {
            $.ajax({
                url: 'php/get_all_tasks.php',
                type: 'GET',
                dataType: 'json',
                success: function (response) {
                    if (response.error) {
                        console.error('Erro ao buscar tarefas:', response.error);
                        return;
                    }
                    callback(response);
                },
                error: function (xhr, status, error) {
                    console.error('Erro na requisição:', error);
                }
            });
        }

        // Exportar para Excel
        $('#exportTasksExcel').click(function (e) {
            e.preventDefault();

            getAllTasks(function (tasks) {
                let excelContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
                excelContent += '<?mso-application progid="Excel.Sheet"?>\n';
                excelContent += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
                excelContent += '    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
                
                // Adiciona estilos
                excelContent += '<Styles>\n';
                excelContent += `
                    <Style ss:ID="Header">
                        <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
                        <Font ss:Bold="1" ss:Size="12" ss:Color="#FFFFFF"/>
                        <Interior ss:Color="#4A90E2" ss:Pattern="Solid"/>
                        <Borders>
                            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
                        </Borders>
                    </Style>
                    <Style ss:ID="Title">
                        <Font ss:Bold="1" ss:Size="14" ss:Color="#4A90E2"/>
                        <Alignment ss:Horizontal="Left"/>
                    </Style>
                    <Style ss:ID="Date">
                        <Font ss:Size="10" ss:Color="#6C757D"/>
                        <Alignment ss:Horizontal="Left"/>
                    </Style>
                `;
                excelContent += '</Styles>\n';

                // Adiciona a planilha
                excelContent += '<Worksheet ss:Name="Tarefas">\n';
                excelContent += '<Table>\n';

                // Título e Data
                excelContent += `
                    <Row>
                        <Cell ss:StyleID="Title"><Data ss:Type="String">TaskHub - Relatório de Tarefas</Data></Cell>
                    </Row>
                    <Row>
                        <Cell ss:StyleID="Date">
                            <Data ss:Type="String">Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</Data>
                        </Cell>
                    </Row>
                    <Row></Row>
                `;

                // Cabeçalhos
                excelContent += '<Row>\n';
                ["Tarefa", "Setor", "Prioridade", "Status", "Responsável", "Vencimento"].forEach(header => {
                    excelContent += `<Cell ss:StyleID="Header"><Data ss:Type="String">${header}</Data></Cell>\n`;
                });
                excelContent += '</Row>\n';

                // Dados
                tasks.forEach(task => {
                    excelContent += '<Row>\n';
                    excelContent += `<Cell><Data ss:Type="String">${task.tarefa}</Data></Cell>\n`;
                    excelContent += `<Cell><Data ss:Type="String">${task.setor || 'N/A'}</Data></Cell>\n`;
                    excelContent += `<Cell><Data ss:Type="String">${task.prioridade.toUpperCase()}</Data></Cell>\n`;
                    excelContent += `<Cell><Data ss:Type="String">${task.status}</Data></Cell>\n`;
                    excelContent += `<Cell><Data ss:Type="String">${task.nome_usuario || 'Não atribuído'}</Data></Cell>\n`;
                    excelContent += `<Cell><Data ss:Type="String">${task.data_vencimento ? new Date(task.data_vencimento).toLocaleDateString('pt-BR') : 'N/A'}</Data></Cell>\n`;
                    excelContent += '</Row>\n';
                });

                excelContent += '</Table>\n</Worksheet>\n</Workbook>';

                const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'TaskHub_Tarefas.xls';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        });

        // Exportar para PDF
        $('#exportTasksPDF').click(function (e) {
            e.preventDefault();

            getAllTasks(function (tasks) {
                window.jspdf.jsPDF.autoTableSetDefaults({
                    headStyles: { fillColor: [74, 144, 226] },
                    styles: { font: 'helvetica', fontSize: 8 },
                    columnStyles: {
                        0: { cellWidth: 40 },
                        1: { cellWidth: 30 },
                        2: { cellWidth: 25 },
                        3: { cellWidth: 25 },
                        4: { cellWidth: 35 },
                        5: { cellWidth: 35 }
                    }
                });

                const doc = new window.jspdf.jsPDF();

                doc.setFontSize(16);
                doc.text("Lista de Tarefas", 14, 15);

                const headers = [["Tarefa", "Setor", "Prioridade", "Status", "Responsável", "Vencimento"]];
                const data = tasks.map(task => [
                    task.tarefa,
                    task.setor || 'N/A',
                    task.prioridade.toUpperCase(),
                    task.status,
                    task.nome_usuario || 'Não atribuído',
                    task.data_vencimento ? new Date(task.data_vencimento).toLocaleDateString('pt-BR') : 'N/A'
                ]);

                doc.autoTable({
                    head: headers,
                    body: data,
                    startY: 25,
                    theme: 'grid'
                });

                doc.save("tarefas.pdf");
            });
        });
    });

    // Adicionar função para atualizar contadores
    function updateTaskCounters() {
        $('.card').each(function() {
            const status = $(this).find('.card-header h2').text().trim();
            const taskCount = $(this).find('.task-list li').length;
            $(this).find('.task-counter').text(taskCount);
        });
    }

    // Chamar updateTaskCounters também após outras operações que modificam as tarefas
    // Adicionar após operações de mover, excluir e adicionar tarefas

    // Adicionar após as funções existentes
    function loadFilters() {
        // Carregar usuários para o filtro
        $.ajax({
            url: 'php/get_users.php',
            type: 'GET',
            success: function(response) {
                const users = JSON.parse(response);
                const filterUser = $('#filterUser');
                users.forEach(user => {
                    filterUser.append(`<option value="${user.id_usuario}">${user.nome}</option>`);
                });
            }
        });

        // Carregar setores únicos para o filtro
        $.ajax({
            url: 'php/get_unique_sectors.php',
            type: 'GET',
            success: function(response) {
                const sectors = JSON.parse(response);
                const filterSector = $('#filterSector');
                sectors.forEach(sector => {
                    if (sector) { // Verifica se o setor não é nulo
                        filterSector.append(`<option value="${sector}">${sector}</option>`);
                    }
                });
            }
        });
    }

    // Função para aplicar os filtros
    function applyFilters() {
        const searchTerm = $('#searchTasks').val().toLowerCase();
        const priority = $('#filterPriority').val();
        const userId = $('#filterUser').val();
        const sector = $('#filterSector').val();

        // Para cada coluna do Kanban
        $('.card').each(function() {
            let visibleTasks = 0;
            
            // Para cada tarefa nesta coluna
            $(this).find('.task-list li').each(function() {
                const $task = $(this);
                const taskTitle = $task.find('.card-title').text().toLowerCase();
                const taskDescription = $task.find('.todo-description').text().toLowerCase();
                const taskPriority = $task.data('priority');
                const taskUserId = $task.data('user-id');
                const taskSector = $task.find('.todo-sector').text().toLowerCase();

                const matchesSearch = taskTitle.includes(searchTerm) || 
                                    taskDescription.includes(searchTerm);
                const matchesPriority = !priority || taskPriority === priority;
                const matchesUser = !userId || String(taskUserId) === String(userId);
                const matchesSector = !sector || taskSector.includes(sector.toLowerCase());

                if (matchesSearch && matchesPriority && matchesUser && matchesSector) {
                    $task.show();
                    visibleTasks++;
                } else {
                    $task.hide();
                }
            });

            // Atualiza o contador desta coluna com o número de tarefas visíveis
            $(this).find('.task-counter').text(visibleTasks);
        });
    }

    // Event listeners para os filtros
    $('#searchTasks, #filterPriority, #filterUser, #filterSector').on('input change', function() {
        applyFilters();
    });

    // Carregar os filtros quando a página carregar
    $(document).ready(function() {
        loadFilters();
    });

    // Atualizar o event listener do botão de exportar
    $(document).ready(function() {
        // Event listener para o botão de exportar
        $('#exportTasksBtn').on('click', function() {
            const exportModal = new bootstrap.Modal(document.getElementById('exportModal'));
            exportModal.show();
        });
    });
});

// Explicação do código:

// 1. O código está envolvido em $(document).ready() para garantir que ele só seja executado quando o DOM estiver completamente carregado.

// 2. Manipulação do formulário:
//    - Quando o formulário é submetido, o evento padrão é prevenido.
//    - Uma requisição AJAX é enviada para adicionar uma nova tarefa.
//    - Após o sucesso, o formulário é resetado e a lista de tarefas é atualizada.

// 3. Função updateTaskLists():
//    - Atualiza todas as listas de tarefas.
//    - Para cada coluna, obtém o status e carrega as tarefas correspondentes do servidor.

// 4. Evento de mover tarefa:
//    - Acionado quando o botão de mover é clicado.
//    - Obtém o ID da tarefa e seu status atual.
//    - Determina o novo status com base no status atual.
//    - Envia uma requisição AJAX para atualizar o status da tarefa no servidor.
//    - Após o sucesso, atualiza as listas de tarefas.

// 5. Evento de excluir tarefa:
//    - Acionado quando o botão de excluir é clicado.
//    - Obtém o ID da tarefa.
//    - Envia uma requisição AJAX para excluir a tarefa no servidor.
//    - Após o sucesso, atualiza as listas de tarefas.

// 6. Tratamento de erros:
//    - Todos os erros de AJAX são logados no console para facilitar a depuração.

// Funções de exportação no escopo global
function exportToPDF() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('exportModal'));
    modal.hide();
    
    getAllTasks(function(tasks) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4'); // Mudando para orientação paisagem ('l')

        // Adiciona cabeçalho
        doc.setFontSize(20);
        doc.setTextColor(74, 144, 226);
        doc.text("TaskHub - Relatório de Tarefas", 14, 20);

        // Adiciona data do relatório
        doc.setFontSize(10);
        doc.setTextColor(108, 117, 125);
        doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 30);

        // Configuração da tabela com larguras ajustadas
        doc.autoTable({
            startY: 40,
            headStyles: { 
                fillColor: [74, 144, 226],
                fontSize: 10,
                fontStyle: 'bold',
                halign: 'center'
            },
            head: [["Tarefa", "Setor", "Prioridade", "Status", "Responsável", "Vencimento"]],
            body: tasks.map(task => [
                task.tarefa,
                task.setor || 'N/A',
                task.prioridade.toUpperCase(),
                task.status,
                task.nome_usuario || 'Não atribuído',
                task.data_vencimento ? new Date(task.data_vencimento).toLocaleDateString('pt-BR') : 'N/A'
            ]),
            styles: { 
                fontSize: 9,
                cellPadding: 5,
                overflow: 'linebreak'
            },
            columnStyles: {
                0: { cellWidth: 70 }, // Tarefa - mais espaço
                1: { cellWidth: 40 }, // Setor
                2: { cellWidth: 25, halign: 'center' }, // Prioridade
                3: { cellWidth: 25, halign: 'center' }, // Status
                4: { cellWidth: 45 }, // Responsável
                5: { cellWidth: 30, halign: 'center' } // Vencimento
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250]
            },
            margin: { left: 10, right: 10 },
            didDrawPage: function(data) {
                // Adiciona rodapé em cada página
                doc.setFontSize(8);
                doc.setTextColor(108, 117, 125);
                doc.text(
                    `Página ${doc.getCurrentPageInfo().pageNumber}`,
                    data.settings.margin.left,
                    doc.internal.pageSize.height - 10
                );
            }
        });

        doc.save("TaskHub_Tarefas.pdf");
    });
}

function exportToExcel() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('exportModal'));
    modal.hide();

    getAllTasks(function(tasks) {
        let excelContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
        excelContent += '<?mso-application progid="Excel.Sheet"?>\n';
        excelContent += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
        excelContent += '    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
        
        // Adiciona estilos
        excelContent += '<Styles>\n';
        excelContent += `
            <Style ss:ID="Header">
                <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
                <Font ss:Bold="1" ss:Size="12" ss:Color="#FFFFFF"/>
                <Interior ss:Color="#4A90E2" ss:Pattern="Solid"/>
                <Borders>
                    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
                </Borders>
            </Style>
            <Style ss:ID="Title">
                <Font ss:Bold="1" ss:Size="14" ss:Color="#4A90E2"/>
                <Alignment ss:Horizontal="Left"/>
            </Style>
            <Style ss:ID="Date">
                <Font ss:Size="10" ss:Color="#6C757D"/>
                <Alignment ss:Horizontal="Left"/>
            </Style>
        `;
        excelContent += '</Styles>\n';

        // Adiciona a planilha
        excelContent += '<Worksheet ss:Name="Tarefas">\n';
        excelContent += '<Table>\n';

        // Título e Data
        excelContent += `
            <Row>
                <Cell ss:StyleID="Title"><Data ss:Type="String">TaskHub - Relatório de Tarefas</Data></Cell>
            </Row>
            <Row>
                <Cell ss:StyleID="Date">
                    <Data ss:Type="String">Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</Data>
                </Cell>
            </Row>
            <Row></Row>
        `;

        // Cabeçalhos
        excelContent += '<Row>\n';
        ["Tarefa", "Setor", "Prioridade", "Status", "Responsável", "Vencimento"].forEach(header => {
            excelContent += `<Cell ss:StyleID="Header"><Data ss:Type="String">${header}</Data></Cell>\n`;
        });
        excelContent += '</Row>\n';

        // Dados
        tasks.forEach(task => {
            excelContent += '<Row>\n';
            excelContent += `<Cell><Data ss:Type="String">${task.tarefa}</Data></Cell>\n`;
            excelContent += `<Cell><Data ss:Type="String">${task.setor || 'N/A'}</Data></Cell>\n`;
            excelContent += `<Cell><Data ss:Type="String">${task.prioridade.toUpperCase()}</Data></Cell>\n`;
            excelContent += `<Cell><Data ss:Type="String">${task.status}</Data></Cell>\n`;
            excelContent += `<Cell><Data ss:Type="String">${task.nome_usuario || 'Não atribuído'}</Data></Cell>\n`;
            excelContent += `<Cell><Data ss:Type="String">${task.data_vencimento ? new Date(task.data_vencimento).toLocaleDateString('pt-BR') : 'N/A'}</Data></Cell>\n`;
            excelContent += '</Row>\n';
        });

        excelContent += '</Table>\n</Worksheet>\n</Workbook>';

        const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'TaskHub_Tarefas.xls';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// Função auxiliar para obter todas as tarefas
function getAllTasks(callback) {
    $.ajax({
        url: 'php/get_all_tasks.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.error) {
                console.error('Erro ao buscar tarefas:', response.error);
                return;
            }
            callback(response);
        },
        error: function(xhr, status, error) {
            console.error('Erro na requisição:', error);
        }
    });
}

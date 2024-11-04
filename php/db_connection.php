<?php
// Configurações de conexão com o banco de dados
// Estas variáveis armazenam as informações necessárias para conectar ao banco de dados
$db_host = "localhost";  // Endereço do servidor do banco de dados
$db_user = "root";       // Nome de usuário para acessar o banco de dados
$db_pass = "";           // Senha do usuário (vazia neste caso)
$db_name = "to_do_list"; // Nome do banco de dados que será utilizado

// Estabelece a conexão com o banco de dados
// A função mysqli_connect() tenta criar uma conexão com o banco de dados usando as configurações acima
$conn = mysqli_connect($db_host, $db_user, $db_pass, $db_name);

// Verifica se a conexão foi bem-sucedida
// Se a conexão falhar, o script será encerrado e uma mensagem de erro será exibida
if (!$conn) {
    die("Conexão falhou: " . mysqli_connect_error());
}
// Define o conjunto de caracteres para UTF-8
// Isso garante que caracteres especiais e acentos sejam tratados corretamente
mysqli_set_charset($conn, "utf8mb4");


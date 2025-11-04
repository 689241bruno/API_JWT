use banco_api;
create table usuarios(
id INT AUTO_INCREMENT PRIMARY KEY,
nome varchar(255) NOT NULL UNIQUE,
email varchar(255) NOT NULL UNIQUE,
senha varchar(255) NOT NULL);

ALTER TABLE usuarios
ADD tipo ENUM('aluno', 'professor', 'admin') NOT NULL DEFAULT 'aluno';
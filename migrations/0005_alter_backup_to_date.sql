-- Migration number: 0005 	 2025-10-20T17:00:00.000Z
-- Alterar campo BACKUP de TEXT para DATE e renomear para backup (minúsculo) na tabela lojas

-- Criar nova tabela com a estrutura desejada
CREATE TABLE lojas_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    idloja INTEGER NOT NULL,
    banco TEXT NOT NULL,
    backup DATE,
    loja TEXT,
    ultimoerrorelicar TEXT,
    ultimoerrointegracao TEXT,
    qdtregistrosreplicar INTEGER,
    replicar DATETIME,
    reglocal INTEGER,
    regservidor INTEGER,
    versaosinc TEXT,
    tempogastoreplicar INTEGER,
    regintegracao INTEGER,
    versaol TEXT,
    versaopro TEXT,
    versaoomnni TEXT,
    versaolite TEXT,
    versaoparelelo TEXT,
    versaodunamis TEXT,
    versaointegracao TEXT,
    versaoatualizador TEXT,
    versaotemp TEXT,
    ipvpn TEXT,
    integracao INTEGER,
    UNIQUE(banco, idloja)
);

-- Copiar dados da tabela antiga para a nova (se houver dados)
-- Converter o campo BACKUP para o novo nome e tipo DATE
INSERT INTO lojas_new (idloja, banco, backup, loja, ultimoerrorelicar, ultimoerrointegracao, 
                       qdtregistrosreplicar, replicar, reglocal, regservidor, versaosinc, 
                       tempogastoreplicar, regintegracao, versaol, versaopro, versaoomnni, 
                       versaolite, versaoparelelo, versaodunamis, versaointegracao, 
                       versaoatualizador, versaotemp, ipvpn, integracao)
SELECT idloja, banco, 
       CASE 
         WHEN BACKUP IS NOT NULL AND BACKUP != '' THEN date(BACKUP)
         ELSE NULL
       END as backup,
       loja, ultimoerrorelicar, ultimoerrointegracao, 
       qdtregistrosreplicar, replicar, reglocal, regservidor, versaosinc, 
       tempogastoreplicar, regintegracao, versaol, versaopro, versaoomnni, 
       versaolite, versaoparelelo, versaodunamis, versaointegracao, 
       versaoatualizador, versaotemp, ipvpn, integracao
FROM lojas;

-- Remover tabela antiga
DROP TABLE lojas;

-- Renomear nova tabela
ALTER TABLE lojas_new RENAME TO lojas;

-- Criar índice para a nova chave primária composta
CREATE INDEX idx_lojas_banco_idloja ON lojas(banco, idloja);
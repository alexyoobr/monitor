-- Migration number: 0004 	 2025-10-20T10:00:00.000Z
-- Alterar campo replicar de INTEGER para DATETIME na tabela lojas

-- Criar nova tabela com a estrutura desejada
CREATE TABLE lojas_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    idloja INTEGER NOT NULL,
    banco TEXT NOT NULL,
    BACKUP TEXT,
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
-- Para campos DATETIME, vamos converter os valores inteiros existentes em timestamps
INSERT INTO lojas_new (idloja, banco, BACKUP, loja, ultimoerrorelicar, ultimoerrointegracao, 
                       qdtregistrosreplicar, replicar, reglocal, regservidor, versaosinc, 
                       tempogastoreplicar, regintegracao, versaol, versaopro, versaoomnni, 
                       versaolite, versaoparelelo, versaodunamis, versaointegracao, 
                       versaoatualizador, versaotemp, ipvpn, integracao)
SELECT idloja, banco, BACKUP, loja, ultimoerrorelicar, ultimoerrointegracao, 
       qdtregistrosreplicar, 
       CASE 
         WHEN replicar IS NOT NULL AND replicar > 0 THEN datetime(replicar, 'unixepoch')
         ELSE NULL
       END as replicar,
       reglocal, regservidor, versaosinc, 
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
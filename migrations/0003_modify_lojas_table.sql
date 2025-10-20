-- Migration number: 0003 	 2025-10-19T18:35:00.000Z
-- Adicionar campo id autoincremental e alterar primary key para banco + idloja

-- Criar nova tabela com a estrutura desejada
CREATE TABLE lojas_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    idloja INTEGER NOT NULL,
    banco TEXT NOT NULL,
    backup TEXT,
    loja TEXT,
    ultimoerrorelicar TEXT,
    ultimoerrointegracao TEXT,
    qdtregistrosreplicar INTEGER,
    replicar INTEGER,
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
INSERT INTO lojas_new (idloja, banco, BACKUP, loja, ultimoerrorelicar, ultimoerrointegracao, 
                       qdtregistrosreplicar, replicar, reglocal, regservidor, versaosinc, 
                       tempogastoreplicar, regintegracao, versaol, versaopro, versaoomnni, 
                       versaolite, versaoparelelo, versaodunamis, versaointegracao, 
                       versaoatualizador, versaotemp, ipvpn, integracao)
SELECT idloja, banco, BACKUP, loja, ultimoerrorelicar, ultimoerrointegracao, 
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
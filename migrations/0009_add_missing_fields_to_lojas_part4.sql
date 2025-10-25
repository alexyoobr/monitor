-- Migration number: 0009 	 2025-01-21T10:03:00.000Z
-- Adicionar campos faltantes do schema MySQL à tabela lojas (Parte 4)

-- Adicionar campos de controle e monitoramento (reduzido)
ALTER TABLE lojas ADD COLUMN anydesk TEXT DEFAULT NULL;
ALTER TABLE lojas ADD COLUMN versaocontrol TEXT DEFAULT NULL;
ALTER TABLE lojas ADD COLUMN sat TEXT DEFAULT NULL;
ALTER TABLE lojas ADD COLUMN contato TEXT DEFAULT NULL;
ALTER TABLE lojas ADD COLUMN email TEXT DEFAULT NULL;
ALTER TABLE lojas ADD COLUMN mensalidade DECIMAL(10,2) DEFAULT NULL;
ALTER TABLE lojas ADD COLUMN michel INTEGER DEFAULT NULL;
ALTER TABLE lojas ADD COLUMN michelloja INTEGER DEFAULT NULL;
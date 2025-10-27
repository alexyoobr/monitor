-- Migration number: 0011 	 2025-01-21T10:04:00.000Z
-- Adicionar coluna 'marca' faltante na tabela lojas

ALTER TABLE lojas ADD COLUMN marca TEXT DEFAULT NULL;
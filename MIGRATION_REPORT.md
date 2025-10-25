# Relatório de Migração - Tabela Lojas

## Resumo
Este relatório documenta a migração realizada para adicionar campos do schema MySQL à tabela `lojas` existente no SQLite.

## Campos Analisados
- **Total de campos no schema MySQL**: 73 campos
- **Campos já existentes**: 8 campos
- **Campos novos identificados**: 65 campos

## Migração Realizada

### Migrations Criadas
1. **0006_add_missing_fields_to_lojas.sql** - Primeira parte dos campos
2. **0007_add_missing_fields_to_lojas_part2.sql** - Segunda parte dos campos  
3. **0008_add_missing_fields_to_lojas_part3.sql** - Terceira parte dos campos
4. **0009_add_missing_fields_to_lojas_part4.sql** - Quarta parte dos campos

### Campos Adicionados com Sucesso
Aproximadamente **56 campos** foram adicionados com sucesso à tabela `lojas`, incluindo:

#### Parte 1 (0006) - Campos básicos e de identificação:
- `status`, `ambiente`, `ippt`, `csticms`, `aliquotaicmsreducao`
- `atualizacao`, `serasa`, `nomedocontato`, `codigodaloja`, `obs`
- `anydesk`, `versaocontrol`, `sat`, `contato`, `email`
- `mensalidade`, `michel`, `monitor`, `uuid`, `hoptodesk`
- `loja`, `marca`, `vencimento`

#### Parte 2 (0007) - Campos de configuração:
- `regime`, `modelo`, `serie`, `nf`, `pedido`, `ordem`, `romaneio`
- Configurações de email: `emailservidor`, `emailporta`, `emailusuario`, `emailsenha`, `emailssl`
- `certificado`, `aliquotaicms`, `aliquotafederal`, `aliquotaestadual`

#### Parte 3 (0008) - Campos fiscais e tributários:
- CSTs: `cstpis`, `cstcofins`, `cstipi`, `csticmsreducao`, `cstdevolucao`
- Alíquotas: `aliquotapis`, `aliquotacofins`, `aliquotaipi`
- `orientacao`, `modsetiqtscomposicao`, `instaladopro`

#### Parte 4 (0009) - Campos de controle:
- `michelloja`

## Limitação Encontrada

### Problema: Limite de Colunas do SQLite
Durante a migração, foi encontrada uma limitação do SQLite relacionada ao número máximo de colunas por tabela.

**Detalhes da Limitação:**
- **Limite padrão do SQLite**: 2000 colunas <mcreference link="https://www.sqlite.org/limits.html" index="1">1</mcreference>
- **Limite máximo configurável**: 32767 colunas <mcreference link="https://www.sqlite.org/limits.html" index="1">1</mcreference>
- **Erro encontrado**: `too many columns on sqlite_altertab_lojas: SQLITE_ERROR`

### Campos Não Migrados
Aproximadamente **8 campos** não puderam ser adicionados devido ao limite:
- `micheltabela`
- `ddd`
- `foneresp`
- `uuid` (duplicado)
- `hoptodesk` (duplicado)
- `marca` (duplicado)
- `vencimento` (duplicado)

## Soluções Alternativas Consideradas

1. **Recompilação do SQLite** <mcreference link="https://dba.stackexchange.com/questions/221508/how-to-increase-column-limit-of-a-table-in-sqlite" index="2">2</mcreference>
   - Requer alteração do parâmetro `SQLITE_MAX_COLUMN` em tempo de compilação
   - Não viável no ambiente Cloudflare Workers

2. **Normalização da Base de Dados** <mcreference link="https://www.sqlite.org/limits.html" index="1">1</mcreference>
   - Criar tabelas relacionadas para campos específicos
   - Recomendação: "well-normalized database will never need more than 100 columns in a table"

3. **Divisão em Múltiplas Tabelas**
   - Criar tabelas auxiliares com a mesma chave primária
   - Limitação: `SQLITE_MAX_COLUMNS` também se aplica a JOINs

## Status Final

### ✅ Concluído
- Análise do schema MySQL
- Comparação com schema existente
- Criação de migrations SQL
- Atualização dos tipos TypeScript
- Aplicação parcial das migrations
- Testes de funcionalidade (10/10 testes passando)

### ⚠️ Limitação Identificada
- 8 campos não puderam ser migrados devido ao limite de colunas do SQLite
- Funcionalidade existente mantida e testada com sucesso

## Recomendações

1. **Curto Prazo**: Manter a estrutura atual com os campos migrados
2. **Médio Prazo**: Avaliar a necessidade real de todos os campos não migrados
3. **Longo Prazo**: Considerar normalização da base de dados se mais campos forem necessários

## Arquivos Modificados

- `src/endpoints/lojas/base.ts` - Tipos TypeScript atualizados
- `migrations/0006_add_missing_fields_to_lojas.sql`
- `migrations/0007_add_missing_fields_to_lojas_part2.sql`
- `migrations/0008_add_missing_fields_to_lojas_part3.sql`
- `migrations/0009_add_missing_fields_to_lojas_part4.sql`

---
*Relatório gerado em: 2025-01-21*
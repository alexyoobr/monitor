import { OpenAPIRoute, contentJson } from "chanfana";
import { HandleArgs } from "../../types";
import { LojaModel, lojaInput } from "./base";
import { z } from "zod";

export class LojaCreate extends OpenAPIRoute {
  public schema = {
    tags: ["Lojas"],
    summary: "Create or update a loja",
    operationId: "loja-upsert",
    request: {
      body: contentJson(
        // Apenas banco e idloja obrigatórios; demais campos todos opcionais
        z.object({
          banco: z.string(),
          idloja: z.number().int(),
          // Todos os outros campos são completamente opcionais
          status: z.number().int().optional(),
          login: z.string().optional(),
          versao: z.string().optional(),
          instalado: z.string().optional(),
          backup: z.string().optional(),
          data: z.string().optional(),
          senha: z.string().optional(),
          cnpj: z.string().optional(),
          ie: z.string().optional(),
          nome: z.string().optional(),
          fantasia: z.string().optional(),
          fone: z.string().optional(),
          cep: z.string().optional(),
          logradouro: z.string().optional(),
          numero: z.string().optional(),
          complemento: z.string().optional(),
          bairro: z.string().optional(),
          idcidade: z.number().int().optional(),
          cidade: z.string().optional(),
          iduf: z.number().int().optional(),
          uf: z.string().optional(),
          regime: z.string().optional(),
          modelo: z.number().int().optional(),
          serie: z.number().int().optional(),
          nf: z.number().int().optional(),
          pedido: z.number().int().optional(),
          ordem: z.number().int().optional(),
          romaneio: z.number().int().optional(),
          bancoservidor: z.string().optional(),
          ipservidor: z.string().optional(),
          emailhost: z.string().optional(),
          emailport: z.string().optional(),
          emailusername: z.string().optional(),
          emailpassword: z.string().optional(),
          emailssl: z.number().int().optional(),
          emailtls: z.number().int().optional(),
          emailreqconfirmation: z.number().int().optional(),
          certificado: z.string().optional(),
          icmscredito: z.number().optional(),
          federal: z.number().optional(),
          estadual: z.number().optional(),
          ambiente: z.string().optional(),
          ippt: z.string().optional(),
          csticms: z.string().optional(),
          cstpis: z.string().optional(),
          cstcofins: z.string().optional(),
          cstipi: z.string().optional(),
          aliquotaicmsreducao: z.number().optional(),
          aliquotapis: z.number().optional(),
          aliquotacofins: z.number().optional(),
          aliquotaipi: z.number().optional(),
          csticmsreducao: z.string().optional(),
          cstdevolucao: z.number().int().optional(),
          orientacao: z.number().int().optional(),
          atualizacao: z.string().optional(),
          serasa: z.number().optional(),
          nomedocontato: z.string().optional(),
          codigodaloja: z.string().optional(),
          modsetiqtscomposicao: z.string().optional(),
          instaladopro: z.string().optional(),
          obs: z.string().optional(),
          anydesk: z.string().optional(),
          versaocontrol: z.string().optional(),
          sat: z.string().optional(),
          contato: z.string().optional(),
          email: z.string().optional(),
          mensalidade: z.number().optional(),
          michel: z.number().int().optional(),
          michelloja: z.number().int().optional(),
          micheltabela: z.string().optional(),
          ddd: z.string().optional(),
          foneresp: z.string().optional(),
          monitor: z.number().int().optional(),
          uuid: z.string().optional(),
          hoptodesk: z.string().optional(),
          loja: z.string().optional(),
          marca: z.string().optional(),
          vencimento: z.string().optional(),
          ultimoerrorelicar: z.string().optional(),
          ultimoerrointegracao: z.string().optional(),
          qdtregistrosreplicar: z.number().int().optional(),
          replicar: z.string().optional(),
          reglocal: z.number().int().optional(),
          regservidor: z.number().int().optional(),
          versaosinc: z.string().optional(),
          tempogastoreplicar: z.number().int().optional(),
          regintegracao: z.number().int().optional(),
          versaol: z.string().optional(),
          versaopro: z.string().optional(),
          versaoomnni: z.string().optional(),
          versaolite: z.string().optional(),
          versaoparelelo: z.string().optional(),
          versaodunamis: z.string().optional(),
          versaointegracao: z.string().optional(),
          versaoatualizador: z.string().optional(),
          versaotemp: z.string().optional(),
          ipvpn: z.string().optional(),
          integracao: z.number().int().optional(),
        }),
      ),
    },
    responses: {
      "200": {
        description: "Loja updated successfully",
        ...contentJson({
          success: Boolean,
          result: LojaModel.serializerObject,
        }),
      },
      "201": {
        description: "Loja created successfully",
        ...contentJson({
          success: Boolean,
          result: LojaModel.serializerObject,
        }),
      },
    },
  };

  public async handle(...[c]: HandleArgs) {
    const data = await this.getValidatedData<typeof this.schema>();
    const db = c.env.DB;
    
    // Serializar os dados antes de inserir
    const serializedData = LojaModel.serializer(data.body);
    
    // Verificar se a loja já existe
    const existingLoja = await db.prepare(
      `SELECT id FROM ${LojaModel.tableName} WHERE banco = ? AND idloja = ?`
    )
    .bind(serializedData.banco, serializedData.idloja)
    .first();
    
    if (existingLoja) {
      // Atualizar loja existente (upsert parcial: apenas campos presentes no body)
      const fields = Object.keys(serializedData).filter(key => key !== 'banco' && key !== 'idloja');
      if (fields.length > 0) {
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => serializedData[field]);
        await db.prepare(
          `UPDATE ${LojaModel.tableName} SET ${setClause} WHERE banco = ? AND idloja = ?`
        )
        .bind(...values, serializedData.banco, serializedData.idloja)
        .run();
      }
      // Obter os dados (atualizado ou original, se não havia campos para atualizar)
      const updatedLoja = await db.prepare(
        `SELECT * FROM ${LojaModel.tableName} WHERE banco = ? AND idloja = ?`
      )
      .bind(serializedData.banco, serializedData.idloja)
      .first();
      
      return c.json({
        success: true,
        result: updatedLoja
      }, 200);
    } else {
      // Criar nova loja
      const fields = Object.keys(serializedData);
      const placeholders = fields.map(() => '?').join(', ');
      const values = fields.map(field => serializedData[field]);
      
      await db.prepare(
        `INSERT INTO ${LojaModel.tableName} (${fields.join(', ')}) VALUES (${placeholders})`
      )
      .bind(...values)
      .run();
      
      // Obter os dados criados
      const createdLoja = await db.prepare(
        `SELECT * FROM ${LojaModel.tableName} WHERE banco = ? AND idloja = ?`
      )
      .bind(serializedData.banco, serializedData.idloja)
      .first();
      
      return c.json({
        success: true,
        result: createdLoja
      }, 201);
    }
  }
}
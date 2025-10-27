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
          status: z.number().int().nullish(),
          login: z.string().nullish(),
          versao: z.string().nullish(),
          instalado: z.string().nullish(),
          backup: z.string().nullish(),
          data: z.string().nullish(),
          senha: z.string().nullish(),
          cnpj: z.string().nullish(),
          ie: z.string().nullish(),
          nome: z.string().nullish(),
          fantasia: z.string().nullish(),
          fone: z.string().nullish(),
          cep: z.string().nullish(),
          logradouro: z.string().nullish(),
          numero: z.string().nullish(),
          complemento: z.string().nullish(),
          bairro: z.string().nullish(),
          idcidade: z.number().int().nullish(),
          cidade: z.string().nullish(),
          iduf: z.number().int().nullish(),
          uf: z.string().nullish(),
          regime: z.string().nullish(),
          modelo: z.number().int().nullish(),
          serie: z.number().int().nullish(),
          nf: z.number().int().nullish(),
          pedido: z.number().int().nullish(),
          ordem: z.number().int().nullish(),
          romaneio: z.number().int().nullish(),
          bancoservidor: z.string().nullish(),
          ipservidor: z.string().nullish(),
          emailhost: z.string().nullish(),
          emailport: z.string().nullish(),
          emailusername: z.string().nullish(),
          emailpassword: z.string().nullish(),
          emailssl: z.number().int().nullish(),
          emailtls: z.number().int().nullish(),
          emailreqconfirmation: z.number().int().nullish(),
          certificado: z.string().nullish(),
          icmscredito: z.number().nullish(),
          federal: z.number().nullish(),
          estadual: z.number().nullish(),
          ambiente: z.string().nullish(),
          ippt: z.string().nullish(),
          csticms: z.string().nullish(),
          cstpis: z.string().nullish(),
          cstcofins: z.string().nullish(),
          cstipi: z.string().nullish(),
          aliquotaicmsreducao: z.number().nullish(),
          aliquotapis: z.number().nullish(),
          aliquotacofins: z.number().nullish(),
          aliquotaipi: z.number().nullish(),
          csticmsreducao: z.string().nullish(),
          cstdevolucao: z.number().int().nullish(),
          orientacao: z.number().int().nullish(),
          atualizacao: z.string().nullish(),
          serasa: z.number().nullish(),
          nomedocontato: z.string().nullish(),
          codigodaloja: z.string().nullish(),
          modsetiqtscomposicao: z.string().nullish(),
          instaladopro: z.string().nullish(),
          obs: z.string().nullish(),
          anydesk: z.string().nullish(),
          versaocontrol: z.string().nullish(),
          sat: z.string().nullish(),
          contato: z.string().nullish(),
          email: z.string().nullish(),
          mensalidade: z.number().nullish(),
          michel: z.number().int().nullish(),
          michelloja: z.number().int().nullish(),
          micheltabela: z.string().nullish(),
          ddd: z.string().nullish(),
          foneresp: z.string().nullish(),
          monitor: z.number().int().nullish(),
          uuid: z.string().nullish(),
          hoptodesk: z.string().nullish(),
          loja: z.string().nullish(),
          marca: z.string().nullish(),
          vencimento: z.string().nullish(),
          ultimoerrorelicar: z.string().nullish(),
          ultimoerrointegracao: z.string().nullish(),
          qdtregistrosreplicar: z.number().int().nullish(),
          replicar: z.string().nullish(),
          reglocal: z.number().int().nullish(),
          regservidor: z.number().int().nullish(),
          versaosinc: z.string().nullish(),
          tempogastoreplicar: z.number().int().nullish(),
          regintegracao: z.number().int().nullish(),
          versaol: z.string().nullish(),
          versaopro: z.string().nullish(),
          versaoomnni: z.string().nullish(),
          versaolite: z.string().nullish(),
          versaoparelelo: z.string().nullish(),
          versaodunamis: z.string().nullish(),
          versaointegracao: z.string().nullish(),
          versaoatualizador: z.string().nullish(),
          versaotemp: z.string().nullish(),
          ipvpn: z.string().nullish(),
          integracao: z.number().int().nullish(),
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
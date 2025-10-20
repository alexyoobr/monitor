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
        lojaInput.pick({
          banco: true,
          idloja: true,
          BACKUP: true,
          loja: true,
          ultimoerrorelicar: true,
          ultimoerrointegracao: true,
          qdtregistrosreplicar: true,
          replicar: true,
          reglocal: true,
          regservidor: true,
          versaosinc: true,
          tempogastoreplicar: true,
          regintegracao: true,
          versaol: true,
          versaopro: true,
          versaoomnni: true,
          versaolite: true,
          versaoparelelo: true,
          versaodunamis: true,
          versaointegracao: true,
          versaoatualizador: true,
          versaotemp: true,
          ipvpn: true,
          integracao: true,
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
      // Atualizar loja existente (upsert)
      const fields = Object.keys(serializedData).filter(key => key !== 'banco' && key !== 'idloja');
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => serializedData[field]);
      
      await db.prepare(
        `UPDATE ${LojaModel.tableName} SET ${setClause} WHERE banco = ? AND idloja = ?`
      )
      .bind(...values, serializedData.banco, serializedData.idloja)
      .run();
      
      // Obter os dados atualizados
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
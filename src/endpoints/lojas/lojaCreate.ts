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
        lojaInput.partial().extend({
          banco: z.string(),
          idloja: z.number().int(),
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
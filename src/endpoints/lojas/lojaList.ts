import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { HandleArgs } from "../../types";
import { LojaModel } from "./base";

export class LojaList extends OpenAPIRoute {
  public schema = {
    tags: ["Lojas"],
    summary: "Listar lojas com paginação",
    operationId: "loja-list",
    request: {
      query: z.object({
        search: z.string().optional(),
        order_by: z.enum(["idloja", "banco", "loja"]).default("idloja"),
        order: z.enum(["ASC", "DESC"]).default("DESC"),
        page: z.number().int().min(1).default(1),
        per_page: z.number().int().min(1).max(10000).default(10000),
        limit: z.number().int().min(1).max(10000).optional(), // alias para per_page
      }),
    },
    responses: {
      "200": {
        description: "Lista de lojas",
        ...contentJson({
          success: Boolean,
          result: z.array(LojaModel.serializerObject),
        }),
      },
    },
  };

  public async handle(...[c]: HandleArgs) {
    const db = c.env.DB;
    const data = await this.getValidatedData<typeof this.schema>();
    let { search, order_by, order, page, per_page, limit } = data.query;

    // Tratar alias limit -> per_page e aplicar cap
    if (typeof limit === "number") {
      per_page = limit;
    }
    if (per_page > 10000) per_page = 10000;

    const offset = (page - 1) * per_page;

    // Montar cláusulas de filtro e ordenação seguras (order_by e order já validados pelo zod)
    let whereClause = "";
    const params: any[] = [];
    if (search && search.trim() !== "") {
      whereClause = "WHERE banco LIKE ? OR loja LIKE ?";
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    const sql = `SELECT * FROM ${LojaModel.tableName} ${whereClause} ORDER BY ${order_by} ${order} LIMIT ? OFFSET ?`;
    params.push(per_page, offset);

    const rs = await db.prepare(sql).bind(...params).all();
    const rows = rs?.results || [];

    return c.json({ success: true, result: rows }, 200);
  }
}
import { OpenAPIRoute, contentJson } from "chanfana";
import { HandleArgs } from "../../types";
import { LojaModel } from "./base";

export class LojaSeed extends OpenAPIRoute {
  public schema = {
    tags: ["Lojas"],
    summary: "Seed sample lojas for visualization",
    operationId: "loja-seed",
    responses: {
      "200": {
        description: "Seed completed",
        ...contentJson({ success: Boolean, inserted: Number }),
      },
    },
  };

  public async handle(...[c]: HandleArgs) {
    const db = c.env.DB;

    // Optional query parameter: count
    const q = c.req.query();
    const countParam = q?.count ? Number(q.count) : undefined;

    let dataset: Array<{
      banco: string; idloja: number; loja: string; backup: string; replicar: string;
      reglocal: number; regservidor: number; regintegracao: number;
      ultimoerrorelicar: string; ultimoerrointegracao: string;
    }> = [];

    if (countParam && countParam > 0) {
      const N = Math.min(countParam, 10000); // safety cap
      for (let i = 1; i <= N; i++) {
        const erroReplicar = i % 5 === 0 ? "Falha intermitente" : "";
        const erroIntegracao = i % 7 === 0 ? "Erro de API" : "";
        const hasErro = erroReplicar !== "" || erroIntegracao !== "";
        const reglocal = hasErro ? (i % 9) : 0;
        const regservidor = hasErro ? (i % 4) : 0;
        const regintegracao = hasErro ? (i % 6) : 0;
        const hour = (8 + (i % 10)).toString().padStart(2, "0");
        const minute = (i % 60).toString().padStart(2, "0");
        dataset.push({
          banco: `BancoSeed${i.toString().padStart(3, "0")}`,
          idloja: i,
          loja: `Loja Seed ${i}`,
          backup: "2025-10-25",
          replicar: `2025-10-21 ${hour}:${minute}:00`,
          reglocal,
          regservidor,
          regintegracao,
          ultimoerrorelicar: erroReplicar,
          ultimoerrointegracao: erroIntegracao,
        });
      }
    } else {
      dataset = [
        { banco: "BancoA", idloja: 1, loja: "Loja A", backup: "2025-10-21", replicar: "2025-10-21 10:00:00", reglocal: 5, regservidor: 0, regintegracao: 0, ultimoerrorelicar: "Falha de conexão", ultimoerrointegracao: "" },
        { banco: "BancoB", idloja: 2, loja: "Loja B", backup: "2025-10-22", replicar: "2025-10-21 11:00:00", reglocal: 0, regservidor: 3, regintegracao: 0, ultimoerrorelicar: "", ultimoerrointegracao: "Erro ao enviar" },
        { banco: "BancoC", idloja: 3, loja: "Loja C", backup: "2025-10-23", replicar: "2025-10-21 12:00:00", reglocal: 0, regservidor: 0, regintegracao: 0, ultimoerrorelicar: "", ultimoerrointegracao: "" },
        { banco: "BancoD", idloja: 4, loja: "Loja D", backup: "2025-10-24", replicar: "2025-10-21 13:00:00", reglocal: 7, regservidor: 2, regintegracao: 4, ultimoerrorelicar: "Timeout", ultimoerrointegracao: "Payload inválido" },
        { banco: "BancoE", idloja: 5, loja: "Loja E", backup: "2025-10-25", replicar: "2025-10-21 14:00:00", reglocal: 0, regservidor: 1, regintegracao: 0, ultimoerrorelicar: "", ultimoerrointegracao: "Erro 500" },
        { banco: "BancoF", idloja: 6, loja: "Loja F", backup: "2025-10-25", replicar: "2025-10-21 15:00:00", reglocal: 10, regservidor: 0, regintegracao: 2, ultimoerrorelicar: "Falha no disco", ultimoerrointegracao: "" },
        { banco: "BancoG", idloja: 7, loja: "Loja G", backup: "2025-10-26", replicar: "2025-10-21 16:00:00", reglocal: 0, regservidor: 0, regintegracao: 1, ultimoerrorelicar: "", ultimoerrointegracao: "Token expirado" },
        { banco: "BancoH", idloja: 8, loja: "Loja H", backup: "2025-10-27", replicar: "2025-10-21 17:00:00", reglocal: 0, regservidor: 0, regintegracao: 0, ultimoerrorelicar: "", ultimoerrointegracao: "" }
      ];
    }

    let inserted = 0;
    for (const s of dataset) {
      // Upsert by banco + idloja using SQLite ON CONFLICT
      const fields = [
        "banco","idloja","backup","loja","ultimoerrorelicar","ultimoerrointegracao","qdtregistrosreplicar","replicar","reglocal","regservidor","versaosinc","tempogastoreplicar","regintegracao","versaol","versaopro","versaoomnni","versaolite","versaoparelelo","versaodunamis","versaointegracao","versaoatualizador","versaotemp","ipvpn","integracao"
      ];
      const values: any[] = [
        s.banco, s.idloja, s.backup, s.loja, s.ultimoerrorelicar, s.ultimoerrointegracao, null, s.replicar, s.reglocal, s.regservidor, null, null, s.regintegracao, null, null, null, null, null, null, null, null, null, null, 1
      ];
      const placeholders = fields.map(() => "?").join(", ");
      const updateSet = fields.filter(f => f !== "banco" && f !== "idloja").map(f => `${f} = excluded.${f}`).join(", ");

      await db.prepare(
        `INSERT INTO ${LojaModel.tableName} (${fields.join(", ")}) VALUES (${placeholders})
         ON CONFLICT(banco, idloja) DO UPDATE SET ${updateSet}`
      ).bind(...values).run();
      inserted++;
    }

    return c.json({ success: true, inserted }, 200);
  }
}
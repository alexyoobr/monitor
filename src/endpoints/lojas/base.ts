import { z } from "zod";

// Schema para validação de entrada (sem o campo 'id' pois é autoincremental)
export const lojaInput = z.object({
  idloja: z.number().int(),
  banco: z.string(),
  backup: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // Alterado de BACKUP para backup e de z.string().optional() para formato de data
  loja: z.string().optional(),
  ultimoerrorelicar: z.string().optional(),
  ultimoerrointegracao: z.string().optional(),
  qdtregistrosreplicar: z.number().int().optional(),
  replicar: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/).optional(),
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
});

// Schema completo para serialização (incluindo o campo 'id')
export const loja = lojaInput.extend({
  id: z.number().int().optional(),
});

export const LojaModel = {
  tableName: "lojas",
  primaryKeys: ["banco", "idloja"], // Chave primária composta
  schema: loja,
  serializer: (obj: any) => {
    // Handle optional fields properly
    const result: any = { ...obj };
    
    // Não converter o campo replicar, manter o formato original
    
    // Convert numeric fields that might come as strings
    if (obj.qdtregistrosreplicar !== undefined && obj.qdtregistrosreplicar !== null) {
      result.qdtregistrosreplicar = Number(obj.qdtregistrosreplicar);
    }
    if (obj.reglocal !== undefined && obj.reglocal !== null) {
      result.reglocal = Number(obj.reglocal);
    }
    if (obj.regservidor !== undefined && obj.regservidor !== null) {
      result.regservidor = Number(obj.regservidor);
    }
    if (obj.tempogastoreplicar !== undefined && obj.tempogastoreplicar !== null) {
      result.tempogastoreplicar = Number(obj.tempogastoreplicar);
    }
    if (obj.regintegracao !== undefined && obj.regintegracao !== null) {
      result.regintegracao = Number(obj.regintegracao);
    }
    if (obj.integracao !== undefined && obj.integracao !== null) {
      result.integracao = Number(obj.integracao);
    }
    
    return result;
  },
  serializerObject: loja,
};
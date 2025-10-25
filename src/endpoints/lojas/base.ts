import { z } from "zod";

// Schema para validação de entrada (sem o campo 'id' pois é autoincremental)
export const lojaInput = z.object({
  idloja: z.number().int(),
  status: z.number().int().optional(),
  banco: z.string(),
  login: z.string().optional(),
  versao: z.string().optional(),
  instalado: z.string().optional(),
  backup: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
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
  atualizacao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
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
  vencimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
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
    const numericIntFields = [
      'qdtregistrosreplicar', 'reglocal', 'regservidor', 'tempogastoreplicar', 
      'regintegracao', 'integracao', 'status', 'idcidade', 'iduf', 'modelo', 
      'serie', 'nf', 'pedido', 'ordem', 'romaneio', 'emailssl', 'emailtls', 
      'emailreqconfirmation', 'cstdevolucao', 'orientacao', 'michel', 
      'michelloja', 'monitor'
    ];
    
    const numericDecimalFields = [
      'icmscredito', 'federal', 'estadual', 'aliquotaicmsreducao', 
      'aliquotapis', 'aliquotacofins', 'aliquotaipi', 'serasa', 'mensalidade'
    ];
    
    numericIntFields.forEach(field => {
      if (obj[field] !== undefined && obj[field] !== null) {
        result[field] = Number(obj[field]);
      }
    });
    
    numericDecimalFields.forEach(field => {
      if (obj[field] !== undefined && obj[field] !== null) {
        result[field] = Number(obj[field]);
      }
    });
    
    return result;
  },
  serializerObject: loja,
};
import { D1UpdateEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { LojaModel } from "./base";

export class LojaUpdate extends D1UpdateEndpoint<HandleArgs> {
  _meta = {
    model: LojaModel,
    fields: LojaModel.schema.pick({
      // Excluir banco e idloja dos campos atualizáveis pois são parte da chave primária
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
  };
}
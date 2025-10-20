import { D1CreateEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { LojaModel, lojaInput } from "./base";

export class LojaCreate extends D1CreateEndpoint<HandleArgs> {
  _meta = {
    model: LojaModel,
    fields: lojaInput.pick({
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
  };
}
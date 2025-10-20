import { D1DeleteEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { LojaModel } from "./base";

export class LojaDelete extends D1DeleteEndpoint<HandleArgs> {
  _meta = {
    model: LojaModel,
  };
}
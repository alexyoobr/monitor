import { D1ReadEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { LojaModel } from "./base";

export class LojaRead extends D1ReadEndpoint<HandleArgs> {
  _meta = {
    model: LojaModel,
  };
}

import { D1ListEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { LojaModel } from "./base";

export class LojaList extends D1ListEndpoint<HandleArgs> {
  _meta = {
    model: LojaModel,
  };

  searchFields = ["banco", "loja"];
  defaultOrderBy = "idloja DESC";
}
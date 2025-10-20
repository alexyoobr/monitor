import { Hono } from "hono";
import { fromHono } from "chanfana";
import { LojaList } from "./lojaList";
import { LojaCreate } from "./lojaCreate";
import { LojaRead } from "./lojaRead";
import { LojaUpdate } from "./lojaUpdate";
import { LojaDelete } from "./lojaDelete";

export const lojasRouter = fromHono(new Hono());

lojasRouter.get("/", LojaList);
lojasRouter.post("/", LojaCreate);
lojasRouter.get("/:banco/:idloja", LojaRead);
lojasRouter.put("/:banco/:idloja", LojaUpdate);
lojasRouter.delete("/:banco/:idloja", LojaDelete);
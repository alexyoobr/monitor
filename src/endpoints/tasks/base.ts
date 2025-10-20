import { z } from "zod";

export const task = z.object({
  id: z.number().int(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  completed: z.boolean(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/), // Alterado para aceitar formato "YYYY-MM-DD HH:MM:SS"
});

export const TaskModel = {
  tableName: "tasks",
  primaryKeys: ["id"],
  schema: task,
  serializer: (obj: Record<string, string | number | boolean>) => {
    // Não converter o campo due_date, manter o formato original
    const result: any = { ...obj };
    
    return {
      ...result,
      completed: Boolean(obj.completed),
    };
  },
  serializerObject: task,
};
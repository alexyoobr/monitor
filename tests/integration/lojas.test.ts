import { SELF } from "cloudflare:test";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Helper function to create a loja and return its id and banco
async function createLoja(lojaData: any) {
  const response = await SELF.fetch(`http://local.test/lojas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lojaData),
  });
  const body = await response.json<{
    success: boolean;
    result: { id: number; banco: string; idloja: number };
  }>();
  return { id: body.result.id, banco: body.result.banco, idloja: body.result.idloja };
}

describe("Loja API Integration Tests", () => {
  beforeEach(async () => {
    // This is a good place to clear any test data if your test runner doesn't do it automatically.
    // Since the prompt mentions rows are deleted after each test, we can rely on that.
    vi.clearAllMocks();
  });

  // Tests for GET /lojas
  describe("GET /lojas", () => {
    it("should get an empty list of lojas", async () => {
      const response = await SELF.fetch(`http://local.test/lojas`);
      const body = await response.json<{ success: boolean; result: any[] }>();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.result).toEqual([]);
    });

    it("should get a list with one loja", async () => {
      await createLoja({
        banco: "Test Banco",
        idloja: 1,
        loja: "Test Loja",
        replicar: 1,
        integracao: 1,
      });

      const response = await SELF.fetch(`http://local.test/lojas`);
      const body = await response.json<{ success: boolean; result: any[] }>();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.result.length).toBeGreaterThanOrEqual(1);
    });
  });

  // Tests for POST /lojas
  describe("POST /lojas", () => {
    it("should create a new loja successfully", async () => {
      const lojaData = {
        banco: "New Banco",
        idloja: 1,
        BACKUP: "Backup Info",
        loja: "New Loja",
        ultimoerrorelicar: "No errors",
        ultimoerrointegracao: "No errors",
        qdtregistrosreplicar: 100,
        replicar: 1,
        reglocal: 50,
        regservidor: 50,
        versaosinc: "1.0.0",
        tempogastoreplicar: 30,
        regintegracao: 20,
        versaol: "2.0.0",
        versaopro: "3.0.0",
        versaoomnni: "4.0.0",
        versaolite: "5.0.0",
        versaoparelelo: "6.0.0",
        versaodunamis: "7.0.0",
        versaointegracao: "8.0.0",
        versaoatualizador: "9.0.0",
        versaotemp: "10.0.0",
        ipvpn: "192.168.1.1",
        integracao: 1,
      };
      const response = await SELF.fetch(`http://local.test/lojas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lojaData),
      });

      const body = await response.json<{ success: boolean; result: any }>();

      expect(response.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.result).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          banco: "New Banco",
          idloja: 1,
        }),
      );
    });

    it("should create a new loja with minimal data", async () => {
      const lojaData = {
        banco: "Minimal Banco",
        idloja: 1,
        loja: "Minimal Loja",
        replicar: 1,
        integracao: 1,
      };
      const response = await SELF.fetch(`http://local.test/lojas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lojaData),
      });

      const body = await response.json<{ success: boolean; result: any }>();

      expect(response.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.result).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          banco: "Minimal Banco",
          idloja: 1,
          loja: "Minimal Loja",
        }),
      );
    });
  });

  // Tests for GET /lojas/{banco}/{idloja}
  describe("GET /lojas/{banco}/{idloja}", () => {
    it("should get a single loja by its banco and idloja", async () => {
      const lojaData = {
        banco: "Specific Banco",
        idloja: 1,
        loja: "Specific Loja",
        replicar: 1,
        integracao: 1,
      };
      const { banco, idloja } = await createLoja(lojaData);

      const response = await SELF.fetch(`http://local.test/lojas/${banco}/${idloja}`);
      const body = await response.json<{ success: boolean; result: any }>();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.result).toEqual(
        expect.objectContaining({
          banco: "Specific Banco",
          idloja: 1,
          loja: "Specific Loja",
        }),
      );
    });

    it("should return a 404 error if loja is not found", async () => {
      const response = await SELF.fetch(
        `http://local.test/lojas/NonExistentBanco/9999`,
      );
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.success).toBe(false);
      expect(body.errors[0].message).toBe("Not Found");
    });
  });

  // Tests for PUT /lojas/{banco}/{idloja}
  describe("PUT /lojas/{banco}/{idloja}", () => {
    it("should update a loja successfully", async () => {
      const lojaData = {
        banco: "Loja to Update",
        idloja: 1,
        loja: "Loja to Update",
        replicar: 1,
        integracao: 1,
      };
      const { banco, idloja } = await createLoja(lojaData);

      const updatedData = {
        loja: "Updated Loja",
        replicar: 0,
        integracao: 0,
      };

      const response = await SELF.fetch(`http://local.test/lojas/${banco}/${idloja}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const body = await response.json<{ success: boolean; result: any }>();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.result).toEqual(
        expect.objectContaining({
          banco: "Loja to Update",
          idloja: 1,
          loja: "Updated Loja",
        }),
      );
    });
  });

  // Tests for DELETE /lojas/{banco}/{idloja}
  describe("DELETE /lojas/{banco}/{idloja}", () => {
    it("should delete a loja successfully", async () => {
      const lojaData = {
        banco: "Loja to Delete",
        idloja: 1,
        loja: "Loja to Delete",
        replicar: 1,
        integracao: 1,
      };
      const { banco, idloja } = await createLoja(lojaData);

      const deleteResponse = await SELF.fetch(
        `http://local.test/lojas/${banco}/${idloja}`,
        {
          method: "DELETE",
        },
      );
      const deleteBody = await deleteResponse.json<{
        success: boolean;
        result: any;
      }>();

      expect(deleteResponse.status).toBe(200);
      expect(deleteBody.success).toBe(true);
      expect(deleteBody.result.banco).toBe(banco);
      expect(deleteBody.result.idloja).toBe(idloja);

      // Verify the loja is actually deleted
      const getResponse = await SELF.fetch(`http://local.test/lojas/${banco}/${idloja}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
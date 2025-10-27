import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import { tasksRouter } from "./endpoints/tasks/router";
import { lojasRouter } from "./endpoints/lojas/router";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { DummyEndpoint } from "./endpoints/dummyEndpoint";
import { jwt, sign, verify } from "hono/jwt";

// JWT Secret - In production, this should be in environment variables
const JWT_SECRET = "your-super-secret-jwt-key-change-in-production";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Authentication middleware
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Token de acesso requerido' }, 401);
  }

  const token = authHeader.substring(7);
  
  try {
    const payload = await verify(token, JWT_SECRET);
    c.set('user', payload);
    await next();
  } catch (error) {
    return c.json({ success: false, message: 'Token inválido' }, 401);
  }
};

// Check if user is authenticated (for protected routes)
const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  const cookieToken = c.req.header('Cookie')?.match(/authToken=([^;]+)/)?.[1];
  
  const token = authHeader?.substring(7) || cookieToken;
  
  if (!token) {
    // Se for uma requisição AJAX/fetch, retornar JSON ao invés de redirecionar
    const acceptHeader = c.req.header('Accept');
    if (acceptHeader && acceptHeader.includes('application/json')) {
      return c.json({ success: false, message: 'Token de acesso requerido' }, 401);
    }
    
    // Para requisições de navegação normal, servir a página mas com JavaScript que verifica autenticação
    const url = new URL(c.req.url);
    if (url.pathname === '/admin' || url.pathname === '/admin/cadastro') {
      await next();
      return;
    }
    
    return c.redirect('/login');
  }

  try {
    await verify(token, JWT_SECRET);
    await next();
  } catch (error) {
    // Se for uma requisição AJAX/fetch, retornar JSON ao invés de redirecionar
    const acceptHeader = c.req.header('Accept');
    if (acceptHeader && acceptHeader.includes('application/json')) {
      return c.json({ success: false, message: 'Token inválido' }, 401);
    }
    
    // Para requisições de navegação normal, servir a página mas com JavaScript que verifica autenticação
    const url = new URL(c.req.url);
    if (url.pathname === '/admin' || url.pathname === '/admin/cadastro') {
      await next();
      return;
    }
    
    return c.redirect('/login');
  }
};

app.onError((err, c) => {
  if (err instanceof ApiException) {
    // If it's a Chanfana ApiException, let Chanfana handle the response
    return c.json(
      { success: false, errors: err.buildResponse() },
      err.status as ContentfulStatusCode,
    );
  }

  console.error("Global error handler caught:", err); // Log the error if it's not known

  // For other errors, return a generic 500 response
  return c.json(
    {
      success: false,
      errors: [{ code: 7000, message: "Internal Server Error" }],
    },
    500,
  );
});

// Servir o dashboard
app.get("/dashboard", async (c) => {
  const asset = await c.env.ASSETS.get("dashboard.html");
  if (asset) {
    return new Response(asset, {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  }
  return c.html("<h1>Dashboard não encontrado</h1>");
});

// Servir a página de login
app.get("/login", async (c) => {
  const asset = await c.env.ASSETS.get("login.html");
  if (asset) {
    return new Response(asset, {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  }
  return c.html("<h1>Página de login não encontrada</h1>");
});

// Endpoint para autenticação tradicional (email/password)
app.post("/auth/login", async (c) => {
  const { email, password } = await c.req.json();
  
  // Validação simples - em produção, verificar contra banco de dados
  if (email === "admin@example.com" && password === "admin123") {
    const payload = {
      email: email,
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 horas
    };
    
    const token = await sign(payload, JWT_SECRET);
    
    return c.json({
      success: true,
      token: token,
      user: { email: email, role: "admin" }
    });
  }
  
  return c.json({ success: false, message: "Credenciais inválidas" }, 401);
});

// Endpoint para logout
app.post("/auth/logout", (c) => {
  return c.json({ success: true, message: "Logout realizado com sucesso" });
});

// Endpoint para verificar se o usuário está autenticado
app.get("/auth/me", (c) => {
  return c.json({ success: true, user: { authenticated: true } });
});

// Servir a página de admin
app.get("/admin", async (c) => {
  try {
    // Tentar usar o método fetch para acessar o arquivo diretamente
    const response = await fetch(new URL("../public/admin.html", import.meta.url));
    if (response.ok) {
      const content = await response.text();
      return c.html(content);
    }
  } catch (error) {
    console.error("Erro ao carregar admin.html:", error);
  }
  return c.html("<h1>Página de admin não encontrada</h1>");
});

// Servir a página de cadastro de loja
app.get("/admin/cadastro", async (c) => {
  try {
    // Tentar usar o método fetch para acessar o arquivo diretamente
    const response = await fetch(new URL("../public/admin-cadastro.html", import.meta.url));
    if (response.ok) {
      const content = await response.text();
      return new Response(content, {
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      });
    }
  } catch (fetchError) {
    console.log("Erro ao usar fetch, tentando ASSETS:", fetchError.message);
  }

  try {
    // Fallback para ASSETS se fetch não funcionar
    const asset = await c.env.ASSETS.get("admin-cadastro.html");
    if (asset) {
      const content = await asset.text();
      return new Response(content, {
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      });
    }
  } catch (assetsError) {
    console.error("Erro ao usar ASSETS:", assetsError.message);
  }

  // Se nenhum método funcionar, servir conteúdo inline básico
   const basicHTML = `
 <!DOCTYPE html>
 <html lang="pt-BR">
 <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Cadastro de Loja - Admin</title>
     <style>
         body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
         .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
         h1 { color: #333; text-align: center; margin-bottom: 30px; }
         .form-group { margin-bottom: 20px; }
         .form-row { display: flex; gap: 15px; align-items: flex-end; margin-bottom: 20px; }
         .form-group.flex-1 { flex: 1; margin-bottom: 0; }
         .form-row .form-group { margin-bottom: 0; }
         label { display: block; margin-bottom: 8px; font-weight: bold; color: #555; }
         input, select, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; font-size: 14px; }
         input:focus, select:focus, textarea:focus { outline: none; border-color: #007bff; box-shadow: 0 0 0 2px rgba(0,123,255,0.25); }
         button { background-color: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; }
         button:hover { background-color: #0056b3; transform: translateY(-1px); }
         button.secondary { background-color: #6c757d; }
         button.secondary:hover { background-color: #545b62; }
         button.search { background-color: #28a745; padding: 10px 16px; white-space: nowrap; }
         button.search:hover { background-color: #218838; }
         .button-group { display: flex; gap: 10px; margin-top: 30px; align-items: center; }
         .alert { padding: 12px; margin: 15px 0; border-radius: 4px; font-size: 14px; }
         .alert.success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
         .alert.error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
         .alert.info { background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
         .loading { opacity: 0.6; pointer-events: none; }
         @media (max-width: 600px) {
             .form-row { flex-direction: column; gap: 10px; }
             .button-group { flex-direction: column; }
         }
     </style>
 </head>
 <body>
     <div class="container">
         <h1 id="pageHeader">📝 Cadastro de Loja</h1>
         <div id="alertContainer"></div>
         
         <form id="lojaForm">
             <div class="form-row">
                 <div class="form-group flex-1">
                     <label for="cnpj">CNPJ</label>
                     <input type="text" id="cnpj" name="cnpj" placeholder="00.000.000/0000-00" maxlength="18">
                 </div>
                 <div>
                     <button type="button" id="pesquisarCnpj" class="search">🔍 Pesquisar CNPJ</button>
                 </div>
             </div>
             
             <div class="form-group">
                 <label for="banco">Banco *</label>
                 <input type="text" id="banco" name="banco" required>
             </div>
             
             <div class="form-group">
                 <label for="idloja">ID da Loja *</label>
                 <input type="number" id="idloja" name="idloja" required>
             </div>
             
             <div class="form-group">
                 <label for="loja">Nome da Loja *</label>
                 <input type="text" id="loja" name="loja" required>
             </div>
             
             <div class="form-group">
                 <label for="fantasia">Nome Fantasia</label>
                 <input type="text" id="fantasia" name="fantasia">
             </div>
             
             <div class="form-group">
                 <label for="nome">Razão Social</label>
                 <input type="text" id="nome" name="nome">
             </div>
             
             <div class="form-group">
                 <label for="status">Status</label>
                 <select id="status" name="status">
                     <option value="">Selecione...</option>
                     <option value="1">Ativo</option>
                     <option value="0">Inativo</option>
                 </select>
             </div>
             
             <div class="button-group">
                 <button type="submit" id="submitBtn">Cadastrar Loja</button>
                 <button type="button" class="secondary" onclick="window.location.href='/admin'">Voltar</button>
             </div>
         </form>
     </div>
 
     <script>
         let isEditMode = false;
         let editBanco = '';
         let editIdLoja = 0;
 
         // Detectar parâmetros da URL
         document.addEventListener('DOMContentLoaded', function() {
             const urlParams = new URLSearchParams(window.location.search);
             const banco = urlParams.get('banco');
             const idloja = urlParams.get('idloja');
             const edit = urlParams.get('edit');
 
             if (edit === 'true' && banco && idloja) {
                 isEditMode = true;
                 editBanco = banco;
                 editIdLoja = parseInt(idloja);
                 
                 document.getElementById('pageHeader').textContent = '✏️ Editar Loja';
                 document.getElementById('submitBtn').textContent = 'Atualizar Loja';
                 
                 carregarDadosLoja(banco, idloja);
             }
             
             // Configurar máscara do CNPJ
             configurarMascaraCnpj();
             
             // Configurar pesquisa de CNPJ
             document.getElementById('pesquisarCnpj').addEventListener('click', pesquisarCnpj);
         });
 
         // Configurar máscara de CNPJ
         function configurarMascaraCnpj() {
             const cnpjInput = document.getElementById('cnpj');
             cnpjInput.addEventListener('input', function(e) {
                 let value = e.target.value.replace(/\\D/g, '');
                 value = value.replace(/(\\d{2})(\\d)/, '$1.$2');
                 value = value.replace(/(\\d{3})(\\d)/, '$1.$2');
                 value = value.replace(/(\\d{3})(\\d)/, '$1/$2');
                 value = value.replace(/(\\d{4})(\\d)/, '$1-$2');
                 e.target.value = value;
             });
         }
 
         // Validar CNPJ
         function validarCnpj(cnpj) {
             cnpj = cnpj.replace(/[^\\d]+/g, '');
             
             if (cnpj.length !== 14) return false;
             
             // Eliminar CNPJs inválidos conhecidos
             if (/^(\\d)\\1{13}$/.test(cnpj)) return false;
             
             // Validar dígitos verificadores
             let tamanho = cnpj.length - 2;
             let numeros = cnpj.substring(0, tamanho);
             let digitos = cnpj.substring(tamanho);
             let soma = 0;
             let pos = tamanho - 7;
             
             for (let i = tamanho; i >= 1; i--) {
                 soma += numeros.charAt(tamanho - i) * pos--;
                 if (pos < 2) pos = 9;
             }
             
             let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
             if (resultado != digitos.charAt(0)) return false;
             
             tamanho = tamanho + 1;
             numeros = cnpj.substring(0, tamanho);
             soma = 0;
             pos = tamanho - 7;
             
             for (let i = tamanho; i >= 1; i--) {
                 soma += numeros.charAt(tamanho - i) * pos--;
                 if (pos < 2) pos = 9;
             }
             
             resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
             if (resultado != digitos.charAt(1)) return false;
             
             return true;
         }
 
         // Pesquisar CNPJ na API CNPJA
          async function pesquisarCnpj() {
              const cnpjInput = document.getElementById('cnpj');
              const cnpj = cnpjInput.value.replace(/[^\\d]+/g, '');
              
              if (!cnpj) {
                  mostrarAlerta('Por favor, digite um CNPJ para pesquisar.', 'error');
                  return;
              }
              
              if (!validarCnpj(cnpj)) {
                  mostrarAlerta('CNPJ inválido. Verifique os dígitos digitados.', 'error');
                  return;
              }
              
              try {
                  mostrarAlerta('Pesquisando CNPJ na base de dados...', 'info');
                  document.getElementById('pesquisarCnpj').disabled = true;
                  document.getElementById('pesquisarCnpj').textContent = '⏳ Pesquisando...';
                  
                  // Usar API CNPJA
                  const response = await fetch(\`https://api.cnpja.com/office/\${cnpj}\`, {
                      method: 'GET',
                      headers: {
                          'Accept': 'application/json',
                          'Authorization': '77cf4c2a-7d22-425e-bde1-a2ddfd2583e6-cf0e76fe-a8fe-40e6-9ee5-51696711f468'
                      }
                  });
                  
                  if (!response.ok) {
                      throw new Error(\`Erro na consulta: \${response.status} - \${response.statusText}\`);
                  }
                  
                  const data = await response.json();
                  
                  if (data.code && data.code !== 200) {
                      throw new Error(data.message || 'CNPJ não encontrado');
                  }
                  
                  // Preencher campos com dados da API CNPJA
                  if (data.company && data.company.name) {
                      document.getElementById('nome').value = data.company.name;
                  }
                  
                  if (data.alias) {
                      document.getElementById('fantasia').value = data.alias;
                      // Se o campo loja estiver vazio, usar o nome fantasia
                      if (!document.getElementById('loja').value) {
                          document.getElementById('loja').value = data.alias;
                      }
                  } else if (data.company && data.company.name && !document.getElementById('loja').value) {
                      // Se não houver nome fantasia, usar a razão social
                      document.getElementById('loja').value = data.company.name;
                  }
                  
                  mostrarAlerta('Dados do CNPJ carregados com sucesso!', 'success');
                  
              } catch (error) {
                  console.error('Erro ao pesquisar CNPJ:', error);
                  mostrarAlerta('Erro ao pesquisar CNPJ: ' + error.message, 'error');
              } finally {
                  document.getElementById('pesquisarCnpj').disabled = false;
                  document.getElementById('pesquisarCnpj').textContent = '🔍 Pesquisar CNPJ';
              }
          }
 
         // Carregar dados da loja para edição
         async function carregarDadosLoja(banco, idloja) {
             try {
                 const response = await fetch(\`/lojas/\${encodeURIComponent(banco)}/\${idloja}\`);
                 const result = await response.json();
                 
                 if (response.ok && result.success) {
                     preencherFormulario(result.result);
                     mostrarAlerta('Dados da loja carregados para edição.', 'success');
                 } else {
                     throw new Error(result.errors?.[0]?.message || 'Erro ao carregar dados da loja');
                 }
             } catch (error) {
                 console.error('Erro ao carregar loja:', error);
                 mostrarAlerta('Erro ao carregar dados da loja: ' + error.message, 'error');
             }
         }
 
         // Preencher formulário
         function preencherFormulario(loja) {
             const campos = {
                 'banco': 'banco',
                 'idloja': 'idloja',
                 'loja': 'loja',
                 'nomefantasia': 'fantasia',
                 'razaosocial': 'nome',
                 'cnpj': 'cnpj',
                 'status': 'status'
             };
 
             for (const [campoApi, idElemento] of Object.entries(campos)) {
                 const elemento = document.getElementById(idElemento);
                 if (elemento && loja[campoApi] !== null && loja[campoApi] !== undefined) {
                     elemento.value = loja[campoApi];
                 }
             }
 
             if (isEditMode) {
                 document.getElementById('banco').disabled = true;
                 document.getElementById('idloja').disabled = true;
             }
         }
 
         // Submissão do formulário
         document.getElementById('lojaForm').addEventListener('submit', async function(e) {
             e.preventDefault();
             
             const formData = new FormData(this);
             const data = Object.fromEntries(formData.entries());
             
             // Converter campos numéricos
             if (data.idloja) {
                 const parsedIdLoja = parseInt(data.idloja, 10);
                 if (!isNaN(parsedIdLoja)) {
                     data.idloja = parsedIdLoja;
                 } else {
                     delete data.idloja; // Remove se não for um número válido
                 }
             }
             if (data.status) {
                 const parsedStatus = parseInt(data.status, 10);
                 if (!isNaN(parsedStatus)) {
                     data.status = parsedStatus;
                 } else {
                     delete data.status; // Remove se não for um número válido
                 }
             }
             
             // Remover campos vazios para evitar problemas de validação
             Object.keys(data).forEach(key => {
                 if (data[key] === '' || data[key] === null || data[key] === undefined) {
                     delete data[key];
                 }
             });
             
             // Validar CNPJ se preenchido
             if (data.cnpj && !validarCnpj(data.cnpj)) {
                 mostrarAlerta('CNPJ inválido. Verifique os dígitos digitados.', 'error');
                 return;
             }
             
             try {
                 let url, method;
                 if (isEditMode) {
                     url = \`/lojas/\${encodeURIComponent(editBanco)}/\${editIdLoja}\`;
                     method = 'PUT';
                 } else {
                     url = '/lojas';
                     method = 'POST';
                 }
                 
                 const response = await fetch(url, {
                     method: method,
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify(data)
                 });
                 
                 const result = await response.json();
                 
                 if (response.ok && result.success) {
                     mostrarAlerta(isEditMode ? 'Loja atualizada com sucesso!' : 'Loja cadastrada com sucesso!', 'success');
                     if (!isEditMode) {
                         this.reset();
                     }
                 } else {
                     throw new Error(result.errors?.[0]?.message || 'Erro ao salvar loja');
                 }
             } catch (error) {
                 console.error('Erro:', error);
                 mostrarAlerta('Erro ao salvar loja: ' + error.message, 'error');
             }
         });
 
         // Mostrar alertas
         function mostrarAlerta(mensagem, tipo) {
             const container = document.getElementById('alertContainer');
             container.innerHTML = \`<div class="alert \${tipo}">\${mensagem}</div>\`;
             setTimeout(() => container.innerHTML = '', 5000);
         }
     </script>
 </body>
 </html>`;

  return new Response(basicHTML, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
});

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/",
  schema: {
    info: {
      title: "My Awesome API",
      version: "2.0.0",
      description: "This is the documentation for my awesome API.",
    },
  },
});

// Register Tasks Sub router
openapi.route("/tasks", tasksRouter);

// Register Lojas Sub router
openapi.route("/lojas", lojasRouter);

// Register other endpoints
openapi.post("/dummy/:slug", DummyEndpoint);

// Export the Hono app
export default app;
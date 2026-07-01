  import express from "express";
  import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"; // Camada de transporte
  import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"; // Importa o MCP Server do SDK do Model Context Protocol. O MCP Server é a parte do servidor que vai lidar com as requisições do LLM, processar as chamadas de ferramentas e retornar os resultados. Ele é responsável por registrar as ferramentas disponíveis, validar os dados de entrada, executar as ferramentas e formatar as respostas para o LLM. O MCP Server é uma peça fundamental para permitir a comunicação entre o LLM e as ferramentas que ele pode usar para responder às perguntas dos usuários.
  import { listarImports } from "./tools/index.js"; // Pegas as tools para aproveitar o input_schema e a descrição de cada tool

  const app = express();
  app.use(express.json());

  // .
  app.post("/mcp", async (req, res) => {

    // Criação de um server do MCP Server
    const server = new McpServer({
      name: "northwind-mcp-server",
      version: "1.0.0"
    });


    const modulos = await listarImports();
    // registra tools passando por todas as tools do index.js, pegando a descrição e o input_schema de cada tool para registrar no MCP Server. O MCP Server vai usar essas informações para validar os dados de entrada e formatar as respostas para o LLM. O MCP Server também vai usar a função de execução de cada tool para processar as chamadas de ferramentas e retornar os resultados para o LLM.
    for (const tool of modulos) {

      server.registerTool( // registra cada tool no MCP Server, passando o nome da tool, a descrição e o input_schema para o MCP Server. O MCP Server vai usar essas informações para validar os dados de entrada e formatar as respostas para o LLM. O MCP Server também vai usar a função de execução de cada tool para processar as chamadas de ferramentas e retornar os resultados para o LLM.

        tool.name, // Pega o nome da tool

        {
          description: tool.description, // Pega a descrição da tool

          inputSchema: tool.input_schema // Pega o input_schema da tool, que é um objeto JSON Schema que define a estrutura dos dados de entrada esperados pela tool. O MCP Server vai usar esse input_schema para validar os dados de entrada enviados pelo LLM e garantir que eles estejam no formato correto antes de executar a tool.
        },

        async (args) => { // Função de execução da tool, que é chamada pelo MCP Server quando o LLM faz uma chamada de ferramenta. A função de execução recebe os dados de entrada validados pelo MCP Server e deve retornar um objeto com a resposta da tool formatada para o LLM. O MCP Server vai usar a função de execução para processar as chamadas de ferramentas e retornar os resultados para o LLM.

          const result = await tool.execute(args); // Executa a função de execução da tool, passando os dados de entrada validados pelo MCP Server. A função de execução deve retornar um objeto com a resposta da tool formatada para o LLM. O MCP Server vai usar a função de execução para processar as chamadas de ferramentas e retornar os resultados para o LLM.

          return {
            content: [ 
              {
                type: "text",
                text: JSON.stringify(result)
              } // Formata a resposta da tool para o LLM, retornando um objeto com um array de conteúdo. O conteúdo é um array de objetos que podem ser do tipo "text", "image", "table", etc. O MCP Server vai usar o tipo de conteúdo para formatar a resposta para o LLM. No caso, estamos retornando um conteúdo do tipo "text" com a resposta da tool convertida para uma string JSON. O LLM vai receber essa resposta e pode usá-la para responder às perguntas dos usuários ou para fazer chamadas de ferramentas adicionais.
            ]
          };

        }

      );

    }

    // Criação de um transporte HTTP para o MCP Server, que é responsável por lidar com as requisições HTTP recebidas pelo servidor Express e encaminhá-las para o MCP Server. O transporte HTTP é uma camada de comunicação que permite que o MCP Server se comunique com o LLM através de requisições HTTP. O transporte HTTP é configurado para usar um gerador de IDs de sessão, que pode ser usado para rastrear as sessões de comunicação entre o LLM e o MCP Server. No exemplo, estamos deixando o gerador de IDs de sessão como undefined, mas em uma implementação real, você pode querer implementar um gerador de IDs de sessão personalizado para rastrear as sessões de comunicação entre o LLM e o MCP Server.
    const transport =
      new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined // Falta implementar
      });


    await server.connect(transport); // Conecta o MCP Server ao transporte HTTP, permitindo que o MCP Server receba as requisições HTTP encaminhadas pelo transporte e processe as chamadas de ferramentas feitas pelo LLM. A conexão entre o MCP Server e o transporte HTTP é essencial para permitir a comunicação entre o LLM e as ferramentas registradas no MCP Server. O MCP Server vai usar o transporte HTTP para receber as requisições do LLM, processar as chamadas de ferramentas e retornar os resultados para o LLM.

    await transport.handleRequest(
      req,
      res,
      req.body
    ); // O transporte HTTP lida com a requisição HTTP recebida pelo servidor Express, encaminhando os dados de entrada para o MCP Server processar as chamadas de ferramentas e retornar os resultados para o LLM. O transporte HTTP é responsável por extrair os dados de entrada da requisição HTTP, encaminhá-los para o MCP Server e formatar a resposta do MCP Server para enviar de volta ao LLM. No exemplo, estamos passando o corpo da requisição HTTP como os dados de entrada para o MCP Server processar as chamadas de ferramentas e retornar os resultados para o LLM.

  });


  app.listen(3002, () => {
    console.log("MCP HTTP Server rodando");
  });
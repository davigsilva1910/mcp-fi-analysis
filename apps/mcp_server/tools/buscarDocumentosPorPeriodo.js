import "dotenv/config"
const BASE_URL = process.env.CAP_URL

import { z } from "zod";

import { getDocumentsByPeriod } from "../providers/capClient.js"
import {dataValidation} from "../services/dataValidation.js"

// Estrutura de uma tool: name, description, input_schema e execute. 
// O LLM vai usar o name para identificar a ferramenta, a description para entender quando usar a ferramenta, o input_schema para validar os dados de entrada enviados pelo LLM e a função execute para processar as chamadas de ferramentas feitas pelo LLM e retornar os resultados para o LLM. 
// O MCP Server vai usar essas informações para registrar a ferramenta e permitir que o LLM faça chamadas de ferramentas usando o nome da ferramenta e passando os dados de entrada no formato definido pelo input_schema. Quando o LLM fizer uma chamada de ferramenta, o MCP Server vai validar os dados de entrada usando o input_schema, executar a função execute da ferramenta com os dados de entrada validados e retornar os resultados formatados para o LLM.
export const buscarDocumentosPorPeriodo = {
    name: 'buscarDocumentosCriadosPorPeriodo',
    description: `Buscar documentos criados com base no ano informado pelo usuário, tendo como obrigatoriedade pelo menos o campo ano. 
        Campo ano é necessário para essa função. Pode ser personalizada com uso de informações como mês, dia e até filtros como orderby e top
        
        Se o retorno possuir:

        meta.exportRecommended = true

        não tente analisar todos os registros.
        Utilize a ferramenta generateFile
        passando meta.endpoint.
        `,

    // Usado para definir o esquema de entrada da função
    // Substitui o metadata
    input_schema: z.object({
        anoInicial: z.number().int().min(2000),

        anoFinal: z.number().int().min(2000).optional(),

        mesInicial: z.number().int().min(1).max(12).optional(),
        mesFinal: z.number().int().min(1).max(12).optional(),

        diaInicial: z.number().int().min(1).max(31).optional(),
        diaFinal: z.number().int().min(1).max(31).optional(),

        top: z.number().int().min(1).optional(),

        orderby: z.string().optional(),
    }),

    // Começo da execução da ação. Async pois espera resposta externa. Execute função que roda quando a tool é chamada. Args são dados enviados pelo LLM
    // Recebe args pois alguns parâmetros não são obrigatórios, nesse caso, não precisam ser passados e a função funciona sem eles
    async execute(args) {
        const { anoInicial, anoFinal, mesInicial, mesFinal, diaInicial, diaFinal, top, orderby } = args; // Passando argumentos que foram recebidos
        
        const parametros = await dataValidation(anoInicial, anoFinal, mesInicial, mesFinal, diaInicial, diaFinal)
        let url = `${BASE_URL}?$filter=postingDate ge '${parametros.dataInicio}' and postingDate le '${parametros.dataFim}'`

        // Verifica se o parâmetro top foi passado
        const topParam = args.top
        if (topParam) {
            url += `&$top=${topParam}`;
        }
        
        // Verifica se o parâmetro orderby foi passado
        const orderbyParam = args.orderby
        if (orderbyParam) {
            if (orderby === 'postingDate desc' ||
                orderby === 'postingDate asc' ||
                orderby === 'documentDate desc' ||
                orderby === 'documentDate asc') {
                url += `&$orderby=${orderbyParam}`;
            }
        }

        console.log(url)
        return await getDocumentsByPeriod(url);
    }
}
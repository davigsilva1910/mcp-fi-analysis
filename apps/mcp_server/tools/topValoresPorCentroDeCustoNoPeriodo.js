import "dotenv/config"
const BASE_URL = process.env.CAP_URL

import {z} from 'zod';
import {dataValidation} from '../services/dataValidation.js'

import {getTopTotalAmountOfCostCenterByPeriod} from '../providers/capClient.js'

export const topValoresPorCentroDeCustoNoPeriodo = {
    name: "topValoresPorCentroDeCustoNoPeriodo",
    description: "Retorna os documentos contábeis com maiores valores com base no centro de custo e período passados. Obrigatório passagem de um centro de custo, o valor do top para pegar os últimos documentos e pelo menos o ano.",

    input_schema: z.object({
        centroDeCustoID: z.string(),
        top: z.number().int().min(1),
        anoInicial: z.number().int().min(2000), 
        anoFinal: z.number().int().optional(),
        mesInicial: z.number().int().min(1).max(12).optional(),
        mesFinal: z.number().int().min(1).max(12).optional(),
        diaInicial: z.number().int().min(1).max(31).optional(),
        diaFinal: z.number().int().min(1).max(31).optional()
    }), 

    async execute(args) {
        const {centroDeCustoID, anoInicial, anoFinal, mesInicial, mesFinal, diaInicial, diaFinal} = args;

        const parametros = await dataValidation(anoInicial, anoFinal, mesInicial, mesFinal, diaInicial, diaFinal);
        const url = `${BASE_URL}?$filter=postingDate ge '${parametros.dataInicio}' and postingDate le '${parametros.dataFim}' and costCenter eq '${centroDeCustoID}'&$orderby=amountInDocumentCurrent desc&top=${10}`

        return await getTopTotalAmountOfCostCenterByPeriod(url);
    }
}


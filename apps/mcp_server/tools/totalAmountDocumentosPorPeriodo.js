import "dotenv/config"
const BASE_URL = process.env.CAP_URL

import {z} from 'zod';
import {dataValidation} from '../services/dataValidation.js'

import {getTotalAmountByPeriod} from '../providers/capClient.js'

export const totalAmountDocumentosPorPeriodo = {
    name: "totalAmountDocumentosPorPeriodo",
    description: "Retorna o total do amountInDocumentCurrent dos documentos contábeis valores com base no período passado. Obrigatório passagem pelo menos do anoInicial.",

    input_schema: z.object({
        anoInicial: z.number().int().min(2000), 
        anoFinal: z.number().int().optional(),
        mesInicial: z.number().int().min(1).max(12).optional(),
        mesFinal: z.number().int().min(1).max(12).optional(),
        diaInicial: z.number().int().min(1).max(31).optional(),
        diaFinal: z.number().int().min(1).max(31).optional()
    }), 

    async execute(args) {
        const {anoInicial, anoFinal, mesInicial, mesFinal, diaInicial, diaFinal} = args;

        const parametros = await dataValidation(anoInicial, anoFinal, mesInicial, mesFinal, diaInicial, diaFinal);
        const url = `${BASE_URL}?$apply=filter(postingDate ge '${parametros.dataInicio}' and postingDate le '${parametros.dataFim}')/aggregate(amountInDocumentCurrent with sum as Total)`

        return await getTotalAmountByPeriod(url);
    }
}


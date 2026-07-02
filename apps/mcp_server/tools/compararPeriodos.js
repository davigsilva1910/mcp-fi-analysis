import "dotenv/config"
const BASE_URL = process.env.CAP_URL

import {z} from 'zod'

import { dataValidation } from '../services/dataValidation.js';
import { periodComparison } from '../providers/capClient.js';

export const compararPeriodos = {
    name: 'compararPeriodos',
    description: 'Função usada para comparar documentos entre períodos. Necessário passar pelo menos o anoInicial1 e anoInicial2 como parâmetro',

    input_schema: z.object({
        anoInicial1: z.number().int().min(2000),

        anoFinal1: z.number().int().min(2000).optional(),

        mesInicial1: z.number().int().min(1).max(12).optional(),
        mesFinal1: z.number().int().min(1).max(12).optional(),

        diaInicial1: z.number().int().min(1).max(31).optional(),
        diaFinal1: z.number().int().min(1).max(31).optional(),
        
        anoInicial2: z.number().int().min(2000),

        anoFinal2: z.number().int().min(2000).optional(),

        mesInicial2: z.number().int().min(1).max(12).optional(),
        mesFinal2: z.number().int().min(1).max(12).optional(),

        diaInicial2: z.number().int().min(1).max(31).optional(),
        diaFinal2: z.number().int().min(1).max(31).optional()
    }),

    async execute(args) {
        const {anoInicial1, anoFinal1, mesInicial1, mesFinal1, diaInicial1, diaFinal1, anoInicial2, anoFinal2, mesInicial2, mesFinal2, diaInicial2, diaFinal2 } = args;

        let params1 = await dataValidation(anoInicial1, anoFinal1, mesInicial1, mesFinal1, diaInicial1, diaFinal1);
        let params2 = await dataValidation(anoInicial2, anoFinal2, mesInicial2, mesFinal2, diaInicial2, diaFinal2);

        const urlSoma1 = `${BASE_URL}?$apply=filter(postingDate ge '${params1.dataInicio}' and postingDate le '${params1.dataFim}')/aggregate(amountInDocumentCurrent with sum as Total)`
        const urlSoma2 = `${BASE_URL}?$apply=filter(postingDate ge '${params2.dataInicio}' and postingDate le '${params2.dataFim}')/aggregate(amountInDocumentCurrent with sum as Total)`
        
        return await periodComparison(urlSoma1, urlSoma2);
    }
}
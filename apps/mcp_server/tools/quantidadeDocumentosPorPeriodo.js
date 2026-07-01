import "dotenv/config"
const BASE_URL = process.env.CAP_URL

import {z} from 'zod'

import {getRecordsByPeriod} from '../providers/capClient.js'
import { dataValidation } from '../services/dataValidation.js';

export const quantidadeDocumentosPorPeriodo = {
    name: 'quantidadeDocumentosPorPeriodo',
    description: 'Função usada para retornar a quantidade de documentos em um período. Necessário pelo menos a passagem do parâmetro anoInicial para uso da função',

    input_schema: z.object({
        anoInicial: z.number().int().min(2000),

        anoFinal: z.number().int().min(2000).optional(),

        mesInicial: z.number().int().min(1).max(12).optional(),
        mesFinal: z.number().int().min(1).max(12).optional(),

        diaInicial: z.number().int().min(1).max(31).optional(),
        diaFinal: z.number().int().min(1).max(31).optional(),
    }),

    async execute(args) {
        const { anoInicial, anoFinal, mesInicial, mesFinal, diaInicial, diaFinal } = args; // Passando argumentos que foram recebidos
                
        const parametros = await dataValidation(anoInicial, anoFinal, mesInicial, mesFinal, diaInicial, diaFinal);
        const url = `${BASE_URL}?$filter=postingDate ge '${parametros.dataInicio}' and postingDate le '${parametros.dataFim}'&$count=true`

        // const urlFormatada = url += `&$count=true`

        return await getRecordsByPeriod(url);
        
        
    }
}
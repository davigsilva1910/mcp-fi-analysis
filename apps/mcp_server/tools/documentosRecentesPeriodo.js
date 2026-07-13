import "dotenv/config"
const BASE_URL = process.env.CAP_URL

import { z } from 'zod'
import {getLatestDocuments} from '../providers/capClient.js';
import { dataValidation } from '../services/dataValidation.js'
import QueryBuilder from '../builders/QueryBuilder.js';

export const documentosRecentesPeriodo = {
    name: "documentosRecentesPeriodo",
    description: "Retorna os documentos recentes de um período específico.",

    input_schema: z.object({
        anoInicial: z.number().int().min(2000),
        anoFinal: z.number().int().min(2000).optional(),
        mesInicial: z.number().int().min(1).max(12).optional(),
        mesFinal: z.number().int().min(1).max(12).optional(),
        diaInicial: z.number().int().min(1).max(31).optional(),
        diaFinal: z.number().int().min(1).max(31).optional(),
        top: z.number().int().min(1).max(100).optional(),
    }),

    async execute(args) {
        const { anoInicial, anoFinal, mesInicial, mesFinal, diaInicial, diaFinal, top } = args;

        const validationDate = await dataValidation(anoInicial, anoFinal, mesInicial, mesFinal, diaInicial, diaFinal);

        const builder = new QueryBuilder();

        builder
            .postingDateRange(
                validationDate.dataInicio,
                validationDate.dataFim
            )
            .top(top || 10)
            .order("postingDate", "desc");

        const query = builder.build();
        
        const url = `${BASE_URL}${query ? `?${query}` : ""}`;

        return await getLatestDocuments(url);
    }
    
}
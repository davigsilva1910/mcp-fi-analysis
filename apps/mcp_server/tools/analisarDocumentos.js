import "dotenv/config"
const BASE_URL = process.env.CAP_URL

import { z } from 'zod'

import { getAnalysisDocuments } from '../providers/capClient.js'
import { dataValidation } from '../services/dataValidation.js'
import QueryBuilder from '../builders/QueryBuilder.js';
import { FILTER_MAP } from '../builders/filterMapping.js'

export const analisarDocumentos = {
    name: "analisarDocumentos",
    description: "Analisa documentos e retorna informações com base nos filtros passados pelo usuário.",

    input_schema: z.object({
        anoInicial: z.number().int().min(2000),
        anoFinal: z.number().int().min(2000).optional(),
        mesInicial: z.number().int().min(1).max(12).optional(),
        mesFinal: z.number().int().min(1).max(12).optional(),
        diaInicial: z.number().int().min(1).max(31).optional(),
        diaFinal: z.number().int().min(1).max(31).optional(),

        companyCode: z.string().optional(),
        documentType: z.string().optional(),
        itemText: z.string().optional(),
        costCenter: z.string().optional(),
        glAccount: z.string().optional(),
        supplier: z.string().optional(),
        customer: z.string().optional(),
        currency: z.string().optional(),
        accountingDocument: z.string().optional(),
        top: z.number().int().min(1).max(1000).optional(),
        orderby: z.string().optional()
    }),

    async execute(args) {
        const { anoInicial, anoFinal, mesInicial, mesFinal, diaInicial, diaFinal, accountingDocument, companyCode, documentType, itemText, costCenter, glAccount, supplier, customer, currency, top } = args;

        const validationDate = await dataValidation(anoInicial, anoFinal, mesInicial, mesFinal, diaInicial, diaFinal);

        const builder = new QueryBuilder();

        builder
            .postingDateRange(
                validationDate.dataInicio,
                validationDate.dataFim
            )
            .applyFilters(args, FILTER_MAP)



        if (args.orderby) {
            builder.order(args.orderby);
        }

        if (args.top) {
            builder.top(args.top);

            if (!args.orderby) {
                builder.order("postingDate", "desc");
            }

        }

        builder.count();

        const query = builder.build();

        const url = `${BASE_URL}${query ? `?${query}` : ""}`;

        return await getAnalysisDocuments(url);
    }
}

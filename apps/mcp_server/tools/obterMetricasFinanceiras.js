import { z } from 'zod'

import { dataValidation } from '../services/dataValidation.js'
import ApplyBuilder from '../builders/ApplyBuilder.js'
import { FILTER_MAP } from '../builders/filterMapping.js'

export const obterMetricasFinanceiras = {
    name: "obterMetricasFinanceiras",
    description: "Função usada para obter métricas financeiras, usando apply aggregate para fortalecer as queries. Necessária a passagem pelo menos do ano para análise de um período.",

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

        const builder = new ApplyBuilder();

        builder
            .postingDateRange(
                validationDate.dataInicio,
                validationDate.dataFim
            )

    }
}
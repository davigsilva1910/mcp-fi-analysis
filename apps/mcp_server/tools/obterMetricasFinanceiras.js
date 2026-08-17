import "dotenv/config"
const BASE_URL = process.env.CAP_URL

import { z } from 'zod'

import { dataValidation } from '../services/dataValidation.js'
import ApplyBuilder from '../builders/ApplyBuilder.js'
import { AGGREGATE_MAP, FILTER_MAP, GROUPBY_MAP } from '../builders/filterMapping.js'
import { getFinancialMetrics } from '../providers/capClient.js'

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
        orderby: z.string().optional(),
        aggregates: z.array(
            z.object({
                field: z.enum([
                    "amountInDocumentCurrent",
                    "accountingDocument",
                    "lineItem"
                ]),
                func: z.enum([
                    "sum",
                    "average",
                    "min",
                    "max",
                    "$count"
                ]),
                alias: z.string().optional()
            })
        ),
        groupBy: z.array(z.string()).optional()
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
            .applyFilters(args, FILTER_MAP)
            .applyAggregates(args, AGGREGATE_MAP)
            .applyGroupBy(args, GROUPBY_MAP);


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

        console.log(url)

        return await getFinancialMetrics(url)
    }
}
import "dotenv/config"
const BASE_URL = process.env.CAP_URL

import { z } from 'zod'

import { dataValidation } from '../services/dataValidation.js'
import ApplyBuilder from '../builders/ApplyBuilder.js';
import { FILTER_MAP, GROUPBY_MAP } from '../builders/filterMapping.js'

import { documentComparison } from '../providers/capClient.js'

export const compararDocumentos = {
    name: "compararDocumentos",
    description: `
        Faz comparação de documentos com base no filtro passado, seja por tipo, empresa, cliente, fornecedor, etc.
        Deve ser passado também um período específico para realizar a comparação
    `,

    input_schema: z.object({
        anoInicial: z.number().int().min(2000),
        anoFinal: z.number().int().min(2000).optional(),
        mesInicial: z.number().int().min(1).max(12).optional(),
        mesFinal: z.number().int().min(1).max(12).optional(),
        diaInicial: z.number().int().min(1).max(31).optional(),
        diaFinal: z.number().int().min(1).max(31).optional(),

        companyCode1: z.string().optional(),
        documentType1: z.string().optional(),
        itemText1: z.string().optional(),
        costCenter1: z.string().optional(),
        glAccount1: z.string().optional(),
        supplier1: z.string().optional(),
        customer1: z.string().optional(),
        currency1: z.string().optional(),
        accountingDocument1: z.string().optional(),

        companyCode2: z.string().optional(),
        documentType2: z.string().optional(),
        itemText2: z.string().optional(),
        costCenter2: z.string().optional(),
        glAccount2: z.string().optional(),
        supplier2: z.string().optional(),
        customer2: z.string().optional(),
        currency2: z.string().optional(),
        accountingDocument2: z.string().optional()
    }),

    async execute(args) {
        const {
            anoInicial, anoFinal, mesInicial, mesFinal, diaInicial, diaFinal,
            companyCode1, documentType1, itemText1, costCenter1, glAccount1, supplier1, customer1, currency1, accountingDocument1,
            companyCode2, documentType2, itemText2, costCenter2, glAccount2, supplier2, customer2, currency2, accountingDocument2

        } = args;

        const paramsGlobal = await dataValidation(
            anoInicial, anoFinal, mesInicial, mesFinal, diaInicial, diaFinal
        )

        const args1 = {
            companyCode: companyCode1,
            documentType: documentType1,
            itemText: itemText1,
            costCenter: costCenter1,
            glAccount: glAccount1,
            supplier: supplier1,
            customer: customer1,
            currency: currency1,
            accountingDocument: accountingDocument1
        }

        const builder1 = new ApplyBuilder();

        builder1
            .postingDateRange(
                paramsGlobal.dataInicio,
                paramsGlobal.dataFim
            )
            .applyFilters(args1, FILTER_MAP)
            .applyAggregates(args1)
            .applyGroupBy(args1, GROUPBY_MAP)
            .count();

        const query1 = builder1.build()

        const url1 = `${BASE_URL}${query1 ? `?${query1}` : ""}`;

        const args2 = {
            companyCode: companyCode2,
            documentType: documentType2,
            itemText: itemText2,
            costCenter: costCenter2,
            glAccount: glAccount2,
            supplier: supplier2,
            customer: customer2,
            currency: currency2,
            accountingDocument: accountingDocument2
        };

        const builder2 = new ApplyBuilder();

        builder2
            .postingDateRange(
                paramsGlobal.dataInicio,
                paramsGlobal.dataFim
            )
            .applyFilters(args2, FILTER_MAP)
            .applyAggregates(args2)
            .applyGroupBy(args2, GROUPBY_MAP)
            .count();

        const query2 = builder2.build()

        const url2 = `${BASE_URL}${query2 ? `?${query2}` : ""}`;

        return await documentComparison(url1, url2);


    }
}
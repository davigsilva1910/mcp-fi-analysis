import "dotenv/config"
const BASE_URL = process.env.CAP_URL

import { z } from "zod";

import {dataValidation} from '../services/dataValidation.js'

import { getTotalAmountOfCostCenterByPeriod } from '../providers/capClient.js'

export const totalPorCentroDeCustoNoPeriodo = {
    name: "CalculoTotalPorCentroDeCustoNoPeriodo",
    description: "Ferramenta que realiza cálculo por centro de custo no período específicado pelo usuário. Devem ser passados parâmetro como o identificador do centro de custo e pelo menos o ano para identificação do período",

    input_schema: z.object({
        centroDeCustoID: z.string(),
        anoInicial: z.number().int().min(2000),
        anoFinal: z.number().int().optional(),
        mesInicial: z.number().int().min(1).max(12).optional(),
        mesFinal: z.number().int().min(1).max(12).optional(),
        diaInicial: z.number().int().min(1).max(31).optional(),
        diaFinal: z.number().int().min(1).max(31).optional(),
        top: z.number().int().min(1).optional()
    }),

    async execute(args) {
        const { centroDeCustoID, anoInicial, anoFinal, mesInicial, mesFinal, diaInicial, diaFinal } = args;

        const parametros = await dataValidation(anoInicial, anoFinal, mesInicial, mesFinal, diaInicial, diaFinal);
        const url = `${BASE_URL}?$apply=filter(costCenter eq '${centroDeCustoID}' and postingDate ge '${parametros.dataInicio}' and postingDate le '${parametros.dataFim}')/aggregate(amountInDocumentCurrent with sum as Total)`

        // const topParam = args.top;
        // if(topArgs) {
        //     urlFormatada += `&$top=${topParam}`;
        // }

        return await getTotalAmountOfCostCenterByPeriod(url);
    }
}
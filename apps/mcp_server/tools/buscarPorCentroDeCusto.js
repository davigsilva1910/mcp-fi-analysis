import { z } from "zod";

import {getByCostCenter} from '../providers/capClient.js'

export const buscarPorCentroDeCusto = {
    name: 'buscarDocumentosPorCentroDeCusto',
    description: `Realiza busca de documentos com base no identificador de centro de custo passado
    
        Se o retorno possuir:

        meta.exportRecommended = true

        não tente analisar todos os registros.
        Utilize a ferramenta generateFile
        passando meta.endpoint. 
    `,

    input_schema: z.object({
        idCentroDeCusto: z.string()
    }),

    async execute({idCentroDeCusto}) {
        return await getByCostCenter(idCentroDeCusto);
    }
}
import { z } from "zod";

import {getLastDocuments} from '../providers/capClient.js'

export const buscarDocumentosRecentes = {
    name: 'buscarDocumentosRecentes',
    description: `Buscar documentos recentes com base na quantidade que o usuário informa
    
        Se o retorno possuir:

        meta.exportRecommended = true

        não tente analisar todos os registros.
        Utilize a ferramenta generateFile
        passando meta.endpoint.
    `,

    input_schema: z.object({
        quantidade: z.number().int().min(1)
    }),

    async execute({quantidade}) {
        return await getLastDocuments(quantidade);
    }
}
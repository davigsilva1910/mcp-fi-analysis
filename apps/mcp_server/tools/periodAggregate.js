import {z} from 'zod';

export const periodAggregate = {
    name: "periodAggregate",
    description: `
        Agrega dados por períodos e grupos de períodos como mês, trimestre e ano.
        Retorna os dados agregados pelo período, facilitando análise de tendências, evoluções e padrões ao longo do tempo.
    `,

    input_schema: z.object({
        ano: z.number().int().min(2000),
        mes: z.number().int().min(1).max(12).optional()
    })
}
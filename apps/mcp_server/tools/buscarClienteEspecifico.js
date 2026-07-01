import {z} from 'zod';
import {getSpecificCustomer} from '../providers/capClient.js'

export const buscarClienteEspecifico = {
    name: 'buscarClienteEspecifico',
    description: 'Função usada para buscar documento com base no cliente específico informado. Obrigatório uso do parâmetro "customer/KUNNR" para uso da função',

    input_schema: z.object({
        customer: z.string(),
        fiscalYear: z.string().optional(),
        companyCode: z.string().optional()
    }),

    async execute(args) {
        const {customer, fiscalYear, companyCode} = args;

        let url = `${CAP_URL}?$filter=customer eq '${customer}'`;

        const fiscalYearParam = args.fiscalYear;
        if(fiscalYearParam) {
            url += ` and fiscalYear eq '${fiscalYearParam}'`
        }
        
        const companyCodeParam = args.companyCode;
        if(companyCodeParam) {
            url += ` and companyCode eq '${companyCodeParam}'`
        }

        return await getSpecificCustomer(url);
    }
}

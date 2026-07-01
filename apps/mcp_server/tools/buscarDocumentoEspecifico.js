import {z} from 'zod';

import {getSpecificDocument} from '../providers/capClient.js'

export const buscarDocumentoEspecifico = {
    name: 'buscarDocumentoEspecifico',
    description: 'Busca um documento contábil pelo número do documento (BELNR / accountingDocument). Retorna todos os itens pertencentes ao documento.',

    input_schema: z.object({
        accountingDocument: z.string(),
        fiscalYear: z.string().optional(),
        companyCode: z.string().optional()
    }),

    async execute(args) {
        const {accountingDocument, fiscalYear, companyCode} = args;

        let url = `${CAP_URL}?$filter=accountingDocument eq '${accountingDocument}'`;

        const fiscalYearParam = args.fiscalYear;
        if(fiscalYearParam) {
            url += ` and fiscalYear eq '${fiscalYearParam}'`
        }
        
        const companyCodeParam = args.companyCode;
        if(companyCodeParam) {
            url += ` and companyCode eq '${companyCodeParam}'`
        }
        
        return await getSpecificDocument(url);
    }
}
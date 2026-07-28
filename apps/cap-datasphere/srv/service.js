const cds = require('@sap/cds');
const mapping = require('./datasphere-mapping');
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client');


const FIELD_MAP = {
    companyCode: 'BUKRS',
    fiscalYear: 'GJAHR',
    accountingDocument: 'BELNR',
    lineItem: 'BUZEI',
    documentType: 'BLART',
    documentDate: 'BLDAT',
    postingDate: 'BUDAT',
    itemText: 'SGTXT',
    costCenter: 'KOSTL',
    glAccount: 'HKONT',
    supplier: 'LIFNR',
    customer: 'KUNNR',
    currency: 'WAERS',
    amountInDocumentCurrent: 'WRBTR'
};

function translate(node) {

    if (!node) return node;

    if (Array.isArray(node)) {
        node.forEach(translate);
        return node;
    }

    if (typeof node !== 'object') {
        return node;
    }

    if (node.ref) {
        node.ref = node.ref.map(r => FIELD_MAP[r] || r);
    }

    if (node.args) {
        translate(node.args);
    }

    if (node.where) {
        translate(node.where);
    }

    if (node.columns) {
        translate(node.columns);
    }

    if (node.groupBy) {
        translate(node.groupBy);
    }

    if (node.orderBy) {
        translate(node.orderBy);
    }

    if (node.xpr) {
        translate(node.xpr);
    }

    return node;
}

function toCdsDate(value) {
    if (!value) return null;

    const text = String(value);

    if (text.length !== 8) return null;

    return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
}

module.exports = async function () {

    const ds = await cds.connect.to('datasphere_test');

    this.on('READ', 'FAC_GL_DOCUMENT_ITEM', async (req) => {
        const source = mapping.FAC_GL_DOCUMENT_ITEM;

        req.query.SELECT.from = {
            ref: [
                source.space,
                source.asset,
                source.asset
            ]
        };

        translate(req.query.SELECT)

        // const column = req.query.SELECT.columns?.[0];

        const isAggregate =
            req.query.SELECT.columns?.some(
                col => col.func === 'sum' ||
                    col.func === 'count' ||
                    col.func === 'average' ||
                    col.func === 'min' ||
                    col.func === 'max'
            );

        if (isAggregate) {

            let apply = req.req?.query?.$apply;
            
            let orderby = req.req?.query?.$orderby;
            if (req.req?.query?.$orderby) {
                delete req.req.query.$orderby;
            } // Remove o parâmetro $orderby da query para evitar conflitos com a agregação

            // Object.entries(FIELD_MAP) armazena pares de chave-valor do objeto FIELD_MAP
            // O const guarda as chaves e valores em ordem, pois o FIELD_MAP é um objeto
            // creative guarda a chave do FIELD_MAP e physical guarda o valor do FIELD_MAP
            for (const [creative, physical] of Object.entries(FIELD_MAP)) {
                apply = apply.replaceAll(creative, physical); // Aqui realiza a troca do campo criativo para o campo físico
            }

            const encodedApply = encodeURIComponent(apply);
            let url = `/${source.space}/${source.asset}/${source.asset}?$apply=${encodedApply}`;


            if (orderby) {
                for (const [creative, physical] of Object.entries(FIELD_MAP)) {
                    orderby = orderby.replaceAll(creative, physical); // Aqui realiza a troca do campo criativo para o campo físico
                } // Faz a tradução do campo criativo para o campo físico no parâmetro $orderby, usando o FIELD_MAP
                const encodedOrderby = encodeURIComponent(orderby);
                url += `&$orderby=${encodedOrderby}`;
            }

            const top = req.req?.query?.$top;
            if (top) {
                url += `&$top=${top}`;
            }

            try {
                const response = await executeHttpRequest(
                    {
                        destinationName: 'datasphere-test'
                    },
                    {
                        method: 'GET',
                        url
                    }
                );

                // const REVERSE_FIELD_MAP = Object.fromEntries(
                //     Object.entries(FIELD_MAP).map(([creative, physical]) => [physical, creative])
                // ); // Realiza uma inversão do FIELD_MAP, trocando as chaves pelos valores e vice-versa

                const aggregatedResult = response.data.value
                for (const record of aggregatedResult) {
                    // Pega todas as chaves do objeto record, que são os campos retornados da agregação. 
                    // São os campos físicos do Datasphere, que precisam ser mapeados para os campos criativos do CDS
                    const chavesAggregatedResult = Object.keys(record);

                    for (const chave of chavesAggregatedResult) {
                        const mapeamento = Object.entries(FIELD_MAP).find(([creative, physical]) => physical === chave); // Aqui realiza a busca do mapeamento do campo físico para o campo criativo, usando o FIELD_MAP
    
                        if (mapeamento) {
                            const creativeKey = mapeamento[0]; // Pega a chave criativa no mapeamento
    
                            record[creativeKey] = record[chave]; // Adiciona o campo criativo ao objeto record, com o valor do campo físico
    
                            delete record[chave]; // Remove o campo físico do objeto record
                        }
                    }
                }
                return aggregatedResult;
            }
            catch (err) {
                console.error('STATUS:', err.response?.status);
                console.error('DATA:', JSON.stringify(err.response?.data, null, 2));
                throw err;
            }

        }

        const result = await ds.run(req.query);

        if (
            req.query.SELECT.columns?.length === 1 &&
            req.query.SELECT.columns[0].func
        ) {
            return result;
        }

        const mappedRecords = result.map(row => ({
            ID: row.ID,
            companyCode: row.BUKRS,
            fiscalYear: row.GJAHR,
            accountingDocument: row.BELNR,
            lineItem: row.BUZEI,
            documentType: row.BLART,
            documentDate: toCdsDate(row.BLDAT),
            postingDate: toCdsDate(row.BUDAT),
            itemText: row.SGTXT,
            costCenter: row.KOSTL,
            glAccount: row.HKONT,
            supplier: row.LIFNR,
            customer: row.KUNNR,
            currency: row.WAERS,
            amountInDocumentCurrent: row.WRBTR
        }));

        return mappedRecords;
    });
}

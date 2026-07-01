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


        console.dir(req.query.SELECT, { depth: null });

        const isExport = req.req?.query?.export === 'true';
        if (isExport && req.query.SELECT.limit) {
            delete req.query.SELECT.limit;
        }


        const column = req.query.SELECT.columns?.[0];

        const isAggregate = req.query.SELECT.columns?.length === 1 && column?.func;

        if (isAggregate) {

            let apply = req.req?.query?.$apply;


            for (const [creative, physical] of Object.entries(FIELD_MAP)) {
                apply = apply.replaceAll(creative, physical);
            }

            const encodedApply = encodeURIComponent(apply); 

            const response = await executeHttpRequest(
                {
                    destinationName: 'datasphere-test'
                },
                {
                    method: 'GET',
                    url: `/${source.space}/${source.asset}/${source.asset}?$apply=${encodedApply}`
                }
            );

            return response.data.value;
        }

        const result = await ds.run(req.query);

        console.log(result.length);
        console.dir(result[0], { depth: null });

        if (
            req.query.SELECT.columns?.length === 1 &&
            req.query.SELECT.columns[0].func
        ) {
            return result;
        }

        console.log(req.query);

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

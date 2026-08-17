export const FILTER_MAP = {

    companyCode: {
        field: "companyCode",
        operator: "eq"
    },

    documentType: {
        field: "documentType",
        operator: "eq"
    },

    itemText: {
        field: "itemText",
        operator: "eq"
    },

    costCenter: {
        field: "costCenter",
        operator: "eq"
    },

    glAccount: {
        field: "glAccount",
        operator: "eq"
    },

    supplier: {
        field: "supplier",
        operator: "eq"
    },

    customer: {
        field: "customer",
        operator: "eq"
    },

    currency: {
        field: "currency",
        operator: "eq"
    },

    accountingDocument: {
        field: "accountingDocument",
        operator: "eq"
    }

};




export const AGGREGATE_MAP = {
    amountInDocumentCurrent: {
        sum: "Total",
        average: "Media",
        min: "MenorValor",
        max: "MaiorValor"
    },

    lineItem: {
        $count: "TotalLinhas"
    },

    accountingDocument: {
        $count: "TotalDocumentos"
    }
};

export const GROUPBY_MAP = {


    companyCode: {
        field: "companyCode"
    },


    documentType: {
        field: "documentType"
    },


    costCenter: {
        field: "costCenter"
    },


    glAccount: {
        field: "glAccount"
    },


    supplier: {
        field: "supplier"
    },


    customer: {
        field: "customer"
    },


    currency: {
        field: "currency"
    },


    postingDate: {
        field: "postingDate"
    },


    accountingDocument: {
        field: "accountingDocument"
    }
};



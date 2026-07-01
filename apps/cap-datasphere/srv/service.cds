service MyService {

  @Aggregation.ApplySupported: {
        Transformations: ['aggregate', 'groupby', 'filter'],
        GroupableProperties: [ {Property: 'companyCode'}, {Property: 'fiscalYear'}, {Property: 'accountingDocument'}, {Property: 'documentType'}, 
          {Property: 'documentDate'}, {Property: 'accountingDocument'}, {Property: 'postingDate'}, {Property: 'costCenter'}, {Property: 'glAccount'}, 
            {Property: 'supplier'}, {Property: 'customer'}, {Property: 'currency'} ],
        AggregatableProperties: [ {Property: 'lineItem'}, {Property: 'itemText'}, {Property: 'amountInDocumentCurrent'} ]
  }
  @cds.persistence.skip
  entity FAC_GL_DOCUMENT_ITEM {
    key ID                      : cds.UUID;
        companyCode             : String(20);
        fiscalYear              : String(4);
        accountingDocument      : String(15);
        lineItem                : String(5);
        documentType            : String(5);
        documentDate            : cds.Date;
        postingDate             : cds.Date;
        itemText                : String(100);
        costCenter              : String(20);
        glAccount               : String(15);
        supplier                : String(20);
        customer                : String(20);
        currency                : String(3);
        amountInDocumentCurrent : Decimal(10, 2);
  }

}

import "dotenv/config"
const BASE_URL = process.env.CAP_URL

// capClient.js
export async function getDocumentsByPeriod(url) {
  const response = await fetch(url);

  if (!response.ok) {
    return {
      found: false,
      message: "Documento não encontrado"
    };
  }

  const data = await response.json();
  const totalRecords = data.value?.length ?? data.length ?? 0;
  return {
    found: true,
    data,

    meta: {
      exportUrl: url,
      totalRecords,
      exportRecommended:
        totalRecords > 500
    }
  };
}

export async function getLastDocuments(n) {

  const url = `${BASE_URL}?$orderby=postingDate desc&$top=${n}`

  const response = await fetch(url);


  if (!response.ok) {
    return {
      found: false,
      message: "Documento não encontrado"
    };
  }

  const data = await response.json();
  const totalRecords = data.value?.length ?? data.length ?? 0;
  return {
    found: true,
    data,

    meta: {
      exportUrl: url,
      totalRecords,
      exportRecommended:
        totalRecords > 500
    }
  };
}

export async function getByCostCenter(idCentroDeCusto) {

  const url = `${BASE_URL}?$filter=costCenter eq '${idCentroDeCusto}'`

  const response = await fetch(url);


  if (!response.ok) {
    return {
      found: false,
      message: "Documento não encontrado"
    };
  }

  const data = await response.json();

  const totalRecords = data.value?.length ?? data.length ?? 0;
  return {
    found: true,
    data,

    meta: {
      exportUrl: url,
      totalRecords,

      exportRecommended:
        (data.value?.length ?? 0) > 500
    }
  };
}

export async function getTotalAmountOfCostCenterByPeriod(url) {
  const response = await fetch(url);

  if (!response.ok) {
    return {
      found: false,
      message: "Documentos não encontrados"
    };
  }

  const data = await response.json();


  return {
    found: true,
    data
  };

}

export async function getTopTotalAmountOfCostCenterByPeriod(url) {
  const response = await fetch(url);

  if (!response.ok) {
    return {
      found: false,
      message: "Documentos não encontrados"
    };
  }

  const data = await response.json();

  return {
    found: true,
    data
  };
}

export async function getSpecificDocument(url) {
  const response = await fetch(url);

  
  const data = await response.json();
  
  if (!data.value.length) {
    return {
      found: false,
      message: "Documento não encontrado."
    };
  }

  return {
    found: true,
    data
  };
}

export async function getSpecificCustomer(url) {
  const response = await fetch(url);

  const data = await response.json();

  if (!data.value.length) {
    return {
      found: false,
      message: "Documento não encontrado."
    };
  }

  return {
    found: true,
    data
  };
}

export async function getRecordsByPeriod(url) {
  const response = await fetch(url);

  const data = await response.json();

  if (!data.value.length) {
    return {
      found: false,
      message: "Documento não encontrado."
    };
  }

  return {
    found: true,
    data
  };
}

export async function periodComparison(urlCountRecords1, urlCountRecords2, urlSoma1, urlSoma2) {
  const responseCountRecords1 = await fetch(urlCountRecords1)
  const responseCountRecords2 = await fetch(urlCountRecords2)
  const responseSoma1 = await fetch(urlSoma1)
  const responseSoma2 = await fetch(urlSoma2)

  if (!responseCountRecords1.ok) {
    return {
      found: false,
      message: "Documentos não encontrados"
    };
  }
  
  if (!responseCountRecords2.ok) {
    return {
      found: false,
      message: "Documentos não encontrados"
    };
  }
  
  if (!responseSoma1.ok) {
    return {
      found: false,
      message: "Documentos não encontrados"
    };
  }
  
  if (!responseSoma2.ok) {
    return {
      found: false,
      message: "Documentos não encontrados"
    };
  }

  const dataCountRecords1 = await responseCountRecords1.json();
  const dataCountRecords2 = await responseCountRecords2.json();
  const dataSoma1 = await responseSoma1.json();
  const dataSoma2 = await responseSoma2.json();

  
  const countRecords1 = dataCountRecords1["@odata.count"];
  const countRecords2 = dataCountRecords2["@odata.count"];

  
  const total1 = dataSoma1.value?.[0]?.Total ?? 0;
  const total2 = dataSoma2.value?.[0]?.Total ?? 0;

  const diferencaPeriodo1e2 = total1 - total2;
  const porcentagemDiferencaPeriodo = (diferencaPeriodo1e2 / total2) * 100;


  return {
    found: true,
    countRecords1,
    countRecords2,
    total1,
    total2,
    diferencaPeriodo1e2,
    porcentagemDiferencaPeriodo
  };

}
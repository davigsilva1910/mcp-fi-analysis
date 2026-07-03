// capClient.js

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

export async function periodComparison( urlSoma1, urlSoma2) {
  // const responseCountRecords1 = await fetch(urlCountRecords1)
  // const responseCountRecords2 = await fetch(urlCountRecords2)
  // const responseSoma1 = await fetch(urlSoma1)
  // const responseSoma2 = await fetch(urlSoma2)

  console.time("all");

  const [
    responseSoma1,
    responseSoma2
  ] = await Promise.all([
    fetch(urlSoma1),
    fetch(urlSoma2)
  ]);

  console.timeEnd("all");

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
  const dataSoma1 = await responseSoma1.json();
  const dataSoma2 = await responseSoma2.json();

  const total1 = dataSoma1.value?.[0]?.Total ?? 0;
  const total2 = dataSoma2.value?.[0]?.Total ?? 0;

  const diferencaPeriodo1e2 = total1 - total2;
  const porcentagemDiferencaPeriodo = (diferencaPeriodo1e2 / total2) * 100;


  return {
    found: true,
    resumo: {
      total1,
      total2,
      diferencaPeriodo1e2,
      porcentagemDiferencaPeriodo
    }
  };

}

export async function getTotalAmountByPeriod(url) {
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

export async function getAnalysisDocuments(url) {
  const response = await fetch(url);

  if (!response.ok) {
    return {
      found: false,
      message: "Documentos não encontrados"
    };
  }

  
  const data = await response.json();
  
  let records = 0;
  if (url.includes("top")) {
    records = data.value.length;
  }else {
    records = data['@odata.count'];
  }

  return {
    found: true,
    data,
    records, 
    meta: {
      exportUrl: url,
      records,
      exportRecommended: records > 300
    }
  };


}
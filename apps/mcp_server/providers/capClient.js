export async function periodComparison(urlSoma1, urlSoma2) {
  const [
    responseSoma1,
    responseSoma2
  ] = await Promise.all([
    fetch(urlSoma1),
    fetch(urlSoma2)
  ]);

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
  const totalRecords1 = dataSoma1.value?.[0]?.TotalCount ?? 0;

  const total2 = dataSoma2.value?.[0]?.Total ?? 0;
  const totalRecords2 = dataSoma2.value?.[0]?.TotalCount ?? 0;

  const diferencaRecords = totalRecords1 - totalRecords2
  const diferencaPeriodo1e2 = total1 - total2;
  const porcentagemDiferencaPeriodo = (diferencaPeriodo1e2 / total2) * 100;


  return {
    found: true,
    resumo: {
      total1,
      total2,
      totalRecords1,
      totalRecords2,
      diferencaRecords,
      diferencaPeriodo1e2,
      porcentagemDiferencaPeriodo
    }
  };

}

export async function documentComparison(url1, url2) {
  const [
    responseUrl1,
    responseUrl2
  ] = await Promise.all([
    fetch(url1),
    fetch(url2)
  ]);

  if (!responseUrl1.ok) {
    return {
      found: false,
      message: "Documentos não encontrados"
    };
  }

  if (!responseUrl2.ok) {
    return {
      found: false,
      message: "Documentos não encontrados"
    };
  }
  const data1 = await responseUrl1.json();
  const data2 = await responseUrl2.json();

  const total1 = data1['@odata.count'];
  const total2 = data2['@odata.count'];

  return {
    found: true,
    comparacao: {
      quantidadeDocumentos1: total1,
      quantidadeDocumentos2: total2,
      diferenca: total1 - total2,
      percentual:
        total2 > 0
          ? ((total1 - total2) / total2) * 100
          : null
    }
  }

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
  } else {
    records = data['@odata.count'];
  }

  return {
    found: true,
    data,
    records
  };


}

export async function getFinancialMetrics(url) {
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
  } else {
    records = data['@odata.count'];
  }

  return {
    found: true,
    data,
    records
  };


}

export async function getLatestDocuments(url) {
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
import "dotenv/config"
const BASE_URL = process.env.CAP_URL

// capClient.js

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
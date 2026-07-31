export async function dataValidation(anoInicial, anoFinal, mesInicial, mesFinal, diaInicial, diaFinal) {
    function getLastDayOfMonth(ano, mes) {
        return new Date(ano, mes, 0).getDate();
    }

    // Formata para sempre ter pelo menos dois digitos no número
    function formatTwoDigits(n) {
        return String(n).padStart(2, '0');
    }

    const anoFim = anoFinal || anoInicial;

    const mesIni = mesInicial ?? 1;
    const mesFim = mesFinal || mesInicial !== undefined ? mesInicial : 12;

    const diaIni = diaInicial ?? 1;
    const diaFim = diaFinal || diaInicial !== undefined ? diaInicial : getLastDayOfMonth(anoFim, mesFim); // Aqui passa o ano fim e o mes fim para calcular o último dia do mes

    const dataInicio = `${anoInicial}${formatTwoDigits(mesIni)}${formatTwoDigits(diaIni)}`;
    const dataFim = `${anoFim}${formatTwoDigits(mesFim)}${formatTwoDigits(diaFim)}`;

    // Verifica se foi passado o dia sem o mês
    if (diaInicial !== undefined && mesInicial === undefined) {
        return {
            found: false,
            message: "Período inválido: Dia não pode ser passado sem mês"
        };

    }

    // Verifica se o ano inicial é maior que o ano final 
    if (anoInicial > anoFinal) {
        return {
            found: false,
            message: "Período inválido: Ano inicial não pode ser maior que ano final"
        }
    }

    if (dataInicio > dataFim) {
        return {
            found: false,
            mesage: "Período inválido: Data inicial não pode ser maior que a data final"
        }
    }


    // return `${process.env.CAP_URL}?$filter=postingDate ge '${dataInicio}' and postingDate le '${dataFim}'`;
    return {
        found: true,
        dataInicio,
        dataFim
    }
} 
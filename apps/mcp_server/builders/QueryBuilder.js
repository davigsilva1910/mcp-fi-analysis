class QueryBuilder {

    constructor() {
        this.filters = [];
        this.selects = [];
        this.orderBy = null;
        this.topValue = null;
        this.skipValue = null;
        this.countValue = false;
    }

    filter(field, operator, value) {

        if (value === undefined || value === null || value === "")
            return this;

        this.filters.push({
            field,
            operator,
            value
        });

        return this;
    }

    buildFilter() {
        return this.filters
            .map(f => {
                const value =
                    typeof f.value === "string"
                        ? `'${f.value}'`
                        : f.value;

                return `${f.field} ${f.operator} ${value}`;
            })
            .join(" and ");
    }


    // Método para percorrer todos os argumentos e aplicar os filtros correspondentes com base no mapeamento fornecido
    applyFilters(args, mappings) {

        for (const arg in args) {

            const config = mappings[arg];

            if (!config) {
                continue;
            }

            this.filter(
                config.field,
                config.operator,
                args[arg]
            );
        }

        return this;
    }

    select(...fields) {
        this.selects.push(...fields);
        return this;
    }

    top(value) {
        this.topValue = value;
        return this;
    }

    skip(value) {
        this.skipValue = value;
        return this;
    }

    order(field, direction = "asc") {
        this.orderBy = {
            field,
            direction
        };

        return this;
    }

    count() {
        this.countValue = true;
        return this;
    }

    postingDateRange(dataInicio, dataFim) {
        if (dataInicio === dataFim) {
            return this.filter("postingDate", "eq", dataInicio);
        } else {
            this.filter("postingDate", "ge", dataInicio);
            this.filter("postingDate", "le", dataFim);
            return this;
        }
    }

    build() {

        const params = [];

        if (this.filters.length) {

            const filter = this.filters
                .map(f => {

                    const value =
                        typeof f.value === "string"
                            ? `'${f.value}'`
                            : f.value;

                    return `${f.field} ${f.operator} ${value}`;

                })
                .join(" and ");

            params.push(`$filter=${encodeURIComponent(filter)}`);
        }

        if (this.selects.length) {
            params.push(`$select=${this.selects.join(",")}`);
        }

        if (this.orderBy) {
            params.push(
                `$orderby=${this.orderBy.field} ${this.orderBy.direction}`
            );
        }

        if (this.topValue !== null) {
            params.push(`$top=${this.topValue}`);
        }

        if (this.skipValue !== null) {
            params.push(`$skip=${this.skipValue}`);
        }

        if (this.countValue) {
            params.push(`$count=true`);
        }

        if (!params.length) {
            return "";
        }

        return `${params.join("&")}`;
    }

}

export default QueryBuilder;
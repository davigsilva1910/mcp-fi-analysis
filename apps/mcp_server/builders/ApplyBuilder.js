class ApplyBuilder {
    constructor() {
        this.filters = [];
        this.aggregates = [];
        this.groupByFields = [];
        this.topValue = null;
        this.skipValue = null;
        this.orderBy = null;
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

    applyFilters(args, mappings) {

        for (const arg in args) {

            const config = mappings[arg]; // Pega o mapping passado pela tool

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

    aggregate(field, func, alias) {

        if (!field || !func) {
            return this;
        }

        this.aggregates.push({
            field,
            func,
            alias
        });

        return this;
    }

    applyAggregates(args) {

        if (!args.aggregates) {
            return this;
        }

        for (const aggregate of args.aggregates) {

            this.aggregate(
                aggregate.field,
                aggregate.func,
                aggregate.alias ||
                `${aggregate.func}_${aggregate.field}`
            );
        }

        return this;
    }

    groupby(field) {
        if (!field)
            return this;

        this.groupByFields.push(field);

        return this;
    }

    applyGroupBy(args, mappings) {

        if (!args.groupBy) {
            return this;
        }

        for (const field of args.groupBy) {

            const config = mappings[field];

            if (!config) {
                continue;
            }

            this.groupby(config.field);
        }

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
        const applyParts = [];
        const params = []

        if (this.filters.length) {
            const filterExpression =
                this.filters
                    .map(f => {
                        const value =
                            typeof f.value === "string"
                                ? `'${f.value}'`
                                : f.value;
                        return `${f.field} ${f.operator} ${value}`;
                    })
                    .join(" and ");
            applyParts.push(
                `filter(${filterExpression})`
            );
        }


        const aggregateExpression = this.aggregates
            .map(a => {
                if (a.func === '$count') {
                    return `${a.func} as ${a.alias}`;
                }

                return `${a.field} with ${a.func} as ${a.alias}`;
            })
            .join(",");


        if (this.groupByFields.length) {
            const groupBy =
                this.groupByFields.join(",");
            if (aggregateExpression) {
                applyParts.push(
                    `groupby((${groupBy}),aggregate(${aggregateExpression}))`
                );
            } else {
                applyParts.push(
                    `groupby((${groupBy}))`
                );
            }
        } else if (aggregateExpression) {
            applyParts.push(
                `aggregate(${aggregateExpression})`
            );
        }


        if (applyParts.length) {
            params.push(
                `$apply=${encodeURIComponent(
                    applyParts.join("/")
                )}`
            );
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

        if (!applyParts.length && !params.length) {
            return "";
        }

        return params.join("&");

    }
}

export default ApplyBuilder;
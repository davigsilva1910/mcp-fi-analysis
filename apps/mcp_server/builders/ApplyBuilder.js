class ApplyBuilder {
    constructor() {
        this.filters = [];
        this.aggregates = [];
        this.groupbyfields = [];
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

    aggregate(arg, func, alias) {
        if (arg === undefined || arg === null || arg === "")
            return this;

        this.aggregates.push({
            arg,
            func,
            alias
        })

        return this;
    }

    applyAggregates(args, mappings) {

        if (!args.aggregates) {
            return this;
        }

        for (const aggregate of args.aggregates) {

            const config = mappings[aggregate.func];

            if (!config) {
                continue;
            }

            this.aggregate(
                aggregate.field,
                aggregate.func,
                aggregate.alias ?? config.alias
            );
        }

        return this;
    }

    groupby(field) {
        if (field === undefined || field === null || field === "")
            return this;

        this.groupbyfields.push(field);

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
        const queryParts = []

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

            applyParts.push(`filter(${filter})`);
        }

        const aggregateExpression = this.aggregates
            .map(a => {
                if (a.arg === '$count') {
                    return `${a.arg} as ${a.alias}`;
                }

                return `${a.arg} with ${a.func} as ${a.alias}`;
            })
            .join(",");


        if (this.groupbyfields.length) {

            const groupBy = this.groupbyfields.join(",");

            if (aggregateExpression) {
                applyParts.push(
                    `groupby((${groupBy}),aggregate(${aggregateExpression}))`
                );
            } else {
                applyParts.push(
                    `groupby((${groupBy}))`
                );
            }
        }
        else if (aggregateExpression) {
            applyParts.push(
                `aggregate(${aggregateExpression})`
            );
        }

        if (this.orderBy) {
            queryParts.push(
                `$orderby=${this.orderBy.field} ${this.orderBy.direction}`
            );
        }

        if (this.topValue !== null) {
            queryParts.push(`$top=${this.topValue}`);
        }

        if (this.skipValue !== null) {
            queryParts.push(`$skip=${this.skipValue}`);
        }

        if (this.countValue) {
            queryParts.push(`$count=true`);
        }

        if (!applyParts.length && !queryParts.length) {
            return "";
        }


        if (applyParts.length) {
            queryParts.unshift(
                `${applyParts.join("/")}`
            );
        }


        return `$apply=${queryParts.join("&")}`;

    }
}
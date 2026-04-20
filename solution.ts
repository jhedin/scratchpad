


type Currency = string

interface ConversionRate {
    from: Currency,
    to: Currency,
    rate: number
}


interface Props {
    rates: ConversionRate[],
    from: Currency,
    to: Currency,
    amount: number
}

type Result = {
    conversion: number
};

export function solution({ rates, from, to, amount }: Props): Result {

    /*const converted = rates.filter(rate => (rate.from === from && rate.to === to)).map(rate => rate.rate * amount)
    if (converted.length <= 0) {
        throw "no conversion available"
    }*/


    // rates are edges in, currencies are nodes. follow edges and update the highest value for each as you go

    const bestConversion: Record<Currency, number> = {}

    bestConversion[from] = amount

    let queue: Currency[] = [from]
    while (queue.length > 0) {
        console.log("bestConversion")
        console.table(bestConversion)
        const current = queue.pop() ?? "NONE"
        const currentAmount = bestConversion[current]
        const next = rates
            .filter(rate => rate.from == current)
            .map(rate => {
                return {
                    to: rate.to,
                    amount: currentAmount * rate.rate
                }
            }).filter((conversion) => conversion.amount > (bestConversion[conversion.to] ?? 0))
            .map((conversion) => {
                bestConversion[conversion.to] = conversion.amount
                return conversion.to
            })
        queue = [...next, ...queue]
        console.log("queue:")
        console.table(queue)
    }

    if (bestConversion[to] === undefined) {
        throw "no conversion available"
    }

    return {
        conversion: bestConversion[to]
    };
}

type Currency = string // better off hardcoding the list


interface Payment {
    id: string
    amount: number
    currency: Currency
}

interface Processor {
    name: string
    supported_currencies: Currency[]
    fee_percent: number
    volume_limit_usd: number
}
type Rates = Record<Currency, number>

interface Props {
    payments: Payment[];
    processors: Processor[];
    rates: Rates
}
interface Result {
    id: string
    processor: string
}


const NO_SUPPORTED_PROCESSOR_ID = "UNROUTED"

export function solution({ payments, processors, rates }: Props): Result[] {

    /**
     *   You're given a list of payments — each one has an ID, an amount, and a currency. You're also given a list of processors — each
          has a name, a set of currencies it supports, and a fee percentage it charges.
  
          Your job: for each payment, assign it to the cheapest eligible processor. Output the assignment.
    */

    //defensive copy
    processors = JSON.parse(JSON.stringify(processors))

    const cheapestProcessors: Record<Currency, Processor[]> = {}

    const currencies = [...new Set(processors.reduce((currencies, processor) => {
        return [...currencies, ...(processor.supported_currencies)]
    }, [] as Currency[]))]

    for (let currency of currencies) {
        const minProcessors = processors.filter(processor => processor.supported_currencies.find(val => val === currency) != undefined)
            .sort((a, b) => a.fee_percent - b.fee_percent)
        cheapestProcessors[currency] = minProcessors
    }

    console.table(cheapestProcessors)

    const sortedPayments = payments.toSorted((a, b) => (b.amount * rates[b.currency]) - (a.amount * rates[a.currency]))

    const cheapestProcessorForPayment = sortedPayments.reduce((result, payment) => {
        const amountInUSD = payment.amount * rates[payment.currency]

        for (let processor of (cheapestProcessors[payment.currency] ?? [])) {
            if (amountInUSD <= processor.volume_limit_usd) {
                console.log(payment, processor, amountInUSD)
                processor.volume_limit_usd -= amountInUSD
                console.log(payment, processor, amountInUSD)
                result[payment.id] = processor.name
                return result
            }
        }

        result[payment.id] = NO_SUPPORTED_PROCESSOR_ID
        return result
    }, {} as Record<string, string>)

    const results = payments.map(payment => {
        return {
            id: payment.id,
            processor: cheapestProcessorForPayment[payment.id]
        }
    })
    console.table(results)
    return results

    throw new Error("No solution found");
}

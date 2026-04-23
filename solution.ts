

type Currency = string

interface Payment {
    id: string,
    amount: number
    currency: Currency
}

interface Processor {
    name: string
    supported_currencies: Currency[]
    fee_percent: number
    volume_limit_usd: number
}

interface ProcessorWrapper extends Processor {
    remaining: number
}

interface PaymentWrapper extends Payment {
    usd: number
    sort: number
    processor?: ProcessorWrapper
}


type Rates = Record<Currency, number>

interface Props {
    payments: Payment[]
    processors: Processor[]
    rates: Rates
}

interface ProcessorAssignment {
    id: string,
    processor: string
}

type Result = ProcessorAssignment[];


/**
 * Combined Parts 1+2+3:
 * - Each payment has id, amount, currency.
 * - Each processor has name, supported_currencies, fee_percent, and volume_limit_usd.
 * - rates maps currency -> USD multiplier.
 *
 * Constraints:
 *   1. Never exceed any processor's volume_limit_usd.
 *   2. A payment can only go to a processor that supports its currency.
 *   3. Minimize total fees across all assigned payments.
 *   4. Unroutable payments (no eligible processor or all at capacity) marked "UNROUTED".
 *
 * Output preserves input order.
 */
export function solution(props: Props): Result {

    //greedy: assign the highest value payments to the lowest fee processors first.
    let currencies = [...new Set(props.processors.flatMap(processor => processor.supported_currencies))]
    console.table(currencies)

    let processors = props.processors
        .map(processor => { return { ...processor, remaining: processor.volume_limit_usd } })
        .sort((a, b) => a.fee_percent - b.fee_percent)

    console.table(processors)

    let payments: PaymentWrapper[] = props.payments
        .map((payment, index) => {
            return {
                ...payment,
                sort: index,
                usd: payment.amount * props.rates[payment.currency]
            }
        }).toSorted((a, b) => b.usd - a.usd)
    let processorsByCurrency = Object.fromEntries(currencies.map(currency => [currency, processors.filter(processor => processor.supported_currencies.includes(currency))]))

    console.table(payments)
    console.table(processorsByCurrency)

    for (let payment of payments) {
        let cheapestProcessor = (processorsByCurrency[payment.currency] ?? []).find(processor => processor.remaining >= payment.usd)
        payment.processor = cheapestProcessor
        if (cheapestProcessor != undefined) {
            cheapestProcessor.remaining -= payment.usd
        }
    }
    console.table(payments)

    return payments.toSorted((a, b) => a.sort - b.sort).map(payment => {
        return {
            id: payment.id,
            processor: payment.processor?.name ?? "UNROUTED"
        }
    })
}

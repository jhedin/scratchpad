
type Merchant = string

interface Transaction {
    merchant: Merchant
    amount: number
    timestamp: string
}

interface Payout {
    merchant: Merchant
    payout: number
    fees: number
}

interface Props {
    transactions: Transaction[]
}

type Result = Payout[]

const BATCH_FEE = 5

export function solution({ transactions }: Props): Result {

    const merchantTransactions = Object.groupBy(transactions, transaction => transaction.merchant)
    const payouts = Object.entries(merchantTransactions).map(([merchant, transactions]) => {
        const transactionsByDay = Object.groupBy(transactions ?? [], transaction => parseDate(transaction.timestamp));
        let batchCount = Object.keys(transactionsByDay).length
        return {
            merchant: merchant,
            fees: BATCH_FEE * batchCount,
            payout: transactions?.reduce((sum, next) => sum + next.amount, 0) ?? 0
        }
    })
    console.table(payouts)

    return payouts
}

function parseDate(date: string) {
    return (date.match(/(?<date>[\d-]+)T.*/)?.groups ?? {})["date"]
}

type AccountId = string

interface Account {
    id: AccountId,
    balance: number
}

interface Transfer {
    from: AccountId
    to: AccountId
    amount: number
}

interface Props {
    accounts: Account[]
    threshold: number
}

type Result = Transfer[]

export function solution({ accounts, threshold }: Props): Result {

    let normalizedAccounts = accounts.map(({ id, balance }) => {
        return {
            id: id,
            balance: balance - threshold
        }
    }).filter(({ balance }) => balance != 0)

    if (normalizedAccounts.reduce((sum, next) => sum + next.balance, 0) < 0) throw "There is not enough balance across the accounts to meet the threshold"

    let lowest = normalizedAccounts.toSorted((a, b) => a.balance - b.balance)



    let above = lowest.filter(({ balance }) => balance > 0)
    let below = lowest.filter(({ balance }) => balance < 0)

    let transfers: Transfer[] = []

    //hub model

    let hub = above.pop()
    if (hub == undefined) {
        return []
    }
    let fullBalance = hub.balance
    for (let account of above) {
        transfers.push({
            from: account.id,
            to: hub.id,
            amount: account.balance
        })
        fullBalance += account.balance
    }

    for (let account of below) {
        transfers.push({
            from: hub.id,
            to: account.id,
            amount: -account.balance
        })
        fullBalance += account.balance
    }

    console.log("hub balance", fullBalance)
    console.table(transfers)

    return transfers
}

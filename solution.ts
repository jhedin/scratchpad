
type TransactionId = string

interface Rule {
    rule_id: string,
    flagged_transactions: TransactionId[]
}

interface Props {
    rules: Rule[];
    targetTransactionId: TransactionId
}

type Result = { ruleIds: string[] };


export function solution({ rules, targetTransactionId }: Props): Result {

    let ruleIds = rules
        .filter(rule => rule.flagged_transactions.findIndex(transaction => transaction === targetTransactionId) != -1)
        .map(rule => rule.rule_id)

    console.table(ruleIds)

    return { ruleIds: ruleIds }

}

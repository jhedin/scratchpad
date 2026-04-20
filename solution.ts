
type ChargeId = string

interface Charge {
    id: ChargeId,
    amount: number
}

interface Refund {
    charge_id: ChargeId | null
    amount: number
}

interface Reconciliation {
    id: ChargeId,
    net: number
}

interface Props {
    charges: Charge[];
    refunds: Refund[];
}


type Result = Reconciliation[]

const NO_CHARGE_ID = "NO_CHARGE_ID"

export function solution({ charges, refunds }: Props): Result {

    const refundsByChargeId = Object.groupBy(refunds, refund => refund.charge_id ?? NO_CHARGE_ID)

    const reconciledCharges = charges.map(charge => {
        return {
            id: charge.id,
            amount: charge.amount,
            net: charge.amount - (refundsByChargeId[charge.id]?.reduce((totalRefunds, refund) => { return totalRefunds + refund.amount }, 0) ?? 0)
        }
    })

    const unlabeledRefunds = refundsByChargeId[NO_CHARGE_ID] ?? []

    const reconciledChargesByAmount = Object.groupBy(reconciledCharges, charge => charge.amount)

    let correctedRefunds = refunds.filter(refund => refund.charge_id != null)
    const leftoverRefunds:Refund[] = []
    for (let refund of unlabeledRefunds) {
        let possibleCharges = reconciledChargesByAmount[refund.amount]?.filter(reconciledCharge => reconciledCharge.net >= refund.amount) ?? []
        if (possibleCharges.length > 0) {
            possibleCharges[0].net -= refund.amount

            correctedRefunds.push({
                charge_id: possibleCharges[0].id,
                amount: refund.amount
            })
        } else {
            leftoverRefunds.push(refund)
        }
    }

    const correctedRefundsByChargeId = Object.groupBy(correctedRefunds, refund => refund.charge_id ?? NO_CHARGE_ID)


    const reconciledCorrectedCharges = charges.map(charge => {
        return {
            id: charge.id,
            net: charge.amount - (correctedRefundsByChargeId[charge.id]?.reduce((totalRefunds, refund) => { return totalRefunds + refund.amount }, 0) ?? 0)
        }
    })

    console.table(reconciledCorrectedCharges)


    //leftoverRefunds
    const remainingCharges = reconciledCorrectedCharges.filter(charge => charge.net > 0)




    return reconciledCorrectedCharges

}


type Status = "success" | "failure"

interface ChargeResponse {
    status: Status,
    amount: number
}

interface Constructor {
    chargeCard: (amount: number) => ChargeResponse
}

interface Props {
    key: string;
    amount: number;
    timestamp?: number
}

interface CacheEntry {
    amount: number,
    timestamp?: number,
    chargeResponse: ChargeResponse
}

type Result = boolean;

const ONE_DAY_IN_S = 86400

export function solution(constructor: Constructor) {

    const seen: Record<string, CacheEntry> = {}

    function isExpired(key: string, timestamp?: number) {
        return (timestamp != undefined) // no expiry without a new timestamp? technically incorrect since we know *some* times
            && (timestamp - (seen[key]?.timestamp ?? 0) >= ONE_DAY_IN_S) // if the first call didn't have a timestamp, pretend it happened at time zero ?
    }

    function processRequest({ key, amount, timestamp }: Props): ChargeResponse {
        let chargeResponse: ChargeResponse | undefined

        //expire existing charges
        if (isExpired(key, timestamp)) {
            delete seen[key]
        }

        if (seen[key] == undefined) {
            chargeResponse = constructor.chargeCard(amount)
            seen[key] = {
                amount: amount,
                timestamp: timestamp,
                chargeResponse: chargeResponse
            }
        } else {
            chargeResponse = seen[key].chargeResponse
            if (chargeResponse.amount !== amount) {
                throw `Cached result for ${key}, ${chargeResponse.amount} does not match ${amount}`
            }
        }
        return chargeResponse
    }

    return { processRequest }
}

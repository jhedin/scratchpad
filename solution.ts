
interface Tier {
    capacity: number
    refillPeriod: number
}

interface Constructor {
    tiers: Tier[]
}

export function RateLimiter({ tiers }: Constructor) {

    let ttl = tiers.reduce((max, next) => Math.max(max, next.refillPeriod), 0)

    const userBuckets: Record<string, number[]> = {}

    function checkTier(userTokens: number[], timestamp: number, { capacity, refillPeriod }: Tier) {
        let tierUserTokens = userTokens.filter(requestTime => timestamp - requestTime < refillPeriod)
        console.log(timestamp, capacity, refillPeriod)
        console.table(tierUserTokens)
        if (tierUserTokens.length < capacity) {
            return true
        }
        return false
    }

    return {
        allowRequest: (user: string, timestamp: number): boolean => {
            console.table(userBuckets)

            let userTokens = (userBuckets[user] ?? []).filter(requestTime => timestamp - requestTime < ttl)

            let allowed = tiers.every(tier => checkTier(userTokens, timestamp, tier))

            if (allowed) {
                userTokens.push(timestamp)
            }

            userBuckets[user] = userTokens

            return allowed
        }
    }
}

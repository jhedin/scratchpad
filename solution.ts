


interface Props {
    coins: number[],
    target: number
}

type Result = number

//Given a list of coin denominations (positive integers) and a target amount, return the minimum number of coins needed to make exactly the target. 
// Return -1 if impossible. Coins can be used any number of times (unbounded).
export function solution({ coins, target }: Props): Result {

    let memos = new Array(target + 1).fill(Infinity)
    memos[0] = 0
    console.table(memos)

    for (let coin of coins) {
        for (let i = 0; i <= target; i++) {
            let difference = i - coin
            console.log(coin, i, difference, memos[difference])
            if ((memos[difference] ?? Infinity) != Infinity) {
                memos[i] = Math.min(memos[i], memos[difference] + 1)
            }
        }
        console.table(memos)
    }

    let result = memos[target]
    if (result == Infinity) {
        return -1
    } else {
        return result
    }
}

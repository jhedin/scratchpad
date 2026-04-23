


interface ProduceSubsetsState {
    remaining: number[],
    chosen: number[],
    target: number,
    sum: number
}

interface Props {
    nums: number[]
    target: number
}

interface Result {
    found: boolean,
    subset: number[]
}


/**
 * given nums (array of numbers) and target (number), find all subsets of nums whose sum equals target. Each element can be used at most once (duplicates in nums are treated as distinct positions).
 * @param param0 
 * @returns 
 */
export function solution({ nums, target }: Props): Result {

    console.log(nums, target)

    let foundSolutions: Result[] = new Array(target + 1)
    foundSolutions[0] = {
        found: true,
        subset: []
    }

    for (let i = 1; i <= target; i++) {
        if (!nums.some((value) => {
            if (value > i) {
                return false
            } else {
                let memo = foundSolutions[i - value]
                if (memo.subset.includes(value)) {
                    return false
                }
                if (memo?.found ?? false) {
                    foundSolutions[i] = {
                        found: true,
                        subset: [value, ...memo.subset]
                    }
                    return true
                }
            }
            return false
        })) {
            foundSolutions[i] = {
                found: false,
                subset: []
            }
        }
    }
    console.table(foundSolutions)

    return foundSolutions[target] ?? { found: false, subset: [] }
}






function backtrackingSolution({ nums, target }: Props): Result {

    let solutions: number[][] = []
    let solver = subsetsSolver({
        remaining: nums,
        chosen: [],
        target: target,
        sum: 0
    })

    for (let solution of solver.produceSubsets()) {
        solutions.push(solution)
    }

    return { solutions: solutions }
}


function subsetsSolver(produceSubsetsState: ProduceSubsetsState) {
    let branches: ProduceSubsetsState[] = [produceSubsetsState]
    function serialize() {
        return JSON.stringify(branches)
    }
    function deserialize(serializedBranches: string) {
        branches = JSON.parse(serializedBranches)
    }
    function* produceSubsets(): Generator<number[]> {

        while (branches.length > 0) {
            let state = branches[branches.length - 1]
            if (state == undefined) {
                break
            }
            let { remaining, chosen, target, sum } = state

            if (sum == target) {
                yield chosen
                branches.pop()
                continue
            }
            if (sum > target) {
                branches.pop()
                continue
            }
            if (remaining.length == 0) {
                branches.pop()
                continue
            }
            console.log("produce subsets state:", JSON.stringify({ remaining, chosen, target }))
            branches = [
                ...branches.slice(0, -1),
                {
                    remaining: remaining.slice(1),
                    chosen: chosen,
                    target: target,
                    sum: sum
                },
                {
                    remaining: remaining.slice(1),
                    chosen: [remaining[0], ...chosen],
                    target: target,
                    sum: sum + remaining[0]
                }
            ]
        }
    }

    return {
        produceSubsets,
        serialize,
        deserialize
    }

}





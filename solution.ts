


interface Props {
    nums: number[];
    target: number;
}

type Result = [number, number];

export function solution({ nums, target }: Props): Result {

    throw new Error("No solution found");
}

export function* subsets(nums: number[], include: number[] = []): Generator<number[]> {
    if (nums.length == 0) {
        yield include
        return
    }
    yield* subsets(nums.slice(1), include)
    yield* subsets(nums.slice(1), [nums[0], ...include])
}

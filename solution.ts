


interface Props {
    nums: number[];
    target: number;
}

type Result = [number, number];

export function solution({ nums, target }: Props): Result {
    const seen = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) {
            return [seen.get(complement)!, i];
        }
        seen.set(nums[i], i);
    }
    throw new Error("No solution found");
}

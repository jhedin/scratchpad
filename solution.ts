
interface Interval {
    start: string,
    end: string,
    label: string | "unclaimed"
}

interface Props {
    intervals: Interval[];
    bin: string;
}

type Result = Interval[];

export function solution({ intervals, bin }: Props): Result {

    const sortedIntervals = intervals.toSorted((a, b) => +a.start - +b.start)

    let bounds = {
        start: "0000000000",
        end: "9999999999"
    }

    let extraIntervals: Interval[] = []

    //fix the edges
    if (sortedIntervals.length == 0) {
        return []
    }
    if (sortedIntervals[0].start != bounds.start) {
        extraIntervals.push({
            start: bounds.start,
            end: (+sortedIntervals[0].start - 1).toString().padStart(10, "0"),
            label: "unclaimed"
        })
    }
    if (sortedIntervals[sortedIntervals.length - 1].end != bounds.end) {
        extraIntervals.push({
            start: (+sortedIntervals[sortedIntervals.length - 1].end + 1).toString().padStart(10, "0"),
            end: bounds.end,
            label: "unclaimed"
        })
    }

    console.table(sortedIntervals)
    console.table(extraIntervals)

    for (let i = 1; i < sortedIntervals.length; i++) {
        let interval = {
            start: sortedIntervals[i - 1].end,
            end: sortedIntervals[i].start,
        }
        if (interval.start == interval.end) {

        }
    }

    return [...extraIntervals, ...sortedIntervals].sort((a, b) => +a.start - +b.start)
}

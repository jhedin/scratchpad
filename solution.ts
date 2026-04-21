
interface Props {
    s: string
    t: string
}

type Result = string;
/**
 *  Given two strings s and t, find the shortest substring of s that contains every character of t (with multiplicity — if t has two os, the window must too). Return the substring (or empty string if none
  exists). 
 * @param param0 
 * @returns 
 */
export function solution({ s, t }: Props): Result {
    const tChars = countChars(t)

    let min = Infinity
    let minString = ""

    let start = 0;

    for (let end = 0; end < s.length; end++) {
        while (1) {
            let substring = s.slice(start, end + 1)
            if (charCountEquals(tChars, countChars(substring))) {
                if (substring.length <= min) {
                    console.log("new min")
                    min = substring.length
                    minString = substring
                }
                start++
            } else {
                break
            }
        }
    }

    return minString
}

function countChars(str: string): Record<string, number> {

    return str.split("").sort().reduce((chars, next) => {
        chars[next] = (chars[next] ?? 0) + 1
        return chars
    }, {} as Record<string, number>)
}

function charCountEquals(tChars: Record<string, number>, sChars: Record<string, number>): boolean {
    console.table([tChars, sChars])
    let check = Object.entries(tChars).every(([char, count]) => {
        //console.log("char:", char, count, sChars[char])
        return (sChars[char] ?? 0) >= count
    })
    //console.log(check)
    return check
}

interface Props {
    input: string
    bannedWords: string[]
}

type Result = boolean;

type State = "nothing" | "start of field" | "white space string"
const STATES = {
    nothing: "nothing",
    startOfField: "start of field",
    whiteSpaceString: "white space string"
}

export function solution({ input, bannedWords }: Props): Result {

    let state = STATES.startOfField

    for (let [indexString, char] of Object.entries(input)) {
        let index = +indexString
        switch (state) {
            case STATES.nothing:
                switch (char) {
                    case ",":
                    case "\n":
                        state = STATES.startOfField
                }
                break
            case STATES.startOfField:
                switch (char) {
                    case ",":
                    case "\n":
                        return false
                    case "\"":
                        state = STATES.whiteSpaceString
                        break
                    case " ":
                        break
                    default:
                        state = STATES.nothing
                }
                break;
            case STATES.whiteSpaceString:
                switch (char) {
                    case "\"":
                    case ",":
                    case "\n":
                        return false
                    case " ":
                        break
                    default:
                        state = STATES.nothing
                }
                break;
        }
    }

    let lines = input.split("\n")
    for (let line of lines) {
        if (bannedWords.some(word => line.toLocaleLowerCase().includes(word))) {
            return false
        }
    }

    return true
}

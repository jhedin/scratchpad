import assert from "node:assert/strict";
import { describe, it } from "node:test";
// assert.deepStrictEqual(a, b) — deep equality (arrays, objects, ignores key order)
// assert.strictEqual(a, b)     — primitives (===)
// assert.ok(value)             — truthy check
// assert.throws(() => fn())    — expects an error
import { solution } from "./solution.ts";

describe("solution", () => {
    it("finds two numbers that add up to target", () => {
        const props = {
            bannedWords: ["hell"],
            input: `name,age,city
  Alice,30,NYC
  Bob,25,SF
  Carol,40,LA`};
        const expected = true;
        assert.deepStrictEqual(solution(props), expected);
    });

    it("invalid empty", () => {
        const props = {
            bannedWords: ["hell"],
            input: `name,age,city
  Alice,30,NYC
  Bob,,SF`};
        const expected = false;
        assert.deepStrictEqual(solution(props), expected);
    });

    it("invalid empty string", () => {
        const props = {
            bannedWords: ["hell"],
            input: `name,age,city
  Alice,30,NYC
  Bob,"",SF`};
        const expected = false;
        assert.deepStrictEqual(solution(props), expected);
    });
    it("invalid white space", () => {
        const props = {
            bannedWords: ["hell"],
            input: `name,age,city
  Alice,30,NYC
  Bob,   ,SF`};
        const expected = false;
        assert.deepStrictEqual(solution(props), expected);
    });
    it("invalid white space string", () => {
        const props = {
            bannedWords: ["hell"],
            input: `name,age,city
  Alice,30,NYC
  Bob,"    ",SF`};
        const expected = false;
        assert.deepStrictEqual(solution(props), expected);
    });
    it("invalid first field", () => {
        const props = {
            bannedWords: ["hell"],
            input: `name,age,city
  ,30,NYC
  Bob," sfdf ",SF`};
        const expected = false;
        assert.deepStrictEqual(solution(props), expected);
    });
    it("invalid new line field", () => {
        const props = {
            bannedWords: ["hell"],
            input: `name,age,city
  Alice,30,NYC
  ,"\asdas",SF`};
        const expected = false;
        assert.deepStrictEqual(solution(props), expected);
    });
    it("valid new line field", () => {
        const props = {
            bannedWords: ["hell"],
            input: `name,age,city
  Alice,30,NYC
  Bob,"\asdas",SF
  `};
        const expected = true;
        assert.deepStrictEqual(solution(props), expected);
    });

    it("invalid banned words", () => {
        const props = {
            bannedWords: ["hell"],
            input: `name,age,city
  Alice,30,NYC
  Bob,25,Hellscape`};
        const expected = false;
        assert.deepStrictEqual(solution(props), expected);
    });
});

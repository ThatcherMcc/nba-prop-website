import { describe, it, expect } from "vitest";
import { isDnpMinutes } from "./dnp";

describe("isDnpMinutes", () => {
  it.each([
    ["", true],
    ["Inactive", true],
    ["inactive", true],
    ["INACTIVE", true],
    ["Inact", true],
    ["Did N", true],
    ["0", true],
    ["0:00", true],
    [null, true],
    [undefined, true],
    ["  ", true],
    [" Inactive ", true],
  ])("returns true for DNP value %j", (input, expected) => {
    expect(isDnpMinutes(input)).toBe(expected);
  });

  it.each([
    ["32:15", false],
    ["12:00", false],
    ["1", false],
    ["25:30", false],
    ["0:01", false],
  ])("returns false for played value %j", (input, expected) => {
    expect(isDnpMinutes(input)).toBe(expected);
  });
});

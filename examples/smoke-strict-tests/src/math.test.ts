import { addWholeNumbers } from "./math.js";

describe("math helpers", () => {
	it("adds both operands", () => {
		expect(addWholeNumbers(2, 3)).toBe(5);
	});
});

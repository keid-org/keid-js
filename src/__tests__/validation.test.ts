import { KEID } from "..";

const keid = new KEID();

describe("input and output validation", () => {
	const id = "018be67c-c4d9-449b-20d2-68caad2cf564";
	const encodedId = "9h2Toc19FoFD1VkUghoG8F";
	const timestamp = 1700379018457;
	const date = new Date("2023-11-19T07:30:18.457Z");

	// generate
	test("generate() with valid timestamp input passes", () => {
		expect(() => {
			keid.generate(timestamp);
		}).not.toThrow();
	});

	test("generate() with invalid timestamp input throws", () => {
		expect(() => {
			keid.generate(KEID.MAX_TIMESTAMP + 1);
		}).toThrow();
	});

	// timestamp
	test("timestamp() with valid KEID input passes", () => {
		expect(keid.timestamp(id)).toBe(timestamp);
	});

	test("date() with valid KEID input passes", () => {
		expect(keid.date(id)).toStrictEqual(date);
	});

	/*
	 * ENCODING/DECODING
	 */

	// encode
	test("encode() with valid KEID input passes", () => {
		expect(keid.encode(id)).toBe(encodedId);
	});

	// decode
	test("decode() with valid KEID input passes", () => {
		expect(keid.decode(encodedId)).toBe(id);
	});

	// "invalid string" cannot be conveted to hex
	test("decode() with invalid KEID input returns null", () => {
		expect(keid.decode("invalid string")).toBeNull();
	});

	// decodeOrThrow valid input
	test("decodeOrThrow() with valid KEID input passes", () => {
		expect(keid.decodeOrThrow(encodedId)).toBe(id);
	});

	// decodeOrThrow invalid input
	test("decodeOrThrow() with invalid KEID throws", () => {
		expect(() => keid.decodeOrThrow("invalid string")).toThrow();
	});
});

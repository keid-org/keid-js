import { KEID } from "..";

const base64keid = new KEID({ encodingCharset: "base64url" });
const base58keid = new KEID({ encodingCharset: "base58" });

describe("input and output validation", () => {
	const id = "018be67c-c4d9-449b-20d2-68caad2cf564";
	const base64encodedId = "AYvmfMTZRJsg0mjKrSz1ZA";
	const base58encodedId = "9h2Toc19FoFD1VkUghoG8F";
	const timestamp = 1700379018457;
	const date = new Date("2023-11-19T07:30:18.457Z");

	// generate
	test("generate() with valid timestamp input passes", () => {
		expect(() => {
			base64keid.generate(timestamp);
		}).not.toThrow();
	});

	test("generate() with invalid timestamp input throws", () => {
		expect(() => {
			base64keid.generate(KEID.MAX_TIMESTAMP + 1);
		}).toThrow();
	});

	// timestamp
	test("timestamp() with valid KEID input passes", () => {
		expect(base64keid.timestamp(id)).toBe(timestamp);
	});

	test("date() with valid KEID input passes", () => {
		expect(base64keid.date(id)).toStrictEqual(date);
	});

	/*
	 * ENCODING/DECODING
	 */

	// encode
	test("encode() with valid KEID input passes", () => {
		expect(base64keid.encode(id)).toBe(base64encodedId);
		expect(base58keid.encode(id)).toBe(base58encodedId);
	});

	// decode
	test("decode() with valid KEID input passes", () => {
		expect(base64keid.decode(base64encodedId)).toBe(id);
		expect(base58keid.decode(base58encodedId)).toBe(id);
	});

	// "invalid string" cannot be conveted to hex
	test("decode() with invalid KEID input returns null", () => {
		expect(base64keid.decode("invalid string")).toBeNull();
	});

	// decodeOrThrow valid input
	test("decodeOrThrow() with valid KEID input passes", () => {
		expect(base64keid.decodeOrThrow(base64encodedId)).toBe(id);
	});

	// decodeOrThrow invalid input
	test("decodeOrThrow() with invalid KEID throws", () => {
		expect(() => base64keid.decodeOrThrow("invalid string")).toThrow();
	});
});

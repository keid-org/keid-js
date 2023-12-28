import { KEID } from "..";

const generate = (cycles: number, timestamp?: number) => {
	const keid = new KEID();
	const results = [];

	for (let i = 0; i < cycles; i++) {
		const id = keid.generate(timestamp);
		const time = keid.timestamp(id);
		const date = keid.date(id);
		const encodedKEID = keid.encode(id);
		const decodedKEID = keid.decode(encodedKEID);

		results.push({
			id,
			timestamp: time,
			date,
			encodedKEID,
			decodedKEID,
			encodedIdLength: encodedKEID.length,
		});
	}

	return results;
};

describe("generate() with a seed always returns the same time part", () => {
	const seed = 1676990893495;
	const date = new Date("2023-02-21T14:48:13.495Z");

	test.each(generate(100, seed))("$id -> $timestamp", ({ timestamp: timeResult }) => {
		expect(timeResult).toBe(seed);
	});

	test.each(generate(100, seed))("$id -> $date", ({ date: dateResult }) => {
		expect(dateResult).toStrictEqual(date);
	});
});

describe("generate 1000 KEIDs, encode and decode them to/from Base64URL", () => {
	test.each(generate(1000))(
		"Base64URL encoding: $id -> $encodedKEID -> $decodedKEID",
		({ id, decodedKEID }) => {
			expect(decodedKEID).toBe(id);
		}
	);
});

describe("generate 1000 KEIDs, check if encoded length is the same", () => {
	test.each(generate(1000))(
		`Encoded ID length: $encodedIdLength === ${KEID.ENCODED_LENGTH}`,
		({ encodedIdLength }) => {
			expect(encodedIdLength).toBe(KEID.ENCODED_LENGTH);
		}
	);
});

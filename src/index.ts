import BaseX from "base-x";
import { addHyphens, randomPositive } from "./utils";

export class KEID {
	public static readonly MAX_TIMESTAMP = 2 ** 48 - 1;
	public static readonly MIN_ENCODED_LENGTH = 16;
	public static readonly MAX_ENCODED_LENGTH = 22;
	private static readonly MAX_RANDOM_BIGINT = 2n ** 80n - 1n;

	private lastTimestamp: number;
	private lastRandomPart: string;
	private baseX = BaseX("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");

	/**
	 * Generate a new KEID.
	 * @param timestamp A seed for the time part of the KEID. Max: `281474976710655`
	 * @throws {Error} If `timestamp` is invalid
	 * @return {string} The generated KEID
	 */
	public generate(timestamp?: number) {
		if (typeof timestamp !== "undefined" && (timestamp < 0 || timestamp > KEID.MAX_TIMESTAMP)) {
			throw new Error(
				`KEID generate error: input timestamp is below 0 or exceeds the maximum of ${KEID.MAX_TIMESTAMP}`
			);
		}

		const currentTimestamp = timestamp ?? Date.now();

		// If last timestamp is the same as the current one, create new random part
		// based on the last incremented bigint generated previously.
		// Otherwise generate completely new random sequence.
		if (this.lastTimestamp === currentTimestamp) {
			// Random increment range.
			const randInc = BigInt(randomPositive(65535));
			const lastIntRandomPart = BigInt(`0x${this.lastRandomPart}`);

			// Increment random part. If bigint overflows in hex (all 'f's), restart counter.
			// Add random increment to random part.
			// 10 bytes of randomness
			const incrementedRandomPart = (
				(lastIntRandomPart + randInc >= KEID.MAX_RANDOM_BIGINT ? BigInt(0) : lastIntRandomPart) +
				randInc
			)
				.toString(16)
				.padStart(20, "0");

			this.lastRandomPart = incrementedRandomPart;
		} else {
			// 10 bytes of randomness
			this.lastRandomPart = Array.from(globalThis.crypto.getRandomValues(new Uint8Array(10)))
				.map((b) => b.toString(16))
				.join("")
				.padStart(20, "0");
		}

		this.lastTimestamp = currentTimestamp;
		const timePart = currentTimestamp.toString(16).padStart(12, "0"); // 6 bytes timestamp (ms precision)

		return addHyphens(`${timePart}${this.lastRandomPart}`);
	}

	/**
	 * Generate new KEIDs.
	 * @param count The number of KEIDs to generate
	 * @param timestamp A seed for the time part of the KEID. Max: `281474976710655`
	 * @throws {Error} If `timestamp` is invalid
	 * @return {string[]} The generated KEIDs
	 */
	public generateMany(count: number, timestamp?: number) {
		if (count < 1 || count > 1_000_000) {
			throw new Error(
				"KEID generateMany error: input count is below 1 or exceeds the maximum of 1_000_000"
			);
		}

		const results = [];
		for (let i = 0; i < count; i++) {
			results.push(this.generate(timestamp));
		}

		return results;
	}

	/**
	 * Get timestamp from a KEID.
	 * @param keid A valid KEID
	 * @throws {Error} If `keid` is invalid
	 * @return {number} The timestamp extracted from the KEID
	 */
	public timestamp(keid: string) {
		return parseInt(keid.slice(0, 13).replace("-", ""), 16);
	}

	/**
	 * Get date from a KEID.
	 * @param keid A valid KEID
	 * @throws {Error} If `keid` is invalid
	 * @return {Date} The date extracted from the KEID
	 */
	public date(keid: string) {
		return new Date(this.timestamp(keid));
	}

	/**
	 * Encode a KEID to Base62.
	 * @param keid A valid KEID
	 * @throws {Error} If `keid` is invalid
	 * @return {string} The encoded KEID
	 */
	public encode(keid: string) {
		return this.baseX.encode(Buffer.from(keid.replace(/-/g, ""), "hex"));
	}

	// Shared internal decode method.
	private _decode(encodedKEID: string, throwOnInvalid: false): string | null;
	private _decode(encodedKEID: string, throwOnInvalid: true): string;
	private _decode(encodedKEID: string, throwOnInvalid: boolean) {
		try {
			if (!this.hasValidEncodedLength(encodedKEID)) {
				throw new Error("Invalid encoded KEID length");
			}

			return addHyphens(Buffer.from(this.baseX.decode(encodedKEID)).toString("hex"));
		} catch (e) {
			if (throwOnInvalid) {
				throw e;
			}

			return null;
		}
	}

	/**
	 * Decode a KEID from Base62. If `encodedKEID` is invalid, `null` is returned.
	 * @param encodedKEID A valid KEID encoded in Base662
	 * @return {string | null} The decoded KEID or `null` if `encodedKEID` is invalid
	 */
	public decode(encodedKEID: string) {
		return this._decode(encodedKEID, false);
	}

	/**
	 * Decode a KEID from Base62. If `encodedKEID` is invalid, an error is thrown.
	 * @param encodedKEID A valid KEID encoded in Base62
	 * @return {string} The decoded KEID
	 * @throws {Error} If `encodedKEID` is invalid
	 */
	public decodeOrThrow(encodedKEID: string) {
		return this._decode(encodedKEID, true);
	}

	/**
	 * Check if the encoded KEID has a valid length.
	 *
	 * @param {string} encodedKEID The encoded KEID to be checked.
	 * @return {boolean} True if the encoded KEID has a valid length, otherwise false.
	 */
	public hasValidEncodedLength(encodedKEID: string) {
		return encodedKEID.length >= 16 && encodedKEID.length <= 22;
	}
}

import { randomBytes, randomInt } from "crypto";
import type { EncodingCharset } from "./utils";
import { addHyphens, baseToNum, charsets, numToBase, reverseString } from "./utils";

export type KEIDOpts = {
	encodingCharset?: EncodingCharset;
};

export class KEID {
	public static readonly MAX_TIMESTAMP = 2 ** 48 - 1;
	public static readonly ENCODED_LENGTH = 22;
	private static readonly HEX_ID_LENGTH = 32;
	private static readonly MAX_RANDOM_BIGINT = 2n ** 80n - 1n;

	private lastTimestamp: number;
	private lastIntRandomPart = 0n;
	private encodingCharset: EncodingCharset;

	constructor(opts?: KEIDOpts) {
		this.encodingCharset = opts?.encodingCharset ?? "base64url";
	}

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
			const randInc = BigInt(randomInt(1, 65536));

			// Increment random part. If bigint overflows in hex (all 'f's), restart counter.
			// Add random increment to random part.
			const incrementedIntRandomPart =
				(this.lastIntRandomPart + randInc >= KEID.MAX_RANDOM_BIGINT ? 0n : this.lastIntRandomPart) +
				randInc;

			this.lastIntRandomPart = incrementedIntRandomPart;
		} else {
			this.lastIntRandomPart = BigInt(`0x${randomBytes(10).toString("hex")}`);
		}

		this.lastTimestamp = currentTimestamp;

		const timePart = currentTimestamp.toString(16).padStart(12, "0"); // 6 bytes timestamp (ms precision)
		const randomPart = this.lastIntRandomPart.toString(16).padStart(20, "0"); // 10 bytes of randomness

		return addHyphens(`${timePart}${randomPart}`);
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
	 * Encode a KEID to Base58.
	 * @param keid A valid KEID
	 * @throws {Error} If `keid` is invalid
	 * @return {string} The encoded KEID
	 */
	public encode(keid: string) {
		const hex = keid.replace(/-/g, "");

		if (this.encodingCharset === "base64url") {
			return Buffer.from(hex, "hex").toString("base64url");
		} else {
			return numToBase(BigInt(`0x${reverseString(hex)}`), this.encodingCharset).padStart(
				KEID.ENCODED_LENGTH,
				charsets[this.encodingCharset][0]
			);
		}
	}

	// Shared internal decode method.
	private _decode(encodedKEID: string, throwOnInvalid: false): string | null;
	private _decode(encodedKEID: string, throwOnInvalid: true): string;
	private _decode(encodedKEID: string, throwOnInvalid: boolean) {
		try {
			if (!this.hasValidEncodedLength(encodedKEID)) {
				throw new Error("Invalid encoded KEID length");
			}

			let hex: string;

			if (this.encodingCharset === "base64url") {
				hex = Buffer.from(encodedKEID, "base64url").toString("hex");
			} else {
				const revHex = baseToNum(encodedKEID, this.encodingCharset)
					.toString(16)
					.padStart(KEID.HEX_ID_LENGTH, "0");
				hex = reverseString(revHex);
			}

			if (hex.length !== KEID.HEX_ID_LENGTH) {
				throw new Error("Invalid KEID length");
			}

			return addHyphens(hex);
		} catch (e) {
			if (throwOnInvalid) {
				throw e;
			}

			return null;
		}
	}

	/**
	 * Decode a KEID from Base58. If `encodedKEID` is invalid, `null` is returned.
	 * @param encodedKEID A valid KEID encoded in Base58
	 * @return {string | null} The decoded KEID or `null` if `encodedKEID` is invalid
	 */
	public decode(encodedKEID: string) {
		return this._decode(encodedKEID, false);
	}

	/**
	 * Decode a KEID from Base58. If `encodedKEID` is invalid, an error is thrown.
	 * @param encodedKEID A valid KEID encoded in Base58
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
		return encodedKEID.length === KEID.ENCODED_LENGTH;
	}
}

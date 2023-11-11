import { randomBytes, randomInt } from "crypto";
import { addHyphens, base62ToNum, charset, numToBase62, reverseString } from "./utils";

export class KEID {
	public static MAX_TIMESTAMP = 281474976710655;
	public static ENCODED_LENGTH = 22;
	private static HEX_ID_LENGTH = 32;
	private static MAX_RANDOM_BIGINT = 1208925819614629174706175n;

	private lastTimestamp: number;
	private lastIntRandomPart = 0n;

	/**
	 * Generate a new KEID.
	 * @param timestamp A seed for the time part of the KEID. Max: `281474976710655`
	 */
	generate(timestamp?: number) {
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
	 */
	timestamp(keid: string) {
		return parseInt(keid.slice(0, 13).replace("-", ""), 16);
	}

	/**
	 * Get date from a KEID.
	 * @param keid A valid KEID
	 */
	date(keid: string) {
		return new Date(this.timestamp(keid));
	}

	/**
	 * Encode a KEID to Base62.
	 * @param keid A valid KEID
	 */
	encode(keid: string) {
		const hex = keid.replace(/-/g, "");
		return numToBase62(BigInt(`0x${reverseString(hex)}`)).padStart(KEID.ENCODED_LENGTH, charset[0]);
	}

	// Shared internal decode method.
	private static _decode(encodedKEID: string, throwOnInvalid: false): string | null;
	private static _decode(encodedKEID: string, throwOnInvalid: true): string;
	private static _decode(encodedKEID: string, throwOnInvalid: boolean) {
		try {
			if (encodedKEID.length !== KEID.ENCODED_LENGTH) {
				throw new Error("Invalid encoded KEID length");
			}

			const revHex = base62ToNum(encodedKEID).toString(16).padStart(KEID.HEX_ID_LENGTH, "0");
			const hex = reverseString(revHex);

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
	 * Decode a KEID from Base62. If `encodedKEID` is invalid, `null` is returned.
	 * @param encodedKEID A valid KEID encoded in Base62
	 */
	decode(encodedKEID: string) {
		return KEID._decode(encodedKEID, false);
	}

	/**
	 * Decode a KEID from Base62. If `encodedKEID` is invalid, an error is thrown.
	 * @param encodedKEID A valid KEID encoded in Base62
	 */
	decodeOrThrow(encodedKEID: string) {
		return KEID._decode(encodedKEID, true);
	}
}

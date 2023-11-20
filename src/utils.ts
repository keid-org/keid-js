export function addHyphens(id: string) {
	return (
		id.substring(0, 8) +
		"-" +
		id.substring(8, 12) +
		"-" +
		id.substring(12, 16) +
		"-" +
		id.substring(16, 20) +
		"-" +
		id.substring(20)
	);
}

export function reverseString(s: string) {
	let r = "";

	for (let i = s.length - 1; i >= 0; i--) {
		r += s[i]!;
	}

	return r;
}

// ENCODING

export const charsets = {
	base58: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
};

export type EncodingCharset = "base64url" | keyof typeof charsets;
type NoB64URLCharset = Exclude<EncodingCharset, "base64url">;

export function numToBase(n: bigint, charsetKey: NoB64URLCharset) {
	const charset = charsets[charsetKey];
	const charsetLen = BigInt(charset.length);

	let encoded = "";

	while (n > 0) {
		encoded = charset[Number(n % charsetLen)] + encoded;
		n = n / charsetLen;
	}

	return encoded || charset[0]!;
}

export function baseToNum(s: string, charsetKey: NoB64URLCharset) {
	const charset = charsets[charsetKey];
	const charsetLen = BigInt(charset.length);

	let n = 0n;

	for (let i = 0; i < s.length; i++) {
		const charIdx = charset.indexOf(s[i]!);

		if (charIdx < 0) {
			throw new Error(`KEID decode invalid character: ${s[i]}`);
		}

		n = n * charsetLen + BigInt(charIdx);
	}

	return n;
}
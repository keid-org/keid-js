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

/**
 *
 * @param max Max value (inclusive)
 * @returns Random positive number
 */
export function randomPositive(max: number) {
	return Math.floor(Math.random() * max) + 1;
}

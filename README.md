# [K-sortable Encodable IDentifier](https://github.com/keid-org/keid-js)

A K-sortable encodable unique identifier generator library for Node.js.

## Description

This library is highly inspired by the [ULID spec](https://github.com/ulid/spec), but instead of creating [Crockford's Base32 strings](http://www.crockford.com/base32.html), it generates sequential IDs in a UUID-like hex format. This is super useful for databases like Postgres, that have a `uuid` type to store UUIDs efficiently.

If you instead want to convert ULIDs to UUIDs and vice versa, check out this library: [ulid-uuid-converter](https://github.com/TheEdoRan/ulid-uuid-converter).

If multiple KEIDs are generated within a millisecond by the same instance, the `generate()` method will increment the last characters of the generated KEID.

## Installation

```sh
npm i keid
```

## Usage

```typescript
import { KEID } from "keid";

// Create new instance
const keid = new KEID();

const id = keid.generate();
// outputs: 018bbbfb-14d9-e2ce-3cdc-dc1e1635c865

const timestamp = keid.timestamp(id);
// outputs: 1699665876185

const date = keid.date(id);
// outputs: 2023-11-11T01:24:36.185Z

/* The library also supports encoding/decoding to/from Base62.
 * This is useful for URLs and other similar contexts.
 */

const encoded = keid.encode(id);
// outputs: 2uqlYK5jgvQOOjBGolVOn

const decoded = keid.decode(encoded);
// outputs: 018bbbfb-14d9-e2ce-3cdc-dc1e1635c865

const err = keid.decodeOrThrow("invalid string");
// throws error
```

## Generation

Generation works like this:

```
018673f1-9c2f-8d2a-4d33-a63c7217444a
|-----------| |--------------------|
  timestamp        random  part
   6 bytes           10 bytes
```

Timestamp is in milliseconds. Randomness comes from `crypto.randomBytes()` function.

### K-sorted

Here's the behavior when generating multiple KEIDs within the same millisecond:

<pre>
<code>0187f0b2-b423-a58a-d5cb-febce6<b>970479</b>
0187f0b2-b423-a58a-d5cb-febce6<b>975b64</b>
0187f0b2-b423-a58a-d5cb-febce6<b>978dbf</b>
0187f0b2-b423-a58a-d5cb-febce6<b>97cdb4</b>
0187f0b2-b423-a58a-d5cb-febce6<b>9829de</b>
0187f0b2-b42<b>4</b>-d11d-4298-5fceb4<b>f69767</b> <-- millisecond changed
0187f0b2-b424-d11d-4298-5fceb4<b>f6ec62</b>
0187f0b2-b424-d11d-4298-5fceb4<b>f79591</b>
0187f0b2-b424-d11d-4298-5fceb4<b>f7c4a0</b>
0187f0b2-b424-d11d-4298-5fceb4<b>f8332f</b>
            |                 ||||||
            ms              incremented</code>
</pre>

The generator incremented the last characters of the string for KEIDs generated in the same millisecond.

When timestamp changes, a new random part is generated, as the ID is already sequential (and sortable) thanks to the updated time part.

If the random part (last 80 bits) overflows in the same millisecond, the counter is reset to 0 + random increment.

## License

This project is licensed under the [MIT License](https://github.com/keid-org/keid-js/blob/main/LICENSE).

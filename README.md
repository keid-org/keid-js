# [K-sortable Encodable IDentifier](https://github.com/keid-org/keid-js)

A K-sortable encodable unique identifier generator library for Node.js and browser.

## Description

This library is highly inspired by the [ULID spec](https://github.com/ulid/spec), but instead of creating [Crockford's Base32 strings](http://www.crockford.com/base32.html), it generates K-Sortable IDs in a UUID-like hex format. This is super useful for databases like Postgres, that have a `uuid` type to store UUIDs efficiently.

You can then encode and decode these IDs to and from Base62.

If you instead want to convert ULIDs to UUID-like format and vice versa, check out this library: [ulid-uuid-converter](https://github.com/TheEdoRan/ulid-uuid-converter).

If multiple KEIDs are generated within a millisecond by the same instance, the `generate()` method will increment the last characters of the generated KEID.

## Installation

```sh
npm i keid
```

## Usage

```typescript
import { KEID } from "keid";

// Create a new instance.
const keid = new KEID();

const id = keid.generate();
// 018be67c-c4d9-449b-20d2-68caad2cf564

// You can also generate multiple IDs with generateMany().
const ids = keid.generateMany(5);
// 018beb50-8632-0afe-b1bf-dd037b6e72fb
// 018beb50-8632-0afe-b1bf-dd037b6edbfa
// 018beb50-8633-72a7-6016-0c4c04e1259c
// 018beb50-8633-72a7-6016-0c4c04e14edf
// 018beb50-8633-72a7-6016-0c4c04e16e83

const timestamp = keid.timestamp(id);
// 1700379018457

const date = keid.date(id);
// 2023-11-19T07:30:18.457Z
```

## Encoding
The library also supports encoding/decoding to/from Base62.
This is useful for URLs and other similar contexts.

You can decode encoded IDs with `decode()` or `decodeOrThrow()` methods.
- `decode(encodedId)` will return `null` if `encodedId` is invalid.
- `decodeOrThrow(encodedId)` will throw an error if `encodedId` is invalid.

```typescript
// Generated with keid.generate()
const id = "018be67c-c4d9-449b-20d2-68caad2cf564";

const keid = new KEID();

const encoded = keid.encode(id);
// 2UVteV17LEnHuvX0ix9wE 

const decoded = keid.decode(encoded);
// 018be67c-c4d9-449b-20d2-68caad2cf564

keid.decodeOrThrow("invalid string");
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

Timestamp is in milliseconds. Randomness comes from `crypto.getRandomValues()` function.

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

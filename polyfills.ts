// polyfills.ts
import 'react-native-get-random-values';
import * as ExpoCrypto from 'expo-crypto';
import 'expo-crypto'; // For side effects

console.log('[polyfills.ts] Running polyfills...');

if (typeof global !== 'undefined') {
  if (!global.crypto) {
    // @ts-ignore
    global.crypto = {};
    console.log('[polyfills.ts] Initialized global.crypto');
  }

  if (!global.crypto.subtle && ExpoCrypto.digestStringAsync) { // Check for digestStringAsync
    console.warn('[polyfills.ts] global.crypto.subtle not found. Polyfilling with ExpoCrypto.digestStringAsync.');
    // @ts-ignore
    global.crypto.subtle = {
      digest: async (algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer> => {
        let expoAlgorithm: ExpoCrypto.CryptoDigestAlgorithm;
        // AlgorithmIdentifier can be an object like { name: "SHA-256" } or a string
        const algorithmName = typeof algorithm === 'string' ? algorithm : algorithm.name;

        if (algorithmName === 'SHA-256') {
          expoAlgorithm = ExpoCrypto.CryptoDigestAlgorithm.SHA256;
        } else if (algorithmName === 'SHA-1') { // Add other common ones if needed by other libs
          expoAlgorithm = ExpoCrypto.CryptoDigestAlgorithm.SHA1;
        } else if (algorithmName === 'SHA-512') {
          expoAlgorithm = ExpoCrypto.CryptoDigestAlgorithm.SHA512;
        } else {
          console.error(`[polyfills.ts] Unsupported digest algorithm: ${algorithmName}`);
          throw new Error(`Unsupported digest algorithm: ${algorithmName}`);
        }

        let stringData: string;
        if (data instanceof ArrayBuffer) {
          stringData = new TextDecoder().decode(data);
        } else if (ArrayBuffer.isView(data)) {
          stringData = new TextDecoder().decode((data.buffer as ArrayBuffer).slice(data.byteOffset, data.byteOffset + data.byteLength));
        } else {
          // This should not happen if supabase-js passes a string or ArrayBuffer
          console.error("[polyfills.ts] Unexpected data type for digest:", data);
          throw new Error("Unexpected data type for digest");
        }

        // digestStringAsync with HEX output, then convert hex to ArrayBuffer
        const hashHexString = await ExpoCrypto.digestStringAsync(
          expoAlgorithm,
          stringData,
          { encoding: ExpoCrypto.CryptoEncoding.HEX }
        );

        const buffer = new Uint8Array(hashHexString.length / 2);
        for (let i = 0; i < hashHexString.length; i += 2) {
          buffer[i / 2] = parseInt(hashHexString.substring(i, i + 2), 16);
        }
        return buffer.buffer;
      }
    };
    console.log('[polyfills.ts] Created minimal global.crypto.subtle with a custom digest function using digestStringAsync.');
  } else if (global.crypto.subtle) {
    console.log('[polyfills.ts] global.crypto.subtle already existed or was set by side-effect import.');
  } else {
     console.error('[polyfills.ts] CRITICAL: Neither global.crypto.subtle nor ExpoCrypto.digestStringAsync is available.');
  }

  console.log('[polyfills.ts] global.crypto.subtle exists after attempts:', !!global.crypto?.subtle);
  if (global.crypto?.subtle) {
    console.log('[polyfills.ts] global.crypto.subtle keys:', Object.keys(global.crypto.subtle));
    if (global.crypto.subtle.digest) {
        console.log('[polyfills.ts] global.crypto.subtle.digest is a function:', typeof global.crypto.subtle.digest === 'function');
    }
  }
} else {
  console.error('[polyfills.ts] Global object is not defined. Cannot polyfill crypto.');
}
console.log('[polyfills.ts] Polyfills execution finished.');

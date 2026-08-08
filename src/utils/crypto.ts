// Obfuscation only, not real security: the key is embedded in the app bundle so anyone
// inspecting the source can decrypt a save file. This exists only to stop casual editing
// of the exported .json in a text editor, per DESIGN.md.
const RAW_KEY_B64 = "wV3n8kQeYvT2mZpL7dR4xC9sA1bU6hN0jF5gK8tQ2rM=";

async function getKey(): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(RAW_KEY_B64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

function toB64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromB64(b64: string): BufferSource {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)) as BufferSource;
}

export async function encryptJson(data: unknown): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return JSON.stringify({ iv: toB64(iv), data: toB64(new Uint8Array(ciphertext)) });
}

export async function decryptJson<T>(fileContents: string): Promise<T> {
  const key = await getKey();
  const { iv, data } = JSON.parse(fileContents) as { iv: string; data: string };
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromB64(iv) },
    key,
    fromB64(data),
  );
  return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}

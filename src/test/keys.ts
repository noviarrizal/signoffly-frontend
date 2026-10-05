import { exportPKCS8, exportSPKI, generateKeyPair } from "jose";

/** A throwaway Ed25519 pair for tests. The private half is a PEM, like in the real environment. */
export async function testKeys() {
  const { publicKey, privateKey } = await generateKeyPair("EdDSA", { extractable: true });
  return { publicKey, privatePem: await exportPKCS8(privateKey), publicPem: await exportSPKI(publicKey) };
}
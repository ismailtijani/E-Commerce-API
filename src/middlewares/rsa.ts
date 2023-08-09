import forge from "node-forge";
import RedisCache from "../config/redisCache";
import { RSA_KEYS } from "../constant";

export default class RSAKeyPair {
  private privateKey: forge.pki.rsa.PrivateKey;
  private publicKey: forge.pki.rsa.PublicKey;

  constructor() {
    const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
    this.privateKey = keyPair.privateKey;
    this.publicKey = keyPair.publicKey;
    RedisCache.set(RSA_KEYS, { privateKey: this.privateKey, publicKey: this.publicKey });
    // this.privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    // this.publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  }

  public encrypt(data: string) {
    return this.publicKey.encrypt(data, "RSA-OAEP");
  }

  public decrypt(encryptedData: string) {
    return this.privateKey.decrypt(encryptedData, "RSA-OAEP");
  }

  public sign(data: string) {
    const md = forge.md.sha256.create();
    md.update(data, "utf8");
    const signature = this.privateKey.sign(md);
    return forge.util.encode64(signature);
  }

  public verifySignature(data: string, signature: string): boolean {
    const md = forge.md.sha256.create();
    md.update(data, "utf8");
    const signatureBytes = forge.util.decode64(signature);
    return this.publicKey.verify(md.digest().bytes(), signatureBytes);
  }
}

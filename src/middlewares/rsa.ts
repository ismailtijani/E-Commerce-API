import forge from "node-forge";

class RSAKeyPair {
  private privateKey: forge.pki.rsa.PrivateKey;
  private publicKey: forge.pki.rsa.PublicKey;

  constructor() {
    const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
    this.privateKey = keyPair.privateKey;
    this.publicKey = keyPair.publicKey;
  }

  // private async keysStorage() {
  //   const keys = await Key.create({
  //     privateKey: this.privateKey.toString(),
  //     publicKey: this.publicKey.toString(),
  //   });
  //   console.log(keys);
  //   // const a = await redisCache.set(RSA_KEYS, {
  //   //   privateKey: this.privateKey,
  //   //   publicKey: this.publicKey,
  //   // });
  // }
  public encrypt(data: string) {
    const encryptedData = this.publicKey.encrypt(data, "RSA-OAEP");
    return forge.util.encode64(encryptedData); // Convert encrypted data to Base64 for transmission
  }

  public decrypt(encryptedDataBase64: string) {
    // Decode the Base64-encoded encrypted data
    const encryptedData = forge.util.decode64(encryptedDataBase64);
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

export default new RSAKeyPair();

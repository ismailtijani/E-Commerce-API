"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_forge_1 = __importDefault(require("node-forge"));
class RSAKeyPair {
    constructor() {
        const keyPair = node_forge_1.default.pki.rsa.generateKeyPair({ bits: 2048 });
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
    encrypt(data) {
        const encryptedData = this.publicKey.encrypt(data, "RSA-OAEP");
        return node_forge_1.default.util.encode64(encryptedData); // Convert encrypted data to Base64 for transmission
    }
    decrypt(encryptedDataBase64) {
        // Decode the Base64-encoded encrypted data
        const encryptedData = node_forge_1.default.util.decode64(encryptedDataBase64);
        return this.privateKey.decrypt(encryptedData, "RSA-OAEP");
    }
    sign(data) {
        const md = node_forge_1.default.md.sha256.create();
        md.update(data, "utf8");
        const signature = this.privateKey.sign(md);
        return node_forge_1.default.util.encode64(signature);
    }
    verifySignature(data, signature) {
        const md = node_forge_1.default.md.sha256.create();
        md.update(data, "utf8");
        const signatureBytes = node_forge_1.default.util.decode64(signature);
        return this.publicKey.verify(md.digest().bytes(), signatureBytes);
    }
}
exports.default = new RSAKeyPair();

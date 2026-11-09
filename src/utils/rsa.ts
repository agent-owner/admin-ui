import JSEncrypt from "jsencrypt";

/**
 * 后端可能返回带 PEM 头的公钥，也可能只返回 base64 公钥体，
 * 这里统一转换为 `JSEncrypt` 能识别的 PEM 格式。
 */
const toPublicKeyPem = (publicKey: string): string => {
  const key = publicKey.trim().replace(/\\n/g, "\n");
  if (key.includes("-----BEGIN")) return key;
  const base64 = key.replace(/\s+/g, "");
  const lines = base64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN PUBLIC KEY-----\n${lines.join("\n")}\n-----END PUBLIC KEY-----`;
};

/**
 * 使用后端公钥对密码做 RSA 加密（PKCS#1 v1.5），返回 base64 密文。
 *
 * 注意：该函数只做传输层加密，不能替代 HTTPS，公钥接口本身仍需通过 HTTPS 提供。
 */
export const encryptByPublicKey = (
  plainText: string,
  publicKey: string
): string => {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(toPublicKeyPem(publicKey));
  const cipherText = encryptor.encrypt(plainText);
  if (!cipherText) {
    throw new Error("密码加密失败，请检查后端公钥是否有效");
  }
  return cipherText;
};

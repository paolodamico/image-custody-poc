import * as sodium from "@devtomio/sodium";
import fs from "fs";

// https://libsodium.gitbook.io/doc/public-key_cryptography/sealed_boxes
// https://libsodium.gitbook.io/doc/public-key_cryptography/authenticated_encryption
const main = async (args: string[]): Promise<void> => {
  //const { public_key: orb_public_key, secret_key: orb_private_key } = sodium.crypto_box_keypair();

  const { public_key: user_public_key, secret_key: user_private_key } =
    sodium.crypto_box_keypair();

  const packet = fs.readFileSync("sample-packet.zip");

  const encrypted = sodium.crypto_box_seal(packet, user_public_key);

  fs.writeFileSync("encrypted.box", encrypted);

  console.log(
    "🤫 user secret key",
    Buffer.from(user_private_key).toString("hex")
  );
  console.log(
    "🔑 user public key",
    Buffer.from(user_public_key).toString("hex")
  );
  console.log("✅ encrypted!");
};

main(process.argv)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => console.log(error));

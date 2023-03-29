import * as sodium from "@devtomio/sodium";
import fs from "fs";

const main = async (args: string[]): Promise<void> => {
  let hexPrivateKey: string | undefined, hexPublicKey: string | undefined;

  // Get --sk & --pk from args
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--sk") {
      hexPrivateKey = args[i + 1];
    }
    if (args[i] === "--pk") {
      hexPublicKey = args[i + 1];
    }
  }

  if (!hexPrivateKey) {
    throw new Error("Missing --sk argument");
  }

  if (!hexPublicKey) {
    throw new Error("Missing --pk argument");
  }

  const private_key = Buffer.from(hexPrivateKey, "hex");
  const public_key = Buffer.from(hexPublicKey, "hex");

  const encryptedPacket = fs.readFileSync("encrypted.box");

  const decrypted = sodium.crypto_box_seal_open(
    encryptedPacket,
    public_key,
    private_key
  );
  fs.writeFileSync("decrypted.zip", decrypted);
  console.log("✅ decrypted!");
};

main(process.argv)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => console.log(error));

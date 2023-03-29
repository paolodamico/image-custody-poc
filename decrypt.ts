import * as sodium from "@devtomio/sodium";
import fs from "fs";
import crypto from "crypto";

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

  // Generate authentication challenge (server would generate and send this back)
  const challenge = crypto.randomBytes(16);
  const encryptedChallenge = Buffer.from(
    sodium.crypto_box_seal(challenge, public_key)
  ).toString("hex");
  console.log("One-time challenge to prove key ownership:", encryptedChallenge);

  // Get user response
  const challengeInput = await new Promise((resolve) => {
    console.log(
      "User would send raw challenge to the server. Type anything here."
    );
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (text) => {
      resolve(text);
    });
  });

  // Validate challenge
  const decryptedChallenge = sodium.crypto_box_seal_open(
    Buffer.from(encryptedChallenge, "hex"),
    public_key,
    private_key
  );

  // TODO: Comparison in raw bytes
  if (
    Buffer.from(decryptedChallenge).toString("hex") !=
    Buffer.from(challenge).toString("hex")
  ) {
    throw new Error("Challenge mismatch. User did not prove key ownership.");
  }

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
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

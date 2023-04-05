import { exiftool } from "exiftool-vendored";
import * as jose from "jose";
import crypto from "crypto";
import fs from "fs";

const main = async (args: string[]): Promise<void> => {
  const tags = await exiftool.read("image_signed.jpg");
  const jwt = tags.SerialNumber;
  console.log("JWT from exif: ", jwt);

  if (!jwt) {
    throw new Error("No JWT found in exif metadata. Did you sign the image?");
  }

  const pemPublicKey = `-----BEGIN PUBLIC KEY-----
  MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEq7SDZ5xGdLS4K+LsvxStIISCHYDK
  hKgD/ACiP9QBYsRClq2gySdHzoKB3e44T4uW+Co7Akv2g9E08SFMqLDs6g==
  -----END PUBLIC KEY-----`;

  const publicKey = await jose.importSPKI(pemPublicKey, "ES256");

  const { payload } = await jose.jwtVerify(jwt, publicKey);

  await exiftool.write("image_signed.jpg", { SerialNumber: "" });
  const imageBuffer = fs.readFileSync("image_signed.jpg");
  const hash = crypto.createHash("sha256");
  hash.update(imageBuffer);
  const imageHash = hash.digest();

  if (imageHash.toString("hex") === payload.jti) {
    console.log("✅ verified!");
  } else {
    console.log("❌ signature verification failed!");
  }
};

main(process.argv)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

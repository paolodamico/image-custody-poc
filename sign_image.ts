import { exiftool } from "exiftool-vendored";
import * as jose from "jose";
import crypto from "crypto";
import fs from "fs";

const main = async (args: string[]): Promise<void> => {
  const imageBuffer = fs.readFileSync("image.jpg");

  const { publicKey, privateKey } = await jose.generateKeyPair("ES256");

  console.log("Public key:", await jose.exportSPKI(publicKey));

  const hash = crypto.createHash("sha256");
  hash.update(imageBuffer);
  const imageHash = hash.digest();

  const payload = {
    sub: "0x000000000identity_commitment",
    jti: imageHash.toString("hex"),
  };

  const jwt = await new jose.SignJWT(payload)
    .setIssuedAt(new Date().getTime())
    .setProtectedHeader({
      alg: "ES256",
      typ: "JWT",
      kid: "orb_key_id",
    })
    .sign(privateKey);

  console.log("JWT", jwt);

  const exifData = {
    SerialNumber: jwt,
  };

  console.log("Signing image and storing signature in exif metadata...");

  fs.writeFileSync("image_signed.jpg", imageBuffer);

  await exiftool.write("image_signed.jpg", exifData);

  console.log("✅ signed!");
};

main(process.argv)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

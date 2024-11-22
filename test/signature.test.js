/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable mocha/max-top-level-suites */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import BN from "bn.js";
import { expect } from "chai";

import { ec, maxEcdsaVal, pedersen, sign, verify } from "../src/signature";

const precomputedKeys = require("./keys_precomputed.json");
const testData = require("./signature_test_data.json");
const rfc6979TestData = require("./rfc6979_signature_test_vector.json");

function randomString(characters, length) {
  let result = "";

  for (let i = 0; i < length; ++i) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
function randomHexString(length, leading0x = false) {
  const result = randomString("0123456789ABCDEF", length);
  return leading0x ? `0x${result}` : result;
}

// Tools for testing.
function generateRandomStarkPrivateKey() {
  return randomHexString(63);
}

describe("Key computation", function () {
  it("should derive public key correctly", function () {
    for (const privKey in precomputedKeys) {
      if ({}.hasOwnProperty.call(precomputedKeys, privKey)) {
        // Drop the '0x' prefix.
        const fixedPrivKey = privKey.substring(2);
        const keyPair = ec.keyFromPrivate(fixedPrivKey, "hex");
        const pubKey = `0x${keyPair.getPublic().getX().toString("hex")}`;
        const expectedPubKey = precomputedKeys[privKey];
        expect(expectedPubKey).to.equal(pubKey);
      }
    }
  });
});

describe("Verify", function () {
  // Generate BN of 1.
  const oneBn = new BN("1", 16);

  it("should verify valid signatures", function () {
    const privKey = generateRandomStarkPrivateKey();
    const keyPair = ec.keyFromPrivate(privKey, "hex");
    const keyPairPub = ec.keyFromPublic(keyPair.getPublic(), "BN");
    const msgHash = new BN(randomHexString(61), "hex");
    const msgSignature = sign(keyPair, msgHash);

    expect(verify(keyPair, msgHash.toString(16), msgSignature)).to.be.true;
    expect(verify(keyPairPub, msgHash.toString(16), msgSignature)).to.be.true;
  });

  it("should not verify invalid signature inputs lengths", function () {
    const ecOrder = ec.n;
    const maxMsgHash = maxEcdsaVal.sub(oneBn);
    const maxR = maxEcdsaVal.sub(oneBn);
    const maxS = ecOrder.sub(oneBn).sub(oneBn);
    const maxStarkKey = maxEcdsaVal.sub(oneBn);

    // Test invalid message length.
    expect(() => verify(maxStarkKey, maxMsgHash.add(oneBn).toString(16), { r: maxR, s: maxS })).to.throw(
      "Message not signable, invalid msgHash length."
    );
    // Test invalid r length.
    expect(() => verify(maxStarkKey, maxMsgHash.toString(16), { r: maxR.add(oneBn), s: maxS })).to.throw("Message not signable, invalid r length.");
    // Test invalid w length.
    expect(() => verify(maxStarkKey, maxMsgHash.toString(16), { r: maxR, s: maxS.add(oneBn) })).to.throw("Message not signable, invalid w length.");
    // Test invalid s length.
    expect(() => verify(maxStarkKey, maxMsgHash.toString(16), { r: maxR, s: maxS.add(oneBn).add(oneBn) })).to.throw(
      "Message not signable, invalid s length."
    );
  });

  it("should not verify invalid signatures", function () {
    const privKey = generateRandomStarkPrivateKey();
    const keyPair = ec.keyFromPrivate(privKey, "hex");
    const keyPairPub = ec.keyFromPublic(keyPair.getPublic(), "BN");
    const msgHash = new BN(randomHexString(61), "hex");
    const msgSignature = sign(keyPair, msgHash);

    // Test invalid public key.
    const invalidKeyPairPub = ec.keyFromPublic({ x: keyPairPub.pub.getX().add(oneBn), y: keyPairPub.pub.getY() }, "BN");
    expect(verify(invalidKeyPairPub, msgHash.toString(16), msgSignature)).to.be.false;
    // Test invalid message.
    expect(verify(keyPair, msgHash.add(oneBn).toString(16), msgSignature)).to.be.false;
    expect(verify(keyPairPub, msgHash.add(oneBn).toString(16), msgSignature)).to.be.false;
    // Test invalid r.
    msgSignature.r.iadd(oneBn);
    expect(verify(keyPair, msgHash.toString(16), msgSignature)).to.be.false;
    expect(verify(keyPairPub, msgHash.toString(16), msgSignature)).to.be.false;
    // Test invalid s.
    msgSignature.r.isub(oneBn);
    msgSignature.s.iadd(oneBn);
    expect(verify(keyPair, msgHash.toString(16), msgSignature)).to.be.false;
    expect(verify(keyPairPub, msgHash.toString(16), msgSignature)).to.be.false;
  });
});

describe("Signature", function () {
  it("should sign all message hash lengths", function () {
    const privateKey = "2dccce1da22003777062ee0870e9881b460a8b7eca276870f57c601f182136c";
    const keyPair = ec.keyFromPrivate(privateKey, "hex");
    const publicKey = ec.keyFromPublic(keyPair.getPublic(true, "hex"), "hex");

    function testSignature(msgHash, expectedR, expectedS) {
      const msgSignature = sign(keyPair, msgHash);
      expect(verify(publicKey, msgHash, msgSignature)).to.be.true;
      const { r, s } = msgSignature;
      expect(r.toString(16)).to.equal(expectedR);
      expect(s.toString(16)).to.equal(expectedS);
    }
    // Message hash of length 61.
    testSignature(
      "c465dd6b1bbffdb05442eb17f5ca38ad1aa78a6f56bf4415bdee219114a47",
      "5f496f6f210b5810b2711c74c15c05244dad43d18ecbbdbe6ed55584bc3b0a2",
      "4e8657b153787f741a67c0666bad6426c3741b478c8eaa3155196fc571416f3"
    );

    // Message hash of length 61, with leading zeros.
    testSignature(
      "00c465dd6b1bbffdb05442eb17f5ca38ad1aa78a6f56bf4415bdee219114a47",
      "5f496f6f210b5810b2711c74c15c05244dad43d18ecbbdbe6ed55584bc3b0a2",
      "4e8657b153787f741a67c0666bad6426c3741b478c8eaa3155196fc571416f3"
    );

    // Message hash of length 62.
    testSignature(
      "c465dd6b1bbffdb05442eb17f5ca38ad1aa78a6f56bf4415bdee219114a47a",
      "233b88c4578f0807b4a7480c8076eca5cfefa29980dd8e2af3c46a253490e9c",
      "28b055e825bc507349edfb944740a35c6f22d377443c34742c04e0d82278cf1"
    );

    // Message hash of length 63.
    testSignature(
      "7465dd6b1bbffdb05442eb17f5ca38ad1aa78a6f56bf4415bdee219114a47a1",
      "b6bee8010f96a723f6de06b5fa06e820418712439c93850dd4e9bde43ddf",
      "1a3d2bc954ed77e22986f507d68d18115fa543d1901f5b4620db98e2f6efd80"
    );
  });
});

describe("Pedersen Hash", function () {
  it("should hash correctly", function () {
    for (const hashTestData of [testData.hash_test.pedersen_hash_data_1, testData.hash_test.pedersen_hash_data_2]) {
      expect(pedersen([hashTestData.input_1.substring(2), hashTestData.input_2.substring(2)])).to.equal(hashTestData.output.substring(2));
    }
  });
});

describe("Signature Tests", function () {
  it("should create ecdsa deterministic signatures", function () {
    const privateKey = rfc6979TestData.private_key.substring(2);
    const keyPair = ec.keyFromPrivate(privateKey, "hex");
    let i = 0;
    for (; i < rfc6979TestData.messages.length; i += 1) {
      const msgHash = rfc6979TestData.messages[i].hash.substring(2);
      const msgSignature = sign(keyPair, msgHash);
      const { r, s } = msgSignature;
      expect(r.toString(10)).to.equal(rfc6979TestData.messages[i].r);
      expect(s.toString(10)).to.equal(rfc6979TestData.messages[i].s);
    }
  });
});

import type { ec as EllipticCurve } from 'elliptic'

export declare function getAccountPath(layer: string, application:string, ethereumAddress: string, index: string | number): string
export declare function getKeyPairFromPath(mnemonic: string, path: string): EllipticCurve.KeyPair
export declare function sign(privateKey: EllipticCurve.KeyPair, msgHash: string): EllipticCurve.Signature
export declare function verify(publicKey:  EllipticCurve.KeyPair, msgHash: string, msgSignature: EllipticCurve.Signature): EllipticCurve.Signature
export declare function pedersen(input: any): string
export declare const ec: EllipticCurve;
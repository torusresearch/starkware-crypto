import type { ec, ec as EllipticCurve } from 'elliptic'

export declare function getAccountPath(layer: string, application:string, ethereumAddress: string, index: string | number): string
export declare function getKeyPairFromPath(mnemonic: string, path: string): EllipticCurve.KeyPair
export declare function sign(privateKey: ec.KeyPair, msgHash: string): ec.Signature
export declare function verify(publicKey:  ec.KeyPair, msgHash: string, msgSignature: ec.Signature): ec.Signature
export declare function pedersen(input: any): string
export declare const ec: EllipticCurve;
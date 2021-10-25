import type { ec as EllipticCurve } from 'elliptic'

export declare function getAccountPath(layer: string, application:string, ethereumAddress: string, index: string | number): string
export declare function getKeyPairFromPath(mnemonic: string, path: string): EllipticCurve.KeyPair
export declare const ec: EllipticCurve;
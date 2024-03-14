import {number} from "prop-types";

export namespace Helpers {

    export function getUUIDFromByteArray(bytes: Uint8Array): string {
        if (16 != bytes.length)
            return "";

        let hex = Array.from(bytes, (byte) => ((0 + (byte & 0xFF).toString(16)).slice(-2)));
        let uuid = "";

        for (var i = 0; i < hex.length; i++)
            uuid += ([4, 6, 8, 10].includes(i) ? '-' : '') + hex[i];

        return uuid;
    }

    export function getByteArrayFromUUID(uuid: string): Uint8Array {
        if (36 != uuid.length)
            return new Uint8Array();

        const hex = uuid.replaceAll('-', '');
        if (32 != hex.length)
            return new Uint8Array();

        const bytes = new Uint8Array(16)

        for (let i = 0; i < hex.length; i += 2)
            bytes[i/2] = parseInt(hex.substring(i, i+2), 16);

        return bytes;
    }

    export function getByteArrayFromInt(value: number): Uint8Array {
        if (null == value || 0 > value || 4294967295 < value)
            return new Uint8Array(4);

        const byteArray = new Uint8Array(4);
        byteArray[0] = (value >> 24);
        byteArray[1] = (value >> 16);
        byteArray[2] = (value >> 8);
        byteArray[3] = (value);

        return byteArray;
    }

    export function getIntFromByteArray(bytes: Uint8Array): number {
        if (null == bytes || 4 != bytes.length)
            return 0;

        return Buffer.from(bytes).readIntBE(0, 4);
    }
}
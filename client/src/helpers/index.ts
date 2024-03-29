import base from "base-x";
const base62 = base('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
const base64 = base('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/');

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

        const bytes = new Uint8Array(16);

        for (let i = 0; i < hex.length; i += 2)
            bytes[i/2] = parseInt(hex.substring(i, i+2), 16);

        return bytes;
    }

    export function getHexFromLong(value: number): string {
        const hex = value.toString(16);
        return (0 == hex.length % 2 ? '' : '0') + hex;
    }

    export function getByteArrayFromLong(value: number): Uint8Array {
        const hex = getHexFromLong(value);
        if (16 < hex.length)
            return new Uint8Array(8);
        const hexBytes = new Uint8Array(hex.length / 2);
        const paddingBytes = new Uint8Array(8 - (hex.length / 2));

        for (let i = 0; i < hex.length; i += 2)
            hexBytes[i/2] = parseInt(hex.substring(i, i+2), 16);

        const longBytes = new Uint8Array(8);
        longBytes.set(paddingBytes);
        longBytes.set(hexBytes, paddingBytes.byteLength);
        return longBytes;
    }

    export function getHexLongFromByteArray(value: Uint8Array): string {
        if (8 != value.byteLength)
            return '0000000000000000';

        let hex= '';

        for (let i = 0; i < value.byteLength; i++) {
            let hexByte= value[i].toString(16);
            hex += (2 == hexByte.length ? '' : '0') + hexByte;
        }

        return hex;
    }

    export function getLongFromByteArray(value: Uint8Array): number {
        const hex = getHexLongFromByteArray(value);
        return parseInt(hex, 16);
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

    export function getFlagBytes(event: MessageEvent): Uint8Array {
        if (!event || !event.data || 1 > event.data.byteLength)
            return new Uint8Array([0]);

        return new Uint8Array(event.data, 0, 1).slice(0, 1);
    }

    export function getDataBytes(event: MessageEvent): Uint8Array {
        if (!event || !event.data || 1 > event.data.byteLength)
            return new Uint8Array([0]);

        return new Uint8Array(event.data, 1, event.data.byteLength - 1).slice(0, event.data.byteLength - 1);
    }

    export function encodeBase62(bytes: Uint8Array): string {
        try {
            return base62.encode(bytes);
        } catch (error) {
            console.error(error);
            return '';
        }
    }

    export function decodeBase62(base62String: string): Uint8Array {
        try {
            return base62.decode(base62String);
        } catch (error) {
            console.error(error);
            return new Uint8Array([0]);
        }
    }

    export function encodeBase64(bytes: Uint8Array): string {
        try {
            return base64.encode(bytes);
        } catch (error) {
            console.error(error);
            return '';
        }
    }

    export function decodeBase64(base64String: string): Uint8Array {
        try {
            return base64.decode(base64String);
        } catch (error) {
            console.error(error);
            return new Uint8Array([0]);
        }
    }

    export function getBase62FromUUID(uuid: string): string {
        try {
            const bytes = getByteArrayFromUUID(uuid);
            return base62.encode(bytes);
        } catch (error) {
            console.error(error);
            return '';
        }
    }

    export function getUUIDFromBase62(base62String: string): string {
        try {
            const bytes = base62.decode(base62String);
            return getUUIDFromByteArray(bytes);
        } catch (error) {
            console.error(error);
            return '';
        }
    }

    export function setCookie(cname: string, cvalue: string, exdays?: number) {
        if ('undefined' === typeof document)
            return;

        try {
            let expires = "";
            if (exdays) {
                const d = new Date();
                d.setTime(d.getTime() + (exdays*24*60*60*1000));
                expires = "expires="+ d.toUTCString();
            }

            document.cookie = cname + "=" + cvalue + ";" + (expires ? expires + ";" : "") + "path=/";
        } catch (error) {
            console.error(error);
        }
    }

    export function setCookie30Min(cname: string, cvalue: string) {
        try {
            const d = new Date();
            d.setTime(d.getTime() + (30 * 60 * 1000));
            let expires = "expires="+ d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        } catch (error) {
            console.error(error);
        }
    }

    export function getCookie(cname?: string|null): string {
        if ('undefined' === typeof document)
            return '';

        try {
            let name = cname + "=";
            let decodedCookie = decodeURIComponent(document.cookie);
            let ca = decodedCookie.split(';');
            for(let i = 0; i <ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
        } catch (error) {
            console.error(error);
        }
        return "";
    }

    export async function getDataURLResizeImage(origDataURL: string, maxWidth: number, maxHeight: number, fileType?: string): Promise<string> {
        if (!document)
            return '';

        const img = document.createElement("img");
        img.src = origDataURL;

        return new Promise((resolve) => {
            img.onload = async () => {
                const origCanvas = document.createElement('canvas');
                const origCtx = origCanvas.getContext('2d');
                if (!origCtx)
                    return;

                origCtx.drawImage(img, 0, 0, img.width, img.height);

                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas')

                const ctx = canvas.getContext('2d');
                if (!ctx)
                    return '';

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL(fileType ?? 'image/jpeg'));
            }
        })
    }
}
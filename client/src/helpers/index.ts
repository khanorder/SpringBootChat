import base from "base-x";
import {Defines} from "@/defines";
import {Domains} from "@/domains";
import {jwtDecode} from "jwt-decode";
import isEmpty from "lodash/isEmpty";

const base62 = base('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
const base64 = base('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/');

export namespace Helpers {

    export function mergeBytesPacket(packets: Uint8Array[]): Uint8Array {
        if (1 > packets.length)
            return new Uint8Array(0);

        let mergedPackets = new Uint8Array(0);
        packets.forEach(packet => {
            const combinedPacket = new Uint8Array(mergedPackets.byteLength + packet.byteLength);
            combinedPacket.set(mergedPackets);
            combinedPacket.set(packet, mergedPackets.byteLength);
            mergedPackets = combinedPacket;
        });

        return mergedPackets;
    }

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
            bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);

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
            hexBytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);

        const longBytes = new Uint8Array(8);
        longBytes.set(paddingBytes);
        longBytes.set(hexBytes, paddingBytes.byteLength);
        return longBytes;
    }

    export function getHexLongFromByteArray(value: Uint8Array): string {
        if (8 != value.byteLength)
            return '0000000000000000';

        let hex = '';

        for (let i = 0; i < value.byteLength; i++) {
            let hexByte = value[i].toString(16);
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

    export function getByteArrayFromShortInt(value: number): Uint8Array {
        if (null == value || 0 > value || 4294967295 < value)
            return new Uint8Array(2);

        const byteArray = new Uint8Array(2);
        byteArray[0] = (value >> 8);
        byteArray[1] = (value);

        return byteArray;
    }

    export function getShortIntFromByteArray(bytes: Uint8Array): number {
        if (null == bytes || 2 != bytes.length)
            return 0;

        return Buffer.from(bytes).readIntBE(0, 2);
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
                d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                expires = "expires=" + d.toUTCString();
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
            let expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        } catch (error) {
            console.error(error);
        }
    }

    export function getCookie(cname?: string | null): string {
        if ('undefined' === typeof document)
            return '';

        try {
            let name = cname + "=";
            let decodedCookie = decodeURIComponent(document.cookie);
            let ca = decodedCookie.split(';');
            for (let i = 0; i < ca.length; i++) {
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

    export async function readFile(file: File): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = () => {
                try {
                    let {result} = reader;
                    const fileBytes = new Uint8Array('object' == typeof result ? result as ArrayBuffer : []);
                    const fileBuffer = Buffer.from(fileBytes.buffer, fileBytes.byteOffset, fileBytes.byteLength);
                    const base64 = fileBuffer.toString('base64');
                    resolve(base64);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = (e) => {
                reject('failed to read file');
            }

            reader.readAsArrayBuffer(file)
        });

    }

    export async function getDataURItoBase64(dataURI: string) {
        return dataURI.split(',')[1];
    }

    export function getDataURItoBlob(dataURI: string) {
        return getDataURItoBlobWithMime(dataURI).blob;
    }

    export function getDataURItoBlobWithMime(dataURI: string) {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return {blob: new Blob([ab], {type: mimeString}), mime: mimeString};
    }

    export function getChatRoomOpenTypeName(openType: Defines.RoomOpenType) {
        switch (openType) {
            case Defines.RoomOpenType.PRIVATE:
                return "비공개";

            case Defines.RoomOpenType.PUBLIC:
                return "공개";

            case Defines.RoomOpenType.PREPARED:
                return "준비중";

            default:
                return "";
        }
    }

    export function replacer(key: any, value: any) {
        if (value instanceof Map) {
            return {
                dataType: 'Map',
                value: Array.from(value.entries()),
            };
        } else {
            return value;
        }
    }

    export function reviver(key: any, value: any) {
        if (typeof value === 'object' && value !== null) {
            if (value.dataType === 'Map') {
                return new Map(value.value);
            }
        }
        return value;
    }

    export function mapToObject<V>(map: Map<string, V>): {[p: string]: V} {
        try {
            return Object.fromEntries(map.entries());
        } catch (error) {
            console.error(error);
            return {};
        }
    }

    export function objectToMap<V>(object: {[p: string]: V}): Map<string, V> {
        try {
            return new Map(Object.entries(object));
        } catch (error) {
            console.error(error);
            return new Map();
        }
    }

    export function getAuthedJwt(token: string): Domains.AuthedJwtPayload | null {
        try {
            const decodedJwt: Domains.AuthedJwtPayload = jwtDecode(token);

            if ("undefined" === typeof decodedJwt.jti || isEmpty(decodedJwt.jti)) {
                console.error(`Helpers - getAuthedJwt: JWT id is empty.`);
                return null;
            }

            const tokenType = "undefined" === typeof decodedJwt.tkt ? Defines.TokenType.NONE : decodedJwt.tkt;
            if (Defines.TokenType.NONE === tokenType) {
                console.error(`Helpers - getAuthedJwt: tokenType is empty.`);
                return null;
            }

            const id = "undefined" === typeof decodedJwt.id ? "" : decodedJwt.id;
            if (isEmpty(id)) {
                console.error(`Helpers - getAuthedJwt: userId is empty.`);
                return null;
            }

            const accountType = "undefined" === typeof decodedJwt.accountType ? Defines.AccountType.NONE : decodedJwt.accountType;
            if (Defines.AccountType.NONE === accountType) {
                console.error(`Helpers - getAuthedJwt: accountType is empty.`);
                return null;
            }

            return decodedJwt;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    export function getUserFromToken(token: string): Domains.User | null {
        try {
            if (isEmpty(token))
                return null;

            const decodedJwt = getAuthedJwt(token);
            if (null === decodedJwt)
                return null;

            return new Domains.User(decodedJwt.id ?? "", decodedJwt.accountType ?? Defines.AccountType.NONE, "", "", false, 0);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    export function mergeUserIdCookie(userId: string) {
        setCookie("userId", userId, 365);
    }

    export function getUserIdCookie() {
        return getCookie("userId");
    }

    export function mergeUserInfoCookie(userInfo: Domains.UserInfo): Map<string, Domains.UserInfo> {
        let result = new Map<string, Domains.UserInfo>();

        try {
            if ("undefined" === typeof userInfo.userId || isEmpty(userInfo.userId)) {
                console.log(`Helpers - mergeUserInfoCookie: userId is required to set token user info.`);
                return result;
            }

            if ("undefined" !== typeof userInfo.accessToken && !isEmpty(userInfo.accessToken)) {
                if ("undefined" === typeof userInfo.refreshToken || isEmpty(userInfo.refreshToken)) {
                    console.log(`Helpers - mergeUserInfoCookie: refreshToken is required to generate token user info.`);
                    return result;
                }

                const accessToken = getAuthedJwt(userInfo.accessToken);
                if (!accessToken) {
                    console.log(`Helpers - mergeUserInfoCookie: accessToken is null.`);
                    return result;
                }

                if (Defines.TokenType.ACCESS !== accessToken?.tkt) {
                    console.log(`Helpers - mergeUserInfoCookie: accessToken is not suitable.`);
                    return result;
                }

                if ("undefined" !== typeof userInfo.refreshToken && !isEmpty(userInfo.refreshToken)) {
                    const refreshToken = getAuthedJwt(userInfo.refreshToken);
                    if (!refreshToken) {
                        console.log(`Helpers - mergeUserInfoCookie: refreshToken is null.`);
                        return result;
                    }

                    if (Defines.TokenType.REFRESH !== refreshToken?.tkt) {
                        console.log(`Helpers - mergeUserInfoCookie: refreshToken is not suitable.`);
                        return result;
                    }
                }
            }

            result = getUserInfosCookie() as Map<string, Domains.UserInfo>;
            console.log(`Helpers - mergeUserInfoCookie: ${JSON.stringify(result, replacer)}`);
            if ("undefined" === typeof userInfo.accessToken || isEmpty(userInfo.accessToken) || "undefined" === typeof userInfo.refreshToken || isEmpty(userInfo.refreshToken)) {
                console.log(`Helpers - mergeUserInfoCookie: both tokens are required to generate token user info.`);
                return result;
            }

            result.set(userInfo.userId, userInfo);
            setUserInfosCookie(result);
        } catch (error: any) {
            console.error(`Helpers - mergeUserInfoCookie: ${error.message}`);
        }

        return result;
    }

    export function expireAccessTokenCookie(id: string): Map<string, Domains.UserInfo>|null {
        const result = getUserInfosCookie() as Map<string, Domains.UserInfo>;
        const userInfo = result.get(id);
        if (!userInfo)
            return null;

        userInfo.accessToken = "";
        result.set(userInfo.userId, userInfo);
        setUserInfosCookie(result);
        return result;
    }

    export function expireRefreshTokenCookie(id: string): Map<string, Domains.UserInfo>|null {
        const result = getUserInfosCookie() as Map<string, Domains.UserInfo>;
        const userInfo = result.get(id);
        if (!userInfo)
            return null;

        userInfo.accessToken = "";
        userInfo.refreshToken = "";
        result.set(userInfo.userId, userInfo);
        setUserInfosCookie(result);
        return result;
    }

    export function setUserAccountTypeCookie(id: string, accountType: Defines.AccountType): Map<string, Domains.UserInfo>|null {
        const userInfo = getUserInfoCookie(id);
        if (!userInfo)
            return null;

        userInfo.accountType = accountType;
        return mergeUserInfoCookie(userInfo);
    }

    export function setNickNameCookie(id: string, nickName: string): Map<string, Domains.UserInfo>|null {
        const userInfo = getUserInfoCookie(id);
        if (!userInfo)
            return null;

        userInfo.nickName = nickName;
        return mergeUserInfoCookie(userInfo);
    }

    export function setUserMessageCookie(id: string, message: string): Map<string, Domains.UserInfo>|null {
        const userInfo = getUserInfoCookie(id);
        if (!userInfo)
            return null;

        userInfo.message = message;
        return mergeUserInfoCookie(userInfo);
    }

    export function setUserHaveProfileCookie(id: string, haveProfile: boolean): Map<string, Domains.UserInfo>|null {
        const userInfo = getUserInfoCookie(id);
        if (!userInfo)
            return null;

        userInfo.haveProfile = haveProfile
        if (!haveProfile)
            userInfo.profileImageUrl = Domains.defaultProfileImageUrl;
        return mergeUserInfoCookie(userInfo);
    }

    export function setUserLatestActiveAtCookie(id: string, latestActiveAt: number): Map<string, Domains.UserInfo>|null {
        const userInfo = getUserInfoCookie(id);
        if (!userInfo)
            return null;

        userInfo.latestActiveAt = latestActiveAt;
        return mergeUserInfoCookie(userInfo);
    }

    export function setUserProfileImageCookie(id: string, profileImage: string): Map<string, Domains.UserInfo>|null {
        const userInfo = getUserInfoCookie(id);
        if (!userInfo)
            return null;

        userInfo.haveProfile = !isEmpty(profileImage);
        userInfo.profileImageUrl = isEmpty(profileImage) ? Domains.defaultProfileImageUrl : profileImage;
        return mergeUserInfoCookie(userInfo);
    }

    export function setUserInfosCookie(userInfos: Map<string, Domains.UserInfo>) {
        try {
            const userInfosString = JSON.stringify(userInfos, replacer);
            setCookie("userInfos", userInfosString, 365);
        } catch (error) {
            console.error(error);
        }
    }

    export function getUserInfosCookie(): Map<string, Domains.UserInfo> {
        let result = new Map<string, Domains.UserInfo>();
        try {
            const userInfosString = getCookie("userInfos");
            if (isEmpty(userInfosString))
                return result;

            result = JSON.parse(userInfosString, reviver);
        } catch (error) {
            console.error(error);
        }
        return result;
    }

    export function getUserInfoCookie(id: string): Domains.UserInfo|null {
        const userInfos = getUserInfosCookie();
        let result: Domains.UserInfo|null = null;
        try {
            result = userInfos.get(id) ?? null;
        } catch (error) {
            console.error(error);
        }
        return result;
    }

    export function getCurrentUserInfoCookie(): Domains.UserInfo|null {
        const userInfos = getUserInfosCookie();
        let result: Domains.UserInfo|null = null;
        try {
            result = userInfos.get(getUserIdCookie()) ?? null;
        } catch (error) {
            console.error(error);
        }
        return result;
    }

    export function getUserInfo(id: string, userInfos: {[p: string]: Domains.UserInfo}): Domains.UserInfo {
        const empty: Domains.UserInfo = {
            userId: "",
            accessToken: "",
            refreshToken: "",
            accountType: Defines.AccountType.NONE,
            nickName: "",
            message: "",
            haveProfile: false,
            latestActiveAt: 0,
            profileImageUrl: ""
        };

        if (!userInfos)
            return empty;

        try {
            const userInfosMap = objectToMap(userInfos);
            let userInfo: Domains.UserInfo|undefined|null = null;
            if ("undefined" !== id && !isEmpty(id))
                userInfo = userInfosMap.get(id);

            if (userInfo && !isEmpty(userInfo.userId) && !isEmpty(userInfo.nickName) && !isEmpty(userInfo.refreshToken))
                return userInfo;

            if (0 < userInfosMap.size) {
                const userInfosIterator = userInfosMap.entries();
                if (!userInfosIterator)
                    return empty;

                do {
                    const [userId, userInfo] = userInfosIterator?.next()?.value ?? [];
                    if (userInfo && !isEmpty(userInfo.userId) && !isEmpty(userInfo.nickName) && !isEmpty(userInfo.refreshToken))
                        return userInfo;

                } while (!userInfosIterator.next().done) {
                    const [userId, userInfo] = userInfosIterator?.next()?.value ?? [];
                    if (userInfo && !isEmpty(userInfo.userId) && !isEmpty(userInfo.nickName) && !isEmpty(userInfo.refreshToken))
                        return userInfo;
                }
            }

            return userInfo ?? empty;
        } catch (error) {
            console.error(error);
        }
        return empty;
    }
}
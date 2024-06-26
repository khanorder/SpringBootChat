import {Helpers} from "@/helpers";
import {Errors} from "@/defines/errors";
import {Defines} from "@/defines";
import isEmpty from "lodash/isEmpty";
import {JwtPayload} from "jwt-decode";
import {FingerPrint} from "@/helpers/fingerPrint";

export namespace Domains {

    export const defaultProfileImageUrl: string = '/images/user-circle.svg';
    export const profileImageUrlPrefix: string = '/images/profile/';
    export const profileImageSmallUrlPrefix: string = '/images/profile/small/';
    export const chatImageUrlPrefix: string = '/images/chat/';
    export const chatImageSmallUrlPrefix: string = '/images/chat/small/';

    export interface UserInfo {
        userId: string;
        accessToken: string;
        refreshToken: string;
        accountType: Defines.AccountType;
        nickName: string;
        message: string;
        haveProfile: boolean;
        latestActiveAt: number;
        profileImageUrl: string;
    }

    export interface AuthedJwtPayload extends JwtPayload {
        iss?: string;
        sub?: string;
        aud?: string[] | string;
        exp?: number;
        nbf?: number;
        iat?: number;
        jti?: string;
        tkt?: Defines.TokenType;
        id?: string;
        accountType?: Defines.AccountType;
        userName?: string;
        name?: string;
        nickName?: string;
    }

    export class ChatRoom {
        roomId: string;
        roomName: string;
        openType: Defines.RoomOpenType;
        users: Domains.User[];
        chatDatas: Domains.Chat[];


        constructor(roomId: string, roomName: string, openType: Defines.RoomOpenType, users: Domains.User[], chatDatas: Domains.Chat[]) {
            this.roomId = roomId;
            this.roomName = roomName;
            this.openType = openType;
            this.users = users;
            this.chatDatas = chatDatas;
        }

        addUser(user: User) {
            if (0 <= this.users.findIndex(_ => _.userId == user.userId))
                return;

            this.users.push(user);
        }

        removeUser(userId: string) {
            if (0 > this.users.findIndex(_ => _.userId == userId))
                return;

            this.users = this.users.filter(_ => _.userId != userId);
        }

        addChatData(chatData: Domains.Chat) {
            if (0 <= this.chatDatas.findIndex(_ => _.id == chatData.id))
                return;

            this.chatDatas.push(chatData);
        }
    }

    export class User {
        userId: string;
        accountType: Defines.AccountType;
        nickName: string;
        message: string;
        haveProfile: boolean;
        latestActive: number;
        profileImageUrl: string = defaultProfileImageUrl;
        online: boolean;

        constructor(userId: string, accountType: Defines.AccountType, nickName: string, message: string, haveProfile: boolean, latestActive: number, online?: boolean) {
            this.userId = userId;
            this.accountType = accountType;
            this.nickName = nickName;
            this.message = message;
            this.haveProfile = haveProfile;
            this.latestActive = latestActive;
            this.profileImageUrl = defaultProfileImageUrl;
            this.online = online ? online : false;
        }

        updateProfile(profileImageUrl: string) {
            if (isEmpty(profileImageUrl)) {
                this.haveProfile = false;
                this.profileImageUrl = defaultProfileImageUrl;
            } else {
                this.haveProfile = true;
                this.profileImageUrl = profileImageUrl;
            }
        }
    }

    export class SendMessage {
        id: string;
        type: Defines.ChatType;
        roomId: string;
        message: string;

        constructor(id: string, type: Defines.ChatType, roomId: string, message: string) {
            this.id = id;
            this.type = type;
            this.roomId = roomId;
            this.message = message;
        }
    }

    export class Chat {
        type: Defines.ChatType;
        roomId: string;
        userId: string;
        id: string;
        time: number;
        message: string;

        constructor(type: Defines.ChatType, roomId: string, userId: string, id: string, time: number, message: string) {
            this.type = type;
            this.roomId = roomId;
            this.userId = userId;
            this.id = id;
            this.time = time;
            this.message = message;
        }

        static decode(bytes: Uint8Array) {
            try {
                const type = bytes[0];
                const bytesRoomId= bytes.slice(1, 17);
                const roomId= Helpers.getUUIDFromByteArray(bytesRoomId);
                const bytesUserId = bytes.slice(17, 33);
                const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                const bytesId = bytes.slice(33, 49);
                const id = Helpers.getUUIDFromByteArray(bytesId);
                const bytesTime = bytes.slice(49, 57);
                const time = Helpers.getLongFromByteArray(bytesTime);
                const nickNameByteLength = bytes[57];
                const bytesMessageByteLength = bytes.slice(58, 62);
                const messageByteLength = Helpers.getIntFromByteArray(bytesMessageByteLength);
                const bytesNickName = bytes.slice(62, 62 + nickNameByteLength);
                const nickName = new TextDecoder().decode(bytesNickName);
                const bytesMessage = bytes.slice(62 + nickNameByteLength, 62 + nickNameByteLength + messageByteLength);
                const message = new TextDecoder().decode(bytesMessage);

                return new Chat(type, roomId, userId, id, time, message);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class Notification {
        id: string;
        type: Defines.NotificationType;
        sendAt: number;
        isCheck: boolean;
        message: string;
        targetId: string;
        url: string;

        constructor(id: string, type: Defines.NotificationType, sendAt: number, idCheck: boolean, message?: string, targetId?: string, url?: string) {
            this.id = id;
            this.type = type;
            this.sendAt = sendAt > 0 ? sendAt : 0;
            this.isCheck = idCheck;
            this.message = message ?? "";
            this.targetId = targetId ?? "";
            this.url = url ?? "";
        }
    }

    export class SaveVisitRequest {
        session: string = '';
        fingerPrint: FingerPrint|null = null;
        host: string = '';
        parameter: string = '';
        path: string = '';
        title: string = '';
        localTime: Date = new Date();
    }

    export class Visit {
        session: string = '';
        fp: number = 0;
        deviceType: string = '';
        deviceVendor: string = '';
        deviceModel: string = '';
        agent: string = '';
        browser: string = '';
        browserVersion: string = '';
        engine: string = '';
        engineVersion: string = '';
        os: string = '';
        osVersion: string = '';
        host: string = '';
        parameter: string = '';
        path: string = '';
        title: string = '';
        localTime: Date = new Date();

        constructor(
            session: string,
            fp: number,
            deviceType: string,
            deviceVendor: string,
            deviceModel: string,
            agent: string,
            browser: string,
            browserVersion: string,
            engine: string,
            engineVersion: string,
            os: string,
            osVersion: string,
            host: string,
            parameter: string,
            path: string,
            title: string,
            localTime: Date
        ) {
            this.session = session;
            this.fp = fp;
            this.deviceType = deviceType;
            this.deviceVendor = deviceVendor;
            this.deviceModel = deviceModel;
            this.agent = agent;
            this.browser = browser;
            this.browserVersion = browserVersion;
            this.engine = engine;
            this.engineVersion = engineVersion;
            this.os = os;
            this.osVersion = osVersion;
            this.host = host;
            this.parameter = parameter;
            this.path = path;
            this.title = title;
            this.localTime = localTime;
        }
    }

    export class CheckConnectionRes {
        result: Errors.CheckConnection;
        serverVersionMain: number;
        serverVersionUpdate: number;
        serverVersionMaintenance: number;

        constructor(result: Errors.CheckConnection, serverVersionMain: number, serverVersionUpdate: number, serverVersionMaintenance: number) {
            this.result = result;
            this.serverVersionMain = serverVersionMain;
            this.serverVersionUpdate = serverVersionUpdate;
            this.serverVersionMaintenance = serverVersionMaintenance;
        }

        static decode(bytes: Uint8Array) {
            try {
                return new CheckConnectionRes(bytes[0], bytes[1] ?? 0, bytes[2] ?? 0, bytes[3] ?? 0);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class CheckAuthenticationRes {
        result: Errors.CheckAuth;
        haveProfile: boolean;
        latestActive: number;
        nickName: string;
        userMessage: string;
        token: string;
        refreshToken: string;

        constructor(result: Errors.CheckAuth, haveProfile: boolean, latestActive: number, nickName: string, userMessage: string, token: string, refreshToken: string) {
            this.result = result;
            this.haveProfile = haveProfile;
            this.latestActive = latestActive;
            this.nickName = nickName;
            this.userMessage = userMessage;
            this.token = token;
            this.refreshToken = refreshToken;
        }

        static decode(bytes: Uint8Array) {
            try {
                const offsetResult: number = 1;
                const offsetHaveProfile = offsetResult + 1;
                const offsetLatestActive = offsetHaveProfile + 8;
                const offsetNickNameLength = offsetLatestActive + 1;
                const offsetMessageLength = offsetNickNameLength + 1;
                const offsetAccessTokenLength = offsetMessageLength + 2;
                const offsetRefreshTokenLength = offsetAccessTokenLength + 2;
                const haveProfile: boolean = bytes[offsetResult] > 0;
                const bytesLatestActive = bytes.slice(offsetHaveProfile, offsetLatestActive);
                const latestActive = Helpers.getLongFromByteArray(bytesLatestActive);
                const nickNameLength = bytes[offsetLatestActive];
                const messageLength = bytes[offsetNickNameLength];
                const bytesAccessTokenLength = bytes.slice(offsetMessageLength, offsetAccessTokenLength);
                const accessTokenLength = Helpers.getShortIntFromByteArray(bytesAccessTokenLength);
                const bytesRefreshTokenLength = bytes.slice(offsetAccessTokenLength, offsetRefreshTokenLength);
                const refreshTokenLength = Helpers.getShortIntFromByteArray(bytesRefreshTokenLength);
                const offsetNickName = offsetRefreshTokenLength + nickNameLength;
                const offsetMessage = offsetNickName + messageLength;
                const offsetAccessToken = offsetMessage + accessTokenLength;
                const offsetRefreshToken = offsetAccessToken + refreshTokenLength;
                const bytesNickName = bytes.slice(offsetRefreshTokenLength, offsetNickName);
                const nickName = new TextDecoder().decode(bytesNickName);
                const bytesMessage = bytes.slice(offsetNickName, offsetMessage);
                const message = new TextDecoder().decode(bytesMessage);
                const bytesAccessToken = bytes.slice(offsetMessage, offsetAccessToken);
                const accessToken = new TextDecoder().decode(bytesAccessToken);
                let refreshToken = "";
                if (0 < refreshTokenLength) {
                    const bytesRefreshToken = bytes.slice(offsetAccessToken, bytes.byteLength);
                    refreshToken = new TextDecoder().decode(bytesRefreshToken);
                }

                return new CheckAuthenticationRes(bytes[0], haveProfile, latestActive, nickName, message, accessToken, refreshToken);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class SignInRes {
        result: Errors.SignIn;

        constructor(result: Errors.SignIn) {
            this.result = result;
        }

        static decode(bytes: Uint8Array) {
            try {
                return new SignInRes(bytes[0]);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class SignOutRes {
        result: Errors.SignOut;

        constructor(result: Errors.SignOut) {
            this.result = result;
        }

        static decode(bytes: Uint8Array) {
            try {
                return new SignOutRes(bytes[0]);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class DemandRefreshTokenRes {
        userId: string;

        constructor(userId: string) {
            this.userId = userId;
        }

        static decode(bytes: Uint8Array) {
            try {
                if (16 !== bytes.byteLength)
                    return new DemandRefreshTokenRes("");

                const bytesUserId = bytes.slice(0, 16);
                const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                return new DemandRefreshTokenRes(userId);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class AccessTokenExpiredRes {
        userId: string;

        constructor(userId: string) {
            this.userId = userId;
        }

        static decode(bytes: Uint8Array) {
            try {
                if (16 !== bytes.byteLength)
                    return new AccessTokenExpiredRes("");

                const bytesUserId = bytes.slice(0, 16);
                const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                return new AccessTokenExpiredRes(userId);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class RefreshTokenExpiredRes {
        userId: string;

        constructor(userId: string) {
            this.userId = userId;
        }

        static decode(bytes: Uint8Array) {
            try {
                if (16 !== bytes.byteLength)
                    return new RefreshTokenExpiredRes("");

                const bytesUserId = bytes.slice(0, 16);
                const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                return new RefreshTokenExpiredRes(userId);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class NotificationRes {
        notificationType: Defines.NotificationType;
        id: string;
        sendAt: number;
        isCheck: boolean;
        message: string;
        targetId: string;
        url: string;

        constructor(type: Defines.NotificationType, id: string, sendAt: number, isCheck: boolean, message: string, targetId: string, url: string) {
            this.notificationType = type;
            this.id = id;
            this.sendAt = sendAt;
            this.isCheck = isCheck;
            this.targetId = targetId;
            this.message = message;
            this.url = url;
        }

        static decode(bytes: Uint8Array) {
            try {
                const notificationType: Defines.NotificationType = bytes[0];
                const offsetType = 1;
                const offsetId = offsetType + 16;
                const offsetSendAt = offsetId + 8;
                const offsetIsCheck = offsetSendAt + 1;
                const offsetTargetId = offsetIsCheck + 16;

                const bytesId = bytes.slice(offsetType, offsetId);
                const id = Helpers.getUUIDFromByteArray(bytesId);
                const bytesSendAt = bytes.slice(offsetId, offsetSendAt);
                const sendAt = Helpers.getLongFromByteArray(bytesSendAt);
                const isCheck = bytes[offsetSendAt] > 0;
                const bytesTargetId = bytes.slice(offsetIsCheck, offsetTargetId);
                const targetId = Helpers.getUUIDFromByteArray(bytesTargetId);

                switch (notificationType) {
                    case Defines.NotificationType.FOLLOWER:
                        return new NotificationRes(notificationType, id, sendAt, isCheck, "", targetId, "");

                    case Defines.NotificationType.START_CHAT:
                        const bytesStartChatRoomId = bytes.slice(offsetTargetId, offsetTargetId + 16);
                        const startChatRoomId = Helpers.getUUIDFromByteArray(bytesStartChatRoomId);
                        return new NotificationRes(notificationType, id, sendAt, isCheck, "", targetId, startChatRoomId);

                    case Defines.NotificationType.ADD_USER_CHAT_ROOM:
                        const bytesAddChatRoomId = bytes.slice(offsetTargetId, offsetTargetId + 16);
                        const addChatRoomId = Helpers.getUUIDFromByteArray(bytesAddChatRoomId);
                        return new NotificationRes(notificationType, id, sendAt, isCheck, "", targetId, addChatRoomId);

                    // case Defines.NotificationType.ADD_USER_CHAT_ROOM:
                    //     const offsetUrlLength = offsetTargetId + 4;
                    //     const offsetMessageLength = offsetUrlLength + 4;
                    //     const bytesUrlLength = bytes.slice(offsetTargetId, offsetUrlLength);
                    //     const urlLength = Helpers.getIntFromByteArray(bytesUrlLength);
                    //     const bytesMessageLength = bytes.slice(offsetUrlLength, offsetMessageLength);
                    //     const messageLength = Helpers.getIntFromByteArray(bytesMessageLength);
                    //     const bytesUrl = bytes.slice(offsetMessageLength, offsetMessageLength + urlLength);
                    //     const url = new TextDecoder().decode(bytesUrl);
                    //     const bytesMessage = bytes.slice(offsetMessageLength + urlLength, offsetMessageLength + urlLength + messageLength);
                    //     const message = new TextDecoder().decode(bytesMessage);
                    //     return new NotificationRes(notificationType, id, sendAt, isCheck, message, targetId, url);

                    default:
                        console.error("Not suitable notification notificationType.");
                        return null;
                }
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class NotificationsStartChatRes {
        notifications: Domains.Notification[];

        constructor(notifications: Domains.Notification[]) {
            this.notifications = notifications;
        }

        static decode(bytes: Uint8Array) {
            try {
                const result: Notification[] = [];
                const count: number = bytes[0];
                if (1 > count)
                    return new NotificationsStartChatRes(result);

                const offsetCount = 1;
                const offsetId = offsetCount + (16 * count);
                const offsetSendAt = offsetId + (8 * count);
                const offsetIsCheck = offsetSendAt + count;
                const offsetTargetId = offsetIsCheck + (16 * count);

                for (let i = 0; i < count; i++) {
                    const bytesId= bytes.slice(offsetCount + (i * 16), offsetCount + ((i + 1) * 16));
                    const id = Helpers.getUUIDFromByteArray(bytesId);
                    const bytesSendAt = bytes.slice(offsetId + (i * 8), offsetId + ((i + 1) * 8));
                    const sendAt = Helpers.getLongFromByteArray(bytesSendAt);
                    const isCheck = bytes[offsetSendAt + i] > 0;
                    const bytesTargetId = bytes.slice(offsetIsCheck + (i * 16), offsetIsCheck + ((i + 1) * 16));
                    const targetId = Helpers.getUUIDFromByteArray(bytesTargetId);
                    const bytesChatRoomId = bytes.slice(offsetTargetId + (i * 16), offsetTargetId + ((i + 1) * 16));
                    const chatRoomId = Helpers.getUUIDFromByteArray(bytesChatRoomId);
                    result.push(new Notification(id, Defines.NotificationType.START_CHAT, sendAt, isCheck, "", targetId, chatRoomId));
                }
                return new NotificationsFollowerRes(result);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class NotificationsFollowerRes {
        notifications: Domains.Notification[];

        constructor(notifications: Domains.Notification[]) {
            this.notifications = notifications;
        }

        static decode(bytes: Uint8Array) {
            try {
                const result: Notification[] = [];
                const count: number = bytes[0];
                if (1 > count)
                    return new NotificationsFollowerRes(result);

                const offsetCount = 1;
                const offsetId = offsetCount + (16 * count);
                const offsetSendAt = offsetId + (8 * count);
                const offsetIsCheck = offsetSendAt + count;

                for (let i = 0; i < count; i++) {
                    const bytesId= bytes.slice(offsetCount + (i * 16), offsetCount + ((i + 1) * 16));
                    const id = Helpers.getUUIDFromByteArray(bytesId);
                    const bytesSendAt = bytes.slice(offsetId + (i * 8), offsetId + ((i + 1) * 8));
                    const sendAt = Helpers.getLongFromByteArray(bytesSendAt);
                    const isCheck = bytes[offsetSendAt + i] > 0;
                    const bytesTargetId = bytes.slice(offsetIsCheck + (i * 16), offsetIsCheck + ((i + 1) * 16));
                    const targetId = Helpers.getUUIDFromByteArray(bytesTargetId);
                    result.push(new Notification(id, Defines.NotificationType.FOLLOWER, sendAt, isCheck, "", targetId, ""));
                }
                return new NotificationsFollowerRes(result);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class CheckNotificationRes {
        result: Errors.CheckNotification;
        id: string;

        constructor(result: Errors.CheckNotification, id: string) {
            this.result = result;
            this.id = id;
        }

        static decode(bytes: Uint8Array) {
            try {
                const result = bytes[0];
                let id = "";
                if (Errors.CheckNotification.NONE == result) {
                    const bytesId = bytes.slice(1, 17);
                    id = Helpers.getUUIDFromByteArray(bytesId);
                }
                return new CheckNotificationRes(result, id);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class RemoveNotificationRes {
        result: Errors.RemoveNotification;
        id: string;

        constructor(result: Errors.RemoveNotification, id: string) {
            this.result = result;
            this.id = id;
        }

        static decode(bytes: Uint8Array) {
            try {
                const result = bytes[0];
                let id = "";
                if (Errors.RemoveNotification.NONE == result) {
                    const bytesId = bytes.slice(1, 17);
                    id = Helpers.getUUIDFromByteArray(bytesId);
                }
                return new RemoveNotificationRes(result, id);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class LatestActiveUsersRes {
        users: Domains.User[];

        constructor(users?: Domains.User[]) {
            this.users = 'undefined' != typeof users && null != users ? users : [];
        }

        static decode(bytes: Uint8Array) {
            try {
                if (1 > bytes.byteLength || 0 < bytes.byteLength % 16)
                    return new Domains.LatestActiveUsersRes([]);

                const userCount = bytes.byteLength / 16;
                const users: Domains.User[] = [];

                for (let i = 0; i < userCount; i++) {
                    const bytesUserId = bytes.slice((i * 16), ((i + 1) * 16));
                    const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                    users.push(new Domains.User(userId, Defines.AccountType.NONE, "", "", false, 0, true));
                }

                return new LatestActiveUsersRes(users);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class ConnectedUsersRes {
        users: Domains.User[];

        constructor(users?: Domains.User[]) {
            this.users = 'undefined' != typeof users && null != users ? users : [];
        }

        static decode(bytes: Uint8Array) {
            try {
                if (1 > bytes.byteLength || 0 < bytes.byteLength % 16)
                    return new Domains.ConnectedUsersRes([]);

                const userCount = bytes.byteLength / 16;
                const users: Domains.User[] = [];

                for (let i = 0; i < userCount; i++) {
                    const bytesUserId = bytes.slice((i * 16), ((i + 1) * 16));
                    const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                    users.push(new Domains.User(userId, Defines.AccountType.NONE, "", "", false, 0, true));
                }

                return new ConnectedUsersRes(users);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class FollowsRes {
        users: Domains.User[];

        constructor(users?: Domains.User[]) {
            this.users = 'undefined' != typeof users && null != users ? users : [];
        }

        static decode(bytes: Uint8Array) {
            try {
                if (1 > bytes.byteLength || 0 < bytes.byteLength % 16)
                    return new Domains.FollowsRes([]);

                const userCount = bytes.byteLength / 16;
                const users: Domains.User[] = [];

                for (let i = 0; i < userCount; i++) {
                    const bytesUserId = bytes.slice((i * 16), ((i + 1) * 16));
                    const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                    users.push(new Domains.User(userId, Defines.AccountType.NONE, "", "", false, 0, true));
                }

                return new FollowsRes(users);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class FollowersRes {
        users: Domains.User[];

        constructor(users?: Domains.User[]) {
            this.users = 'undefined' != typeof users && null != users ? users : [];
        }

        static decode(bytes: Uint8Array) {
            try {
                if (1 > bytes.byteLength || 0 < bytes.byteLength % 16)
                    return new Domains.FollowersRes([]);

                const userCount = bytes.byteLength / 16;
                const users: Domains.User[] = [];

                for (let i = 0; i < userCount; i++) {
                    const bytesUserId = bytes.slice((i * 16), ((i + 1) * 16));
                    const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                    users.push(new Domains.User(userId, Defines.AccountType.NONE, "", "", false, 0, true));
                }

                return new FollowersRes(users);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class ChatRoomsRes {
        roomIds: string[];
        roomOpenTypes: Defines.RoomOpenType[];
        userCounts: number[];
        roomNames: string[];

        constructor(roomIds: string[], roomOpenTypes: Defines.RoomOpenType[], userCounts: number[], roomNames: string[]) {
            this.roomIds = roomIds;
            this.roomOpenTypes = roomOpenTypes;
            this.userCounts = userCounts;
            this.roomNames = roomNames;
        }

        static decode(bytes: Uint8Array) {
            try {
                const bytesRoomCount= bytes.slice(0, 4);
                const offsetRoomCount = 4;
                const roomCount= Helpers.getIntFromByteArray(bytesRoomCount);
                const offsetRoomIds = 4 + (roomCount * 16);
                const offsetRoomOpenTypes = offsetRoomIds + roomCount;
                const offsetUserCount = offsetRoomOpenTypes + (4 * roomCount);
                let offsetRoomName = offsetUserCount + roomCount;
                const roomIds: string[] = [];
                const roomOpenTypes: Defines.RoomOpenType[] = [];
                const userCounts: number[] = [];
                const roomNames: string[] = [];

                for (let i = 0; i < roomCount; i++) {
                    const bytesRoomId= bytes.slice(offsetRoomCount + (i * 16), offsetRoomCount + ((i + 1) * 16));
                    const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                    const roomOpenType: Defines.RoomOpenType = bytes[offsetRoomIds + i];
                    let bytesUserCount= bytes.slice(offsetRoomOpenTypes + (i * 4), offsetRoomOpenTypes + ((i + 1) * 4));
                    let userCount = Helpers.getIntFromByteArray(bytesUserCount);
                    let bytesRoomNameLength= bytes[offsetUserCount + i];
                    let bytesRoomName = bytes.slice(offsetRoomName, offsetRoomName + bytesRoomNameLength);
                    let roomName =  new TextDecoder().decode(bytesRoomName);
                    roomIds.push(roomId);
                    roomOpenTypes.push(roomOpenType);
                    userCounts.push(userCount);
                    roomNames.push(roomName);
                    offsetRoomName += bytesRoomNameLength;
                }

                return new ChatRoomsRes(roomIds, roomOpenTypes, userCounts, roomNames);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class NoticeConnectedUserRes {
        user: Domains.User|null;

        constructor(user?: Domains.User) {
            this.user = 'undefined' != typeof user && null != user ? user : null;
        }

        static decode(bytes: Uint8Array) {
            try {
                const bytesId = bytes.slice(0, 16);
                const id = Helpers.getUUIDFromByteArray(bytesId);
                return new NoticeConnectedUserRes(new Domains.User(id, Defines.AccountType.NONE, "", "", false, 0, true));
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class NoticeDisconnectedUserRes {
        userId: string;

        constructor(userId: string) {
            this.userId = userId;
        }

        static decode(bytes: Uint8Array) {
            try {
                const bytesUserId = bytes.slice(0, 16);
                const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                return new NoticeDisconnectedUserRes(userId);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class GetTokenUserInfoRes {
        result: Errors.GetTokenUserInfo;
        userId: string;
        haveProfile: boolean;
        nickName: string;

        constructor(result: Errors.GetTokenUserInfo, userId: string, haveProfile: boolean, nickName: string) {
            this.result = result;
            this.userId = userId;
            this.haveProfile = haveProfile;
            this.nickName = nickName;
        }

        static decode(bytes: Uint8Array) {
            try {
                const offsetResult: number = 1;
                const offsetUserId = offsetResult + 16;
                const offsetHaveProfile = offsetUserId + 1;
                const offsetNickNameLength = offsetHaveProfile + 1;
                const nickNameLength = bytes[offsetHaveProfile];
                const offsetNickName = offsetNickNameLength + nickNameLength;
                const bytesUserId = bytes.slice(offsetResult, offsetUserId);
                const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                const haveProfile: boolean = bytes[offsetUserId] > 0;
                const bytesNickName = bytes.slice(offsetNickNameLength, offsetNickName);
                const nickName = new TextDecoder().decode(bytesNickName);

                return new GetTokenUserInfoRes(bytes[0], userId, haveProfile, nickName);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class GetOthersUserInfoRes {
        result: Errors.GetOthersUserInfo;
        user: Domains.User|null;

        constructor(result: Errors.GetOthersUserInfo, user?: Domains.User) {
            this.result = result;
            this.user = 'undefined' != typeof user && null != user ? user : null;
        }

        static decode(bytes: Uint8Array) {
            try {
                const haveProfile = bytes[1] > 0;
                const offsetHaveProfile = 2;
                const offsetId = offsetHaveProfile + 16;
                const offsetLatestActive = offsetId + 8;
                const offsetOnline = offsetLatestActive + 1;
                const offsetNameLength = offsetOnline + 1;
                const offsetMessageLength = offsetNameLength + 1;
                const bytesId = bytes.slice(offsetHaveProfile, offsetId);
                const id = Helpers.getUUIDFromByteArray(bytesId);
                const bytesLatestActive = bytes.slice(offsetId, offsetLatestActive);
                const latestActive = Helpers.getLongFromByteArray(bytesLatestActive);
                const online = bytes[offsetLatestActive] > 0;
                const nameLength = bytes[offsetOnline];
                const messageLength = bytes[offsetNameLength];
                const bytesName = bytes.slice(offsetMessageLength, offsetMessageLength + nameLength)
                const name = new TextDecoder().decode(bytesName);
                const bytesMessage = bytes.slice(offsetMessageLength + nameLength, offsetMessageLength + nameLength + messageLength)
                const message = new TextDecoder().decode(bytesMessage);
                return new GetOthersUserInfoRes(bytes[0], new Domains.User(id, Defines.AccountType.NONE, name, message, haveProfile, latestActive, online));
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class FollowRes {
        result: Errors.Follow;
        user: Domains.User|null

        constructor(result: Errors.Follow, user: Domains.User|null) {
            this.result = result;
            this.user = user ?? null;
        }

        static decode(bytes: Uint8Array) {
            try {
                let user: Domains.User|null = null;
                if (1 < bytes.byteLength) {
                    const bytesId = bytes.slice(1, 17);
                    const id = Helpers.getUUIDFromByteArray(bytesId);
                    user = new Domains.User(id, Defines.AccountType.NONE, "", "", false, 0, false);
                }
                return new FollowRes(bytes[0], user);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class UnfollowRes {
        result: Errors.Unfollow;
        userId: string

        constructor(result: Errors.Unfollow, userId: string) {
            this.result = result;
            this.userId = userId;
        }

        static decode(bytes: Uint8Array) {
            try {
                let userId: string = "";
                if (1 < bytes.byteLength) {
                    const bytesUserId = bytes.slice(1, 17);
                    userId = Helpers.getUUIDFromByteArray(bytesUserId);
                }
                return new UnfollowRes(bytes[0], userId);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class FollowerRes {
        user: Domains.User|null

        constructor(user: Domains.User|null) {
            this.user = user ?? null;
        }

        static decode(bytes: Uint8Array) {
            try {
                let user: Domains.User|null = null;
                if (1 < bytes.byteLength) {
                    const bytesId = bytes.slice(0, 16);
                    const id = Helpers.getUUIDFromByteArray(bytesId);
                    user = new Domains.User(id, Defines.AccountType.NONE, "", "", false, 0, false);
                }
                return new FollowerRes(user);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class UnfollowerRes {
        userId: string

        constructor(userId: string) {
            this.userId = userId;
        }

        static decode(bytes: Uint8Array) {
            try {
                let userId: string = "";
                if (1 < bytes.byteLength) {
                    const bytesUserId = bytes.slice(0, 16);
                    userId = Helpers.getUUIDFromByteArray(bytesUserId);
                }
                return new UnfollowerRes(userId);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class StartChatRes {
        result: Errors.StartChat;
        roomId: string;
        roomOpenType: Defines.RoomOpenType;
        userCount: number;
        roomName: string;

        constructor(result: Errors.StartChat, roomId: string, roomOpenType: Defines.RoomOpenType, userCount: number, roomName: string) {
            this.result = result;
            this.roomId = roomId;
            this.roomOpenType = roomOpenType;
            this.userCount = userCount;
            this.roomName = roomName;
        }

        static decode(bytes: Uint8Array) {
            try {
                const offsetRoomId = 17;
                const offsetRoomOpenType = offsetRoomId + 1;
                const offsetUserCount = offsetRoomOpenType + 4
                const offsetRoomNameLength = offsetUserCount + 1;
                const bytesRoomId = bytes.slice(1, offsetRoomId);
                const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                const roomOpenType = bytes[offsetRoomId];
                const bytesUserCount = bytes.slice(offsetRoomOpenType, offsetUserCount);
                const userCount = Helpers.getIntFromByteArray(bytesUserCount);
                const roomNameLength = bytes[offsetUserCount];
                const bytesRoomName = bytes.slice(offsetRoomNameLength, offsetRoomNameLength + roomNameLength);
                const roomName = new TextDecoder().decode(bytesRoomName);
                return new StartChatRes(bytes[0], roomId, roomOpenType, userCount, roomName);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class OpenPreparedChatRoomRes {
        roomId: string;

        constructor(roomId: string) {
            this.roomId = roomId;
        }

        static decode(bytes: Uint8Array) {
            try {
                const bytesRoomId = bytes.slice(0, 16);
                const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                return new OpenPreparedChatRoomRes(roomId);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class NoticeNickNameChangedRes {
        userId: string;
        nickName: string;

        constructor(userId: string, nickName: string) {
            this.userId = userId;
            this.nickName = nickName;
        }

        static decode(bytes: Uint8Array) {
            try {
                const offsetUserId = 16;
                const bytesUserId = bytes.slice(0, offsetUserId);
                const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                const bytesNickName = bytes.slice(offsetUserId, bytes.byteLength);
                const nickName = new TextDecoder().decode(bytesNickName);
                return new NoticeNickNameChangedRes(userId, nickName);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class NoticeUserMessageChangedRes {
        userId: string;
        userMessage: string;

        constructor(userId: string, userMessage: string) {
            this.userId = userId;
            this.userMessage = userMessage;
        }

        static decode(bytes: Uint8Array) {
            try {
                const offsetUserId = 16;
                const bytesUserId = bytes.slice(0, offsetUserId);
                const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                const bytesUserMessage = bytes.slice(offsetUserId, bytes.byteLength);
                const userMessage = new TextDecoder().decode(bytesUserMessage);
                return new NoticeUserMessageChangedRes(userId, userMessage);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class ChangeUserProfileRes {
        result: Errors.ChangeUserProfile;

        constructor(result: Errors.ChangeUserProfile) {
            this.result = result;
        }

        static decode(bytes: Uint8Array) {
            try {
                return new ChangeUserProfileRes(bytes[0]);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class NoticeUserProfileChangedRes {
        userId: string;

        constructor(userId: string) {
            this.userId = userId;
        }

        static decode(bytes: Uint8Array) {
            try {
                const offsetUserId = 16;
                const bytesUserId = bytes.slice(0, offsetUserId);
                const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                return new NoticeUserProfileChangedRes(userId);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class RemoveUserProfileRes {
        result: Errors.RemoveUserProfile;

        constructor(result: Errors.RemoveUserProfile) {
            this.result = result;
        }

        static decode(bytes: Uint8Array) {
            try {
                return new RemoveUserProfileRes(bytes[0]);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class NoticeUserProfileRemovedRes {
        userId: string;

        constructor(userId: string) {
            this.userId = userId;
        }

        static decode(bytes: Uint8Array) {
            try {
                const offsetUserId = 16;
                const bytesUserId = bytes.slice(0, offsetUserId);
                const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                return new NoticeUserProfileRemovedRes(userId);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class SignInProps {
        accessToken: string;
        refreshToken: string;
        user: Domains.User;

        constructor(token: string, refreshToken: string, user: Domains.User) {
            this.accessToken = token;
            this.refreshToken = refreshToken;
            this.user = user;
        }
    }

    export class SignInReq {
        userName: string;
        password: string;

        constructor(userName: string, password: string) {
            this.userName = userName;
            this.password = password;
        }
    }

    export class CreateChatRoomReq {
        openType: Defines.RoomOpenType;
        roomName: string;
        userIds: string[];

        constructor(openType: Defines.RoomOpenType, roomName: string, userIds: string[]) {
            this.openType = openType;
            this.roomName = roomName;
            this.userIds = userIds;
        }
    }

    export class CreateChatRoomRes {
        result: Errors.CreateChatRoom;
        roomId: string;

        constructor(result: Errors.CreateChatRoom, roomId: string) {
            this.result = result;
            this.roomId = roomId;
        }

        static decode(bytes: Uint8Array) {
            try {
                const bytesRoomId = bytes.slice(1, 17);
                const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                return new CreateChatRoomRes(bytes[0], roomId);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class AddChatRoomRes {
        roomId: string;
        roomOpenType: Defines.RoomOpenType;
        roomUserCount: number;
        roomName: string;

        constructor(roomId: string, roomOpenType: Defines.RoomOpenType, roomUserCount: number, roomName: string) {
            this.roomId = roomId;
            this.roomOpenType = roomOpenType;
            this.roomName = roomName;
            this.roomUserCount = roomUserCount;
        }

        static decode(bytes: Uint8Array) {
            try {
                const bytesRoomId= bytes.slice(0, 16);
                const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                const roomOpenType: Defines.RoomOpenType = bytes[16];
                const bytesRoomUserCount= bytes.slice(17, 21);
                const roomUserCount = Helpers.getIntFromByteArray(bytesRoomUserCount);
                const bytesRoomName = bytes.slice(21, bytes.byteLength);
                const roomName =  new TextDecoder().decode(bytesRoomName);

                return new AddChatRoomRes(roomId, roomOpenType, roomUserCount, roomName);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class RemoveChatRoomRes {
        result: Errors.RemoveChatRoom
        roomId: string;

        constructor(result: Errors.RemoveChatRoom, roomId: string) {
            this.result = result;
            this.roomId = roomId;
        }

        static decode(bytes: Uint8Array) {
            try {
                const bytesRoomId= bytes.slice(1, 17);
                const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);

                return new RemoveChatRoomRes(bytes[0], roomId);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class ExitChatRoomRes {
        result: Errors.ExitChatRoom;

        constructor(result: Errors.ExitChatRoom) {
            this.result = result;
        }

        static decode(bytes: Uint8Array): ExitChatRoomRes|null {
            try {
                return new ExitChatRoomRes(bytes[0]);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class EnterChatRoomRes {
        result: Errors.EnterChatRoom;
        roomId: string;

        constructor(result: Errors.EnterChatRoom, roomId: string) {
            this.result = result;
            this.roomId = roomId;
        }

        static decode(bytes: Uint8Array) {
            try {
                const bytesRoomId = bytes.slice(1, 17);
                const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);

                return new EnterChatRoomRes(bytes[0], roomId);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class UpdateChatRoomRes {
        roomId: string;
        userIds: string[];

        constructor(roomId: string, userIds: string[]) {
            this.roomId = roomId;
            this.userIds = userIds;
        }

        static decode(bytes: Uint8Array) {
            try {
                const offsetRoomId = 16;
                const offsetUserCount = offsetRoomId + 4;
                const bytesRoomId= bytes.slice(0, offsetRoomId);
                const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                const bytesUserCount= bytes.slice(offsetRoomId, offsetUserCount);
                const userCount= Helpers.getIntFromByteArray(bytesUserCount);
                const userIds: string[] = [];
                for (let i = 0; i < userCount; i++) {
                    let offsetUserId= offsetUserCount + (i * 16);
                    let bytesUserId= bytes.slice(offsetUserId, offsetUserId + 16);
                    let userId = Helpers.getUUIDFromByteArray(bytesUserId);
                    userIds.push(userId);
                }

                return new UpdateChatRoomRes(roomId, userIds);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class NoticeAddChatRoomUserRes {
        roomId: string;
        userId: string;

        constructor(roomId: string, userId: string) {
            this.roomId = roomId;
            this.userId = userId;
        }

        static decode(bytes: Uint8Array) {
            try {
                const offsetRoomId = 16;
                const offsetUserId = offsetRoomId + 16;
                const bytesRoomId= bytes.slice(0, offsetRoomId);
                const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                const bytesUserId= bytes.slice(offsetRoomId, offsetUserId);
                const userId = Helpers.getUUIDFromByteArray(bytesUserId);

                return new NoticeAddChatRoomUserRes(roomId, userId);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class NoticeRemoveChatRoomUserRes {
        roomId: string;
        userId: string;

        constructor(roomId: string, userId: string) {
            this.roomId = roomId;
            this.userId = userId;
        }

        static decode(bytes: Uint8Array) {
            try {
                const offsetRoomId = 16;
                const offsetUserId = offsetRoomId + 16;
                const bytesRoomId= bytes.slice(0, offsetRoomId);
                const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                const bytesUserId= bytes.slice(offsetRoomId, offsetUserId);
                const userId = Helpers.getUUIDFromByteArray(bytesUserId);

                return new NoticeRemoveChatRoomUserRes(roomId, userId);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class NoticeEnterChatRoomRes {
        roomId: string;
        nickName: string;

        constructor(roomId: string, nickName: string) {
            this.roomId = roomId;
            this.nickName = nickName;
        }

        static decode(bytes: Uint8Array) {
            try {
                const bytesRoomId = bytes.slice(0, 16);
                const bytesNickName = bytes.slice(16, bytes.byteLength);
                const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                const nickName= new TextDecoder().decode(bytesNickName);
                return new NoticeEnterChatRoomRes(roomId, nickName);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class NoticeExitChatRoomRes {
        roomId: string;
        nickName: string;

        constructor(roomId: string, nickName: string) {
            this.roomId = roomId;
            this.nickName = nickName;
        }

        static decode(bytes: Uint8Array) {
            try {
                const bytesRoomId = bytes.slice(0, 16);
                const bytesNickName = bytes.slice(16, bytes.byteLength);
                const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                const nickName= new TextDecoder().decode(bytesNickName);
                return new NoticeExitChatRoomRes(roomId, nickName);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class NoticeChangeNickNameChatRoomRes {
        roomId: string;
        oldNickName: string;
        newNickName: string;

        constructor(roomId: string, oldNickName: string, newNickName: string) {
            this.roomId = roomId;
            this.oldNickName = oldNickName;
            this.newNickName = newNickName;
        }

        static decode(bytes: Uint8Array) {
            try {
                const bytesRoomId = bytes.slice(0, 16);
                const oldNickNameLength = bytes[16];
                const bytesOldNickName = bytes.slice(17, 17 + oldNickNameLength);
                const bytesNewNickName = bytes.slice(17 + oldNickNameLength, bytes.byteLength);
                const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                const oldNickName= new TextDecoder().decode(bytesOldNickName);
                const newNickName= new TextDecoder().decode(bytesNewNickName);
                return new NoticeChangeNickNameChatRoomRes(roomId, oldNickName, newNickName);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class HistoryChatRoomRes {
        roomId: string;
        chatIds: string[];
        userIds: string[];
        types: Defines.ChatType[];
        sendAts: number[];
        messages: string[];

        constructor(roomId: string, chatIds: string[], userIds: string[], types: Defines.ChatType[], sendAts: number[], messages: string[]) {
            this.roomId = roomId;
            this.chatIds = chatIds;
            this.userIds = userIds;
            this.types = types;
            this.sendAts = sendAts;
            this.messages = messages;
        }

        static decode(bytes: Uint8Array) {
            try {
                const count = Helpers.getIntFromByteArray(bytes.slice(0, 4));
                const roomId: string = Helpers.getUUIDFromByteArray(bytes.slice(4, 20));
                const chatIds: string[] = [];
                const userIds: string[] = [];
                const types: Defines.ChatType[] = [];
                const sendAts: number[] = [];
                const messageLengths: number[] = [];
                const messages: string[] = [];

                const offsetBytesRoomId = 20;
                const offsetBytesChatIds = offsetBytesRoomId + (16 * count);
                const offsetBytesUserIds = offsetBytesChatIds + (16 * count);
                const offsetBytesTypes = offsetBytesUserIds + (count);
                const offsetBytesSendAts = offsetBytesTypes + (count * 8);
                const offsetBytesMessageLength = offsetBytesSendAts + (4 * count);

                for (let i = 0; i < count; i++) {
                    let bytesChatId = bytes.slice(offsetBytesRoomId + (i * 16), offsetBytesRoomId + ((i + 1) * 16));
                    chatIds.push(Helpers.getUUIDFromByteArray(bytesChatId));

                    let bytesUserId = bytes.slice(offsetBytesChatIds + (i * 16), offsetBytesChatIds + ((i + 1) * 16));
                    userIds.push(Helpers.getUUIDFromByteArray(bytesUserId));

                    let type = bytes[offsetBytesUserIds + i];
                    types.push(type as Defines.ChatType);

                    let bytesSendAt = bytes.slice(offsetBytesTypes + (i * 8), offsetBytesTypes + ((i + 1) * 8));
                    sendAts.push(Helpers.getLongFromByteArray(bytesSendAt));

                    let bytesMessage = bytes.slice(offsetBytesSendAts + (i * 4), offsetBytesSendAts + ((i + 1) * 4));
                    messageLengths.push(Helpers.getIntFromByteArray(bytesMessage));
                }

                let offsetBytesMessages = offsetBytesMessageLength;
                for (let i = 0; i < messageLengths.length; i++) {
                    let bytesMessage = bytes.slice(offsetBytesMessages, offsetBytesMessages + messageLengths[i]);
                    messages.push(new TextDecoder().decode(bytesMessage));
                    offsetBytesMessages += messageLengths[i];
                }

                return new Domains.HistoryChatRoomRes(roomId, chatIds, userIds, types, sendAts, messages);
            } catch (error) {
                console.error(error);
                return null;
            }
        }

        getChatHistories(): Domains.Chat[] {
            const histories: Domains.Chat[] = [];
            try {
                for (let i = 0; i < this.chatIds.length; i++) {
                    histories.push(new Chat(this.types[i], this.roomId, this.userIds[i], this.chatIds[i], this.sendAts[i], this.messages[i]));
                }
            } catch (error) {
                console.error(error);
            }
            return histories;
        }
    }

    export class TalkChatRoomRes {
        result: Errors.TalkChatRoom;
        type: Defines.ChatType;
        roomId: string;
        userId: string;
        id: string;
        time: number;
        message: string;

        constructor(result: Errors.TalkChatRoom, type: Defines.ChatType, roomId: string, userId: string, id: string, time: number, message: string) {
            this.result = result;
            this.type = type;
            this.roomId = roomId;
            this.userId = userId;
            this.id = id;
            this.time = time;
            this.message = message;
        }

        static decode(bytes: Uint8Array) {
            try {
                const offsetResult = 1;
                const result = bytes[0];
                if (1 == bytes.length)
                    return new TalkChatRoomRes(result, Defines.ChatType.TALK, '', '', '', (new Date()).getTime(), '');

                const offsetType = offsetResult + 1;
                const offsetRoomId = offsetType + 16;
                const offsetUserId = offsetRoomId + 16;
                const offsetId = offsetUserId + 16;
                const offsetTime = offsetId + 8;
                const offsetMessageBytesLength = offsetTime + 4;
                const type = bytes[offsetResult];
                const bytesRoomId= bytes.slice(offsetType, offsetRoomId);
                const roomId= Helpers.getUUIDFromByteArray(bytesRoomId);
                const bytesUserId = bytes.slice(offsetRoomId, offsetUserId);
                const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                const bytesId = bytes.slice(offsetUserId, offsetId);
                const id = Helpers.getUUIDFromByteArray(bytesId);
                const bytesTime = bytes.slice(offsetId, offsetTime);
                const time = Helpers.getLongFromByteArray(bytesTime);
                const bytesMessageByteLength = bytes.slice(offsetTime, offsetMessageBytesLength);
                const messageByteLength = Helpers.getIntFromByteArray(bytesMessageByteLength);
                const bytesMessage = bytes.slice(offsetMessageBytesLength, offsetMessageBytesLength + messageByteLength);
                const message = new TextDecoder().decode(bytesMessage);

                return new TalkChatRoomRes(result, type, roomId, userId, id, time, message);
            } catch (error) {
                console.error(error);
                return null;
            }
        }

        getChatData() {
            return new Chat(this.type, this.roomId, this.userId, this.id, this.time, this.message);
        }
    }

    export class SaveUserProfileReq {
        mime: Defines.AllowedImageType;
        bytesLarge: Uint8Array;
        bytesSmall: Uint8Array;

        constructor(mime: Defines.AllowedImageType, largeData: Uint8Array, smallData: Uint8Array) {
            this.mime = mime;
            this.bytesLarge = largeData;
            this.bytesSmall = smallData;
        }
    }

    export class SubscriptionRequest {
        subscription: PushSubscription;

        constructor(subscription: PushSubscription) {
            this.subscription = subscription;
        }
    }

    export class UploadChatImageRequest {
        chatId: string;
        roomId: string;
        mime: Defines.AllowedImageType;
        base64Original: string;
        base64Large: string;
        base64Small: string;

        constructor(chatId: string, roomId: string, mime: Defines.AllowedImageType, base64Original: string, base64Large: string, base64Small: string) {
            this.chatId = chatId;
            this.roomId = roomId;
            this.mime = mime;
            this.base64Original = base64Original;
            this.base64Large = base64Large;
            this.base64Small = base64Small;
        }
    }

    export class DownloadChatImageRequest {
        chatId: string;

        constructor(chatId: string) {
            this.chatId = chatId;
        }
    }

    export class DownloadChatImageResponse {
        result: Errors.DownloadChatImage;
        mime: string;
        fileBase64: string;
        fileName: string;

        constructor(result: Errors.DownloadChatImage, mime: string, fileBase64: string, fileName: string) {
            this.result = result;
            this.mime = mime;
            this.fileBase64 = fileBase64;
            this.fileName = fileName;
        }
    }

    export class SignUpRequest {
        userName: string;
        password: string;
        token: string;

        constructor(userName: string, password: string, token: string) {
            this.userName = userName;
            this.password = password;
            this.token = token;
        }
    }

    export class SignUpResponse {
        result: Errors.SignUp;
        accessToken: string;
        refreshToken: string;

        constructor(result: Errors.SignUp, accessToken?: string, refreshToken?: string) {
            this.result = result;
            this.accessToken = accessToken ?? "";
            this.refreshToken = refreshToken ?? "";
        }
    }

    export class SignInRequest {
        userName: string;
        password: string;

        constructor(userName: string, password: string) {
            this.userName = userName;
            this.password = password;
        }
    }

    export class SignInResponse {
        result: Errors.SignIn;
        accessToken: string;
        refreshToken: string;

        constructor(result: Errors.SignIn, accessToken: string, refreshToken: string) {
            this.result = result;
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
        }
    }

    export class ChangePasswordRequest {
        password: string;
        newPassword: string;
        newPasswordConfirm: string;

        constructor(password: string, newPassword: string, newPasswordConfirm: string) {
            this.password = password;
            this.newPassword = newPassword;
            this.newPasswordConfirm = newPasswordConfirm;
        }
    }

    export class ChangePasswordResponse {
        result: Errors.ChangePassword;

        constructor(result: Errors.ChangePassword) {
            this.result = result;
        }
    }
}

import {Helpers} from "@/helpers";
import {Errors} from "@/defines/errors";
import {Defines} from "@/defines";

export namespace Domains {

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
        userName: string;
        message: string;
        haveProfile: boolean;
        latestActive: number;
        online: boolean;

        constructor(userId: string, userName: string, message: string, haveProfile: boolean, latestActive: number, online?: boolean) {
            this.userId = userId;
            this.userName = userName;
            this.message = message;
            this.haveProfile = haveProfile;
            this.latestActive = latestActive;
            this.online = online ?? false;
        }
    }

    export class SendMessage {
        type: Defines.ChatType;
        id: string;
        roomId: string;
        message: string;

        constructor(type: Defines.ChatType, id: string, roomId: string, message: string) {
            this.type = type;
            this.id = id;
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
        userName: string;
        message: string;

        constructor(type: Defines.ChatType, roomId: string, userId: string, id: string, time: number, userName: string, message: string) {
            this.type = type;
            this.roomId = roomId;
            this.userId = userId;
            this.id = id;
            this.time = time;
            this.userName = userName;
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
                const userNameByteLength = bytes[57];
                const bytesMessageByteLength = bytes.slice(58, 62);
                const messageByteLength = Helpers.getIntFromByteArray(bytesMessageByteLength);
                const bytesUserName = bytes.slice(62, 62 + userNameByteLength);
                const userName = new TextDecoder().decode(bytesUserName);
                const bytesMessage = bytes.slice(62 + userNameByteLength, 62 + userNameByteLength + messageByteLength);
                const message = new TextDecoder().decode(bytesMessage);

                return new Chat(type, roomId, userId, id, time, userName, message);
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
        haveIcon: boolean;
        message: string;
        targetId: string;
        url: string;

        constructor(id: string, type: Defines.NotificationType, sendAt: number, idCheck: boolean, haveIcon: boolean, message?: string, targetId?: string, url?: string) {
            this.id = id;
            this.type = type;
            this.sendAt = sendAt > 0 ? sendAt : 0;
            this.isCheck = idCheck;
            this.haveIcon = haveIcon;
            this.message = message ?? "";
            this.targetId = targetId ?? "";
            this.url = url ?? "";
        }
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
        result: Errors.CheckAuthentication;
        haveProfile: boolean;
        latestActive: number;
        userId: string;
        userName: string;
        userMessage: string;

        constructor(result: Errors.CheckAuthentication, haveProfile: boolean, latestActive: number, userId: string, userName: string, userMessage: string) {
            this.result = result;
            this.haveProfile = haveProfile;
            this.latestActive = latestActive;
            this.userId = userId;
            this.userName = userName;
            this.userMessage = userMessage;
        }

        static decode(bytes: Uint8Array) {
            try {
                const haveProfile: boolean = bytes[1] > 0;
                const bytesUserId = bytes.slice(2, 18);
                const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                const bytesLatestActive = bytes.slice(18, 26);
                const latestActive = Helpers.getLongFromByteArray(bytesLatestActive);
                const userNameLength = bytes[26];
                const userMessageLength = bytes[27];
                const bytesUserName = bytes.slice(28, 28 + userNameLength);
                const userName = new TextDecoder().decode(bytesUserName);
                const offsetUserName = 28 + userNameLength;
                const bytesUserMessage = bytes.slice(offsetUserName, offsetUserName + userMessageLength);
                const userMessage = new TextDecoder().decode(bytesUserMessage);

                return new CheckAuthenticationRes(bytes[0], haveProfile, latestActive, userId, userName, userMessage);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class NotificationRes {
        type: Defines.NotificationType;
        id: string;
        sendAt: number;
        isCheck: boolean;
        haveIcon: boolean;
        message: string;
        targetId: string;
        url: string;

        constructor(type: Defines.NotificationType, id: string, sendAt: number, isCheck: boolean, haveIcon: boolean, message: string, targetId: string, url: string) {
            this.type = type;
            this.id = id;
            this.sendAt = sendAt;
            this.isCheck = isCheck;
            this.haveIcon = haveIcon;
            this.targetId = targetId;
            this.message = message;
            this.url = url;
        }

        static decode(bytes: Uint8Array) {
            try {
                const type: Defines.NotificationType = bytes[0];
                const offsetType = 1;
                const offsetId = offsetType + 16;
                const offsetSendAt = offsetId + 8;
                const offsetIsCheck = offsetSendAt + 1;
                const offsetHaveIcon = offsetIsCheck + 1;
                const offsetTargetId = offsetHaveIcon + 16;

                const bytesId = bytes.slice(offsetType, offsetId);
                const id = Helpers.getUUIDFromByteArray(bytesId);
                const bytesSendAt = bytes.slice(offsetId, offsetSendAt);
                const sendAt = Helpers.getLongFromByteArray(bytesSendAt);
                const isCheck = bytes[offsetSendAt] > 0;
                const haveIcon = bytes[offsetIsCheck] > 0;
                const bytesTargetId = bytes.slice(offsetHaveIcon, offsetTargetId);
                const targetId = Helpers.getUUIDFromByteArray(bytesTargetId);

                switch (type) {
                    case Defines.NotificationType.FOLLOWER:
                        const offsetFollowerNameLength = offsetTargetId + 1;
                        const userFollowerLength = bytes[offsetTargetId];
                        const bytesFollowerName = bytes.slice(offsetFollowerNameLength, offsetFollowerNameLength + userFollowerLength);
                        const followerName = new TextDecoder().decode(bytesFollowerName);
                        return new NotificationRes(type, id, sendAt, isCheck, haveIcon, followerName, targetId, "");

                    case Defines.NotificationType.CHAT:
                        const offsetUrlLength = offsetTargetId + 4;
                        const offsetMessageLength = offsetUrlLength + 4;
                        const bytesUrlLength = bytes.slice(offsetTargetId, offsetUrlLength);
                        const urlLength = Helpers.getIntFromByteArray(bytesUrlLength);
                        const bytesMessageLength = bytes.slice(offsetUrlLength, offsetMessageLength);
                        const messageLength = Helpers.getIntFromByteArray(bytesMessageLength);
                        const bytesUrl = bytes.slice(offsetMessageLength, offsetMessageLength + urlLength);
                        const url = new TextDecoder().decode(bytesUrl);
                        const bytesMessage = bytes.slice(offsetMessageLength + urlLength, offsetMessageLength + urlLength + messageLength);
                        const message = new TextDecoder().decode(bytesMessage);
                        return new NotificationRes(type, id, sendAt, isCheck, haveIcon, message, targetId, url);

                    default:
                        console.error("Not suitable notification type.");
                        return null;
                }
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
                const offsetUserCount = 4;
                const bytesUserCount = bytes.slice(0, offsetUserCount);
                const userCount = Helpers.getIntFromByteArray(bytesUserCount);
                if (1 > userCount)
                    return new Domains.ConnectedUsersRes([]);

                const offsetHaveProfile = offsetUserCount + userCount;
                const offsetUserId = offsetHaveProfile + (userCount * 16);
                const offsetLatestActive = offsetUserId + (userCount * 8);
                const offsetUserNameLength = offsetLatestActive + userCount;
                let offsetUserNameAndMessage = offsetUserNameLength + userCount;
                const users: Domains.User[] = [];

                for (let i = 0; i < userCount; i++) {
                    const haveProfile = bytes[offsetUserCount + i] > 0;
                    const bytesUserId = bytes.slice(offsetHaveProfile + (i * 16), offsetHaveProfile + ((i + 1) * 16));
                    const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                    const bytesLatestActive = bytes.slice(offsetUserId + (i * 8), offsetUserId + ((i + 1) * 8));
                    const latestActive = Helpers.getLongFromByteArray(bytesLatestActive);
                    const userNameLength = bytes[offsetLatestActive + i];
                    const bytesUserName = bytes.slice(offsetUserNameAndMessage, offsetUserNameAndMessage + userNameLength);
                    const userName = new TextDecoder().decode(bytesUserName);
                    offsetUserNameAndMessage += userNameLength;
                    users.push(new Domains.User(userId, userName, '', haveProfile, latestActive, true));
                }

                for (let i = 0; i < userCount; i++) {
                    const messageLength = bytes[offsetUserNameLength + i];
                    const bytesMessage = bytes.slice(offsetUserNameAndMessage, offsetUserNameAndMessage + messageLength);
                    const message = new TextDecoder().decode(bytesMessage);
                    offsetUserNameAndMessage += messageLength;
                    users[i].message = message;
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
                const offsetUserCount = 4;
                const bytesUserCount = bytes.slice(0, offsetUserCount);
                const userCount = Helpers.getIntFromByteArray(bytesUserCount);
                if (1 > userCount)
                    return new Domains.FollowsRes([]);

                const offsetHaveProfile = offsetUserCount + userCount;
                const offsetUserId = offsetHaveProfile + (userCount * 16);
                const offsetLatestActive = offsetUserId + (userCount * 8);
                const offsetOnline = offsetLatestActive + (userCount);
                const offsetUserNameLength = offsetOnline + userCount;
                let offsetUserNameAndMessage = offsetUserNameLength + userCount;
                const users: Domains.User[] = [];

                for (let i = 0; i < userCount; i++) {
                    const haveProfile = bytes[offsetUserCount + i] > 0;
                    const bytesUserId = bytes.slice(offsetHaveProfile + (i * 16), offsetHaveProfile + ((i + 1) * 16));
                    const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                    const bytesLatestActive = bytes.slice(offsetUserId + (i * 8), offsetUserId + ((i + 1) * 8));
                    const latestActive = Helpers.getLongFromByteArray(bytesLatestActive);
                    const online = bytes[offsetLatestActive + i] > 0;
                    const userNameLength = bytes[offsetOnline + i];
                    const bytesUserName = bytes.slice(offsetUserNameAndMessage, offsetUserNameAndMessage + userNameLength);
                    const userName = new TextDecoder().decode(bytesUserName);
                    offsetUserNameAndMessage += userNameLength;
                    users.push(new Domains.User(userId, userName, '', haveProfile, latestActive, online));
                }

                for (let i = 0; i < userCount; i++) {
                    const messageLength = bytes[offsetUserNameLength + i];
                    const bytesMessage = bytes.slice(offsetUserNameAndMessage, offsetUserNameAndMessage + messageLength);
                    const message = new TextDecoder().decode(bytesMessage);
                    offsetUserNameAndMessage += messageLength;
                    users[i].message = message;
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
                const offsetUserCount = 4;
                const bytesUserCount = bytes.slice(0, offsetUserCount);
                const userCount = Helpers.getIntFromByteArray(bytesUserCount);
                if (1 > userCount)
                    return new Domains.FollowersRes([]);

                const offsetHaveProfile = offsetUserCount + userCount;
                const offsetUserId = offsetHaveProfile + (userCount * 16);
                const offsetLatestActive = offsetUserId + (userCount * 8);
                const offsetOnline = offsetLatestActive + (userCount);
                const offsetUserNameLength = offsetOnline + userCount;
                let offsetUserNameAndMessage = offsetUserNameLength + userCount;
                const users: Domains.User[] = [];

                for (let i = 0; i < userCount; i++) {
                    const haveProfile = bytes[offsetUserCount + i] > 0;
                    const bytesUserId = bytes.slice(offsetHaveProfile + (i * 16), offsetHaveProfile + ((i + 1) * 16));
                    const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                    const bytesLatestActive = bytes.slice(offsetUserId + (i * 8), offsetUserId + ((i + 1) * 8));
                    const latestActive = Helpers.getLongFromByteArray(bytesLatestActive);
                    const online = bytes[offsetLatestActive + i] > 0;
                    const userNameLength = bytes[offsetOnline + i];
                    const bytesUserName = bytes.slice(offsetUserNameAndMessage, offsetUserNameAndMessage + userNameLength);
                    const userName = new TextDecoder().decode(bytesUserName);
                    offsetUserNameAndMessage += userNameLength;
                    users.push(new Domains.User(userId, userName, '', haveProfile, latestActive, online));
                }

                for (let i = 0; i < userCount; i++) {
                    const messageLength = bytes[offsetUserNameLength + i];
                    const bytesMessage = bytes.slice(offsetUserNameAndMessage, offsetUserNameAndMessage + messageLength);
                    const message = new TextDecoder().decode(bytesMessage);
                    offsetUserNameAndMessage += messageLength;
                    users[i].message = message;
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
                let offsetUserName = offsetUserCount + roomCount;
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
                    let bytesRoomName = bytes.slice(offsetUserName, offsetUserName + bytesRoomNameLength);
                    let roomName =  new TextDecoder().decode(bytesRoomName);
                    roomIds.push(roomId);
                    roomOpenTypes.push(roomOpenType);
                    userCounts.push(userCount);
                    roomNames.push(roomName);
                    offsetUserName += bytesRoomNameLength;
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
                const haveProfile = bytes[0] > 0;
                const offsetHaveProfile = 1;
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
                return new NoticeConnectedUserRes(new Domains.User(id, name, message, haveProfile, latestActive, online));
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
                    user = new Domains.User(id, name, message, haveProfile, latestActive, online);
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
                    const haveProfile = bytes[0] > 0;
                    const offsetHaveProfile = 1;
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
                    user = new Domains.User(id, name, message, haveProfile, latestActive, online);
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

    export class CreateChatRoomReq {
        openType: Defines.RoomOpenType;
        roomName: string;

        constructor(openType: Defines.RoomOpenType, roomName: string) {
            this.openType = openType;
            this.roomName = roomName;
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
        roomId: string;

        constructor(roomId: string) {
            this.roomId = roomId;
        }

        static decode(bytes: Uint8Array) {
            try {
                const bytesRoomId= bytes.slice(0, 16);
                const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);

                return new RemoveChatRoomRes(roomId);
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

    export class UpdateChatRoomUsersRes {
        roomId: string;
        userIds: string[];
        userNames: string[];

        constructor(roomId: string, userIds: string[], userNames: string[]) {
            this.roomId = roomId;
            this.userIds = userIds;
            this.userNames = userNames;
        }

        static decode(bytes: Uint8Array) {
            try {
                const bytesRoomId= bytes.slice(0, 16);
                const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                const bytesUserCount= bytes.slice(16, 20);
                const userCount= Helpers.getIntFromByteArray(bytesUserCount);
                const userIds: string[] = [];
                const userNames: string[] = [];
                const userNameLengths: number[] = [];
                for (let i = 0; i < userCount; i++) {
                    let userIdOffset= 20 + (i * 16);
                    let bytesUserId= bytes.slice(userIdOffset, userIdOffset + 16);
                    let userId = Helpers.getUUIDFromByteArray(bytesUserId);
                    userIds.push(userId);
                    let userNameLengthOffset= (20 + userCount * 16) + i;
                    let bytesUserNameLength= bytes.slice(userNameLengthOffset, userNameLengthOffset + 1);
                    userNameLengths.push(bytesUserNameLength[0]);
                    let bytesUserNameOffset= 0;
                    if (0 < userNameLengths.length && 0 < i) {
                        let prevUserNameLengths = userNameLengths.slice(0, i);
                        if (0 < prevUserNameLengths.length)
                            bytesUserNameOffset = prevUserNameLengths.reduce((p, c) => p + c);
                    }
                    let userNameOffset = 20 + (userCount * 16) + userCount + bytesUserNameOffset;
                    let bytesUserName = bytes.slice(userNameOffset, userNameOffset + userNameLengths[i]);
                    let userName =  new TextDecoder().decode(bytesUserName);
                    userNames.push(userName);
                }

                return new UpdateChatRoomUsersRes(roomId, userIds, userNames);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class NoticeEnterChatRoomRes {
        roomId: string;
        userName: string;

        constructor(roomId: string, userName: string) {
            this.roomId = roomId;
            this.userName = userName;
        }

        static decode(bytes: Uint8Array) {
            try {
                const bytesRoomId = bytes.slice(0, 16);
                const bytesUserName = bytes.slice(16, bytes.byteLength);
                const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                const userName= new TextDecoder().decode(bytesUserName);
                return new NoticeEnterChatRoomRes(roomId, userName);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class NoticeExitChatRoomRes {
        roomId: string;
        userName: string;

        constructor(roomId: string, userName: string) {
            this.roomId = roomId;
            this.userName = userName;
        }

        static decode(bytes: Uint8Array) {
            try {
                const bytesRoomId = bytes.slice(0, 16);
                const bytesUserName = bytes.slice(16, bytes.byteLength);
                const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                const userName= new TextDecoder().decode(bytesUserName);
                return new NoticeExitChatRoomRes(roomId, userName);
            } catch (error) {
                console.error(error);
                return null;
            }
        }
    }

    export class NoticeChangeNameChatRoomRes {
        roomId: string;
        oldUserName: string;
        newUserName: string;

        constructor(roomId: string, oldUserName: string, newUserName: string) {
            this.roomId = roomId;
            this.oldUserName = oldUserName;
            this.newUserName = newUserName;
        }

        static decode(bytes: Uint8Array) {
            try {
                const bytesRoomId = bytes.slice(0, 16);
                const oldUserNameLength = bytes[16];
                const bytesOldUserName = bytes.slice(17, 17 + oldUserNameLength);
                const bytesNewUserName = bytes.slice(17 + oldUserNameLength, bytes.byteLength);
                const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                const oldUserName= new TextDecoder().decode(bytesOldUserName);
                const newUserName= new TextDecoder().decode(bytesNewUserName);
                return new NoticeChangeNameChatRoomRes(roomId, oldUserName, newUserName);
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
        userNames: string[];
        messages: string[];

        constructor(roomId: string, chatIds: string[], userIds: string[], types: Defines.ChatType[], sendAts: number[], userNames: string[], messages: string[]) {
            this.roomId = roomId;
            this.chatIds = chatIds;
            this.userIds = userIds;
            this.types = types;
            this.sendAts = sendAts;
            this.userNames = userNames;
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
                const userNameLengths: number[] = [];
                const messageLengths: number[] = [];
                const userNames: string[] = [];
                const messages: string[] = [];

                const offsetBytesRoomId = 20;
                const offsetBytesChatIds = offsetBytesRoomId + (16 * count);
                const offsetBytesUserIds = offsetBytesChatIds + (16 * count);
                const offsetBytesTypes = offsetBytesUserIds + (count);
                const offsetBytesSendAts = offsetBytesTypes + (count * 8);
                const offsetBytesUserNameLength = offsetBytesSendAts + (count);
                const offsetBytesMessageLength = offsetBytesUserNameLength + (4 * count);

                for (let i = 0; i < count; i++) {
                    let bytesChatId = bytes.slice(offsetBytesRoomId + (i * 16), offsetBytesRoomId + ((i + 1) * 16));
                    chatIds.push(Helpers.getUUIDFromByteArray(bytesChatId));

                    let bytesUserId = bytes.slice(offsetBytesChatIds + (i * 16), offsetBytesChatIds + ((i + 1) * 16));
                    userIds.push(Helpers.getUUIDFromByteArray(bytesUserId));

                    let type = bytes[offsetBytesUserIds + i];
                    types.push(type as Defines.ChatType);

                    let bytesSendAt = bytes.slice(offsetBytesTypes + (i * 8), offsetBytesTypes + ((i + 1) * 8));
                    sendAts.push(Helpers.getLongFromByteArray(bytesSendAt));

                    let userNameLength = bytes[offsetBytesSendAts + i];
                    userNameLengths.push(userNameLength);

                    let bytesMessage = bytes.slice(offsetBytesUserNameLength + (i * 4), offsetBytesUserNameLength + ((i + 1) * 4));
                    messageLengths.push(Helpers.getIntFromByteArray(bytesMessage));
                }

                let offsetBytesUserNames = offsetBytesMessageLength;
                for (let i = 0; i < userNameLengths.length; i++) {
                    let bytesUserName = bytes.slice(offsetBytesUserNames, offsetBytesUserNames + userNameLengths[i]);
                    userNames.push(new TextDecoder().decode(bytesUserName));
                    offsetBytesUserNames += userNameLengths[i];
                }

                let offsetBytesMessages = offsetBytesUserNames;
                for (let i = 0; i < messageLengths.length; i++) {
                    let bytesMessage = bytes.slice(offsetBytesMessages, offsetBytesMessages + messageLengths[i]);
                    messages.push(new TextDecoder().decode(bytesMessage));
                    offsetBytesMessages += messageLengths[i];
                }

                return new Domains.HistoryChatRoomRes(roomId, chatIds, userIds, types, sendAts, userNames, messages);
            } catch (error) {
                console.error(error);
                return null;
            }
        }

        getChatHistories(): Domains.Chat[] {
            const histories: Domains.Chat[] = [];
            try {
                for (let i = 0; i < this.chatIds.length; i++) {
                    histories.push(new Chat(this.types[i], this.roomId, this.userIds[i], this.chatIds[i], this.sendAts[i], this.userNames[i], this.messages[i]));
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
        userName: string;
        message: string;

        constructor(result: Errors.TalkChatRoom, type: Defines.ChatType, roomId: string, userId: string, id: string, time: number, userName: string, message: string) {
            this.result = result;
            this.type = type;
            this.roomId = roomId;
            this.userId = userId;
            this.id = id;
            this.time = time;
            this.userName = userName;
            this.message = message;
        }

        static decode(bytes: Uint8Array) {
            try {
                const result = bytes[0];
                if (1 == bytes.length)
                    return new TalkChatRoomRes(result, Defines.ChatType.TALK, '', '', '', (new Date()).getTime(), '', '');

                const type = bytes[1];
                const bytesRoomId= bytes.slice(2, 18);
                const roomId= Helpers.getUUIDFromByteArray(bytesRoomId);
                const bytesUserId = bytes.slice(18, 34);
                const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                const bytesId = bytes.slice(34, 50);
                const id = Helpers.getUUIDFromByteArray(bytesId);
                const bytesTime = bytes.slice(50, 58);
                const time = Helpers.getLongFromByteArray(bytesTime);
                const userNameByteLength = bytes[58];
                const bytesMessageByteLength = bytes.slice(59, 63);
                const messageByteLength = Helpers.getIntFromByteArray(bytesMessageByteLength);
                const bytesUserName = bytes.slice(63, 63 + userNameByteLength);
                const userName = new TextDecoder().decode(bytesUserName);
                const bytesMessage = bytes.slice(63 + userNameByteLength, 63 + userNameByteLength + messageByteLength);
                const message = new TextDecoder().decode(bytesMessage);

                return new TalkChatRoomRes(result, type, roomId, userId, id, time, userName, message);
            } catch (error) {
                console.error(error);
                return null;
            }
        }

        getChatData() {
            return new Chat(this.type, this.roomId, this.userId, this.id, this.time, this.userName, this.message);
        }
    }

    export class SubscriptionRequest {
        subscription: PushSubscription;
        roomId: string;
        userId: string;

        constructor(subscription: PushSubscription, roomId: string, userId: string) {
            this.subscription = subscription;
            this.roomId = roomId;
            this.userId = userId;
        }
    }

    export class UploadChatImageRequest {
        chatId: string;
        roomId: string;
        userId: string;
        largeData: string;
        smallData: string;

        constructor(chatId: string, roomId: string, userId: string, largeData: string, smallData: string) {
            this.chatId = chatId;
            this.roomId = roomId;
            this.userId = userId;
            this.largeData = largeData;
            this.smallData = smallData;
        }
    }
}

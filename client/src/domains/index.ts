import {Helpers} from "@/helpers";
import {Errors} from "@/defines/errors";
import {Defines} from "@/defines";

export namespace Domains {

    export class ChatRoom {
        roomId: string;
        roomName: string;
        openType: Defines.RoomOpenType;
        users: Domains.ChatRoomUser[];
        chatDatas: Domains.Chat[];


        constructor(roomId: string, roomName: string, openType: Defines.RoomOpenType, chatRoomUsers: Domains.ChatRoomUser[], chatDatas: Domains.Chat[]) {
            this.roomId = roomId;
            this.roomName = roomName;
            this.openType = openType;
            this.users = chatRoomUsers;
            this.chatDatas = chatDatas;
        }

        addUser(user: ChatRoomUser) {
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

    export class ChatRoomUser {
        userId: string;
        userName: string;

        constructor(userId: string, userName: string) {
            this.userId = userId;
            this.userName = userName;
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

    export class CheckAuthenticationRes {
        result: Errors.CheckAuthentication;
        userId: string;
        userName: string;
        chatRooms: Domains.ChatRoom[];

        constructor(result: Errors.CheckAuthentication, userId: string, userName: string, chatRooms?: Domains.ChatRoom[]) {
            this.result = result;
            this.userId = userId;
            this.userName = userName;
            this.chatRooms = 'undefined' != typeof chatRooms && null != chatRooms ? chatRooms : [];
        }

        static decode(bytes: Uint8Array) {
            try {
                const bytesUserId = bytes.slice(1, 17);
                const userId = Helpers.getUUIDFromByteArray(bytesUserId);
                const userNameLength = bytes[17];
                const bytesUserName = bytes.slice(18, 18 + userNameLength);
                const userName = new TextDecoder().decode(bytesUserName);
                const offsetUserInfo = 18 + userNameLength;
                const offsetChatRoomCount = offsetUserInfo + 4;
                const bytesChatRoomCount = bytes.slice(offsetUserInfo, offsetChatRoomCount);
                const chatRoomCount = Helpers.getIntFromByteArray(bytesChatRoomCount);
                const offsetChatRoomId = offsetChatRoomCount + (chatRoomCount * 16);
                const offsetChatRoomOpenType = offsetChatRoomId + chatRoomCount;
                const offsetChatRoomUserCount = offsetChatRoomOpenType + (chatRoomCount * 4);
                const offsetChatRoomNameLength = offsetChatRoomUserCount + chatRoomCount;
                let offsetChatRoomName = offsetChatRoomNameLength;
                const chatRooms: Domains.ChatRoom[] = [];
                for (let i = 0; i < chatRoomCount; i++) {
                    let bytesChatRoomId = bytes.slice(offsetChatRoomCount + (i * 16), offsetChatRoomCount + ((i + 1) * 16))
                    let chatRoomId = Helpers.getUUIDFromByteArray(bytesChatRoomId);
                    let chatRoomOpenType = bytes[offsetChatRoomId + i];
                    let bytesChatRoomUserCount = bytes.slice(offsetChatRoomOpenType + (i * 4), offsetChatRoomOpenType + ((i + 1) * 4));
                    let chatRoomUserCount = Helpers.getIntFromByteArray(bytesChatRoomUserCount);
                    let chatRoomNameLength = bytes[offsetChatRoomUserCount + i];
                    let bytseChatRoomName = bytes.slice(offsetChatRoomName, offsetChatRoomName + chatRoomNameLength);
                    let chatRoomName = new TextDecoder().decode(bytseChatRoomName);
                    offsetChatRoomName += chatRoomNameLength;
                    chatRooms.push(new Domains.ChatRoom(chatRoomId, chatRoomName, chatRoomOpenType, [], []));
                }
                return new CheckAuthenticationRes(bytes[0], userId, userName, chatRooms);
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

    export class UpdateChatRoomsRes {
        roomIds: string[];
        roomNames: string[];
        roomUserCounts: number[];

        constructor(roomIds: string[], roomNames: string[], roomuserCounts: number[]) {
            this.roomIds = roomIds;
            this.roomNames = roomNames;
            this.roomUserCounts = roomuserCounts;
        }

        static decode(bytes: Uint8Array) {
            try {
                const bytesRoomCount= bytes.slice(0, 4);
                const roomCount= Helpers.getIntFromByteArray(bytesRoomCount);
                const roomIds: string[] = [];
                const roomNames: string[] = [];
                const roomNameLengths: number[] = [];
                const roomUserCounts: number[] = [];

                for (let i = 0; i < roomCount; i++) {
                    let roomIdOffset= 4 + (i * 16);
                    let bytesRoomId= bytes.slice(roomIdOffset, roomIdOffset + 16);
                    let roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                    roomIds.push(roomId);
                    let roomUserCountOffset= (4 + (roomCount * 16)) + (i * 4);
                    let bytesRoomUserCount= bytes.slice(roomUserCountOffset, roomUserCountOffset + 4);
                    let roomUserCount = Helpers.getIntFromByteArray(bytesRoomUserCount);
                    roomUserCounts.push(roomUserCount);

                    let roomNameLengthOffset= (4 + (roomCount * 16) + (roomCount * 4)) + i;
                    let bytesRoomNameLength= bytes.slice(roomNameLengthOffset, roomNameLengthOffset + 1);
                    roomNameLengths.push(bytesRoomNameLength[0]);
                    let roomNameBytesOffset= 0;
                    if (0 < roomNameLengths.length && 0 < i) {
                        let prevRoomNameLengths = roomNameLengths.slice(0, i);
                        if (0 < prevRoomNameLengths.length)
                            roomNameBytesOffset = prevRoomNameLengths.reduce((p, c) => p + c);
                    }
                    let roomNameOffset = 4 + (roomCount * 16) + (roomCount * 4) + roomCount + roomNameBytesOffset;
                    let bytesRoomName = bytes.slice(roomNameOffset, roomNameOffset + roomNameLengths[i]);
                    let roomName =  new TextDecoder().decode(bytesRoomName);
                    roomNames.push(roomName);
                }

                return new UpdateChatRoomsRes(roomIds, roomNames, roomUserCounts);
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

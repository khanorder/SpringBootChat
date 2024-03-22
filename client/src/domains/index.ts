import {Helpers} from "@/helpers";
import {Errors} from "@/defines/errors";
import ExitChatRoom = Errors.ExitChatRoom;
import {Defines} from "@/defines";

export namespace Domains {

    import ChatType = Defines.ChatType;

    export class ChatRoom {
        roomId: string;
        roomName: string;
        userCount: number;

        constructor(roomId: string, roomName: string, userCount: number) {
            this.roomId = roomId;
            this.roomName = roomName;
            this.userCount = userCount;
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
        roomId: string;
        message: string;

        constructor(roomId: string, message: string) {
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

        public static decode(bytes: Uint8Array): Chat|null {
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

        public static decode(bytes: Uint8Array): TalkChatRoomRes|null {
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
        }

        public getChatData() {
            return new Chat(this.type, this.roomId, this.userId, this.id, this.time, this.userName, this.message);
        }
    }

    export class CreateChatRoomRes {
        public result: Errors.CreateChatRoom;
        public roomId: string;
        public userId: string;

        constructor(result: Errors.CreateChatRoom, roomId: string, userId: string) {
            this.result = result;
            this.roomId = roomId;
            this.userId = userId;
        }

        public static decode(bytes: Uint8Array): CreateChatRoomRes|null {
            if (1 != bytes.byteLength && 33 != bytes.byteLength)
                return null;

            const bytesRoomId = bytes.slice(1, 17);
            const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
            const bytesUserId = bytes.slice(17, 33);
            const userId = Helpers.getUUIDFromByteArray(bytesUserId)
            return new CreateChatRoomRes(bytes[0], roomId, userId);
        }
    }

    export class ExitChatRoomRes {
        public result: Errors.ExitChatRoom;

        constructor(result: Errors.ExitChatRoom) {
            this.result = result;
        }

        public static decode(bytes: Uint8Array): ExitChatRoomRes|null {
            return new ExitChatRoomRes(bytes[0]);
        }
    }

    export class EnterChatRoomRes {
        public result: Errors.EnterChatRoom;
        public roomId: string;
        public userId: string;

        constructor(result: Errors.EnterChatRoom, roomId: string, userId: string) {
            this.result = result;
            this.roomId = roomId;
            this.userId = userId;
        }

        public static decode(bytes: Uint8Array): EnterChatRoomRes|null {
            const bytesRoomId = bytes.slice(1, 17);
            const bytesUserId = bytes.slice(17, 33);
            const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
            const userId = Helpers.getUUIDFromByteArray(bytesUserId);

            return new EnterChatRoomRes(bytes[0], roomId, userId);
        }
    }

    export class UpdateChatRoomsRes {
        public roomIds: string[];
        public roomNames: string[];
        public roomUserCounts: number[];

        constructor(roomIds: string[], roomNames: string[], roomuserCounts: number[]) {
            this.roomIds = roomIds;
            this.roomNames = roomNames;
            this.roomUserCounts = roomuserCounts;
        }

        public static decode(bytes: Uint8Array): UpdateChatRoomsRes|null {
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
        }
    }

    export class UpdateChatRoomUsersRes {
        public userIds: string[];
        public userNames: string[];

        constructor(userIds: string[], userNames: string[]) {
            this.userIds = userIds;
            this.userNames = userNames;
        }

        public static decode(bytes: Uint8Array): UpdateChatRoomUsersRes|null {
            const bytesUserCount= bytes.slice(0, 4);
            const userCount= Helpers.getIntFromByteArray(bytesUserCount);
            const userIds: string[] = [];
            const userNames: string[] = [];
            const userNameLengths: number[] = [];
            for (let i = 0; i < userCount; i++) {
                let userIdOffset= 4 + (i * 16);
                let bytesUserId= bytes.slice(userIdOffset, userIdOffset + 16);
                let userId = Helpers.getUUIDFromByteArray(bytesUserId);
                userIds.push(userId);
                let userNameLengthOffset= (4 + userCount * 16) + i;
                let bytesUserNameLength= bytes.slice(userNameLengthOffset, userNameLengthOffset + 1);
                userNameLengths.push(bytesUserNameLength[0]);
                let bytesUserNameOffset= 0;
                if (0 < userNameLengths.length && 0 < i) {
                    let prevUserNameLengths = userNameLengths.slice(0, i);
                    if (0 < prevUserNameLengths.length)
                        bytesUserNameOffset = prevUserNameLengths.reduce((p, c) => p + c);
                }
                let userNameOffset = 4 + (userCount * 16) + userCount + bytesUserNameOffset;
                let bytesUserName = bytes.slice(userNameOffset, userNameOffset + userNameLengths[i]);
                let userName =  new TextDecoder().decode(bytesUserName);
                userNames.push(userName);
            }

            return new UpdateChatRoomUsersRes(userIds, userNames);
        }
    }

    export class NoticeEnterChatRoomRes {
        public roomId: string;
        public userName: string;

        constructor(roomId: string, userName: string) {
            this.roomId = roomId;
            this.userName = userName;
        }

        public static decode(bytes: Uint8Array): NoticeEnterChatRoomRes|null {
            const bytesRoomId = bytes.slice(0, 16);
            const bytesUserName = bytes.slice(16, bytes.byteLength);
            const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
            const userName= new TextDecoder().decode(bytesUserName);
            return new NoticeEnterChatRoomRes(roomId, userName);
        }
    }

    export class NoticeExitChatRoomRes {
        public roomId: string;
        public userName: string;

        constructor(roomId: string, userName: string) {
            this.roomId = roomId;
            this.userName = userName;
        }

        public static decode(bytes: Uint8Array): NoticeExitChatRoomRes|null {
            const bytesRoomId = bytes.slice(0, 16);
            const bytesUserName = bytes.slice(16, bytes.byteLength);
            const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
            const userName= new TextDecoder().decode(bytesUserName);
            return new NoticeExitChatRoomRes(roomId, userName);
        }
    }
}
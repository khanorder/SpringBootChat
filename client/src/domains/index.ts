import {Helpers} from "@/helpers";
import {Errors} from "@/defines/errors";
import ExitChatRoom = Errors.ExitChatRoom;
import {Defines} from "@/defines";

export namespace Domains {

    import ChatType = Defines.ChatType;

    export class ChatRoom {
        roomId: string;
        roomName: string;

        constructor(roomId: string, roomName: string) {
            this.roomId = roomId;
            this.roomName = roomName;
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
            console.log('chat: ');
            console.log(bytes);

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
            console.log('create chatroom: ');
            console.log(bytes);
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
            console.log('exit chatroom: ');
            console.log(bytes);

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
            console.log('enter chatroom: ');
            console.log(bytes);

            const bytesRoomId = bytes.slice(1, 17);
            const bytesUserId = bytes.slice(17, 33);
            const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
            const userId = Helpers.getUUIDFromByteArray(bytesUserId);

            return new EnterChatRoomRes(bytes[0], roomId, userId);
        }
    }

    export class UpdateChatRoomRes {
        public roomIds: string[];
        public roomNames: string[];

        constructor(roomIds: string[], roomNames: string[]) {
            this.roomIds = roomIds;
            this.roomNames = roomNames;
        }

        public static decode(bytes: Uint8Array): UpdateChatRoomRes|null {
            console.log('update chatroom: ');
            console.log(bytes);

            const bytesRoomCount= bytes.slice(0, 4);
            const roomCount= Helpers.getIntFromByteArray(bytesRoomCount);
            const roomIds: string[] = [];
            const roomNames: string[] = [];
            const roomNameLengths: number[] = [];
            for (let i = 0; i < roomCount; i++) {
                let roomIdOffset= 4 + (i * 16);
                let bytesRoomId= bytes.slice(roomIdOffset, roomIdOffset + (i + 1) * 16);
                let roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                roomIds.push(roomId);
                let roomNameLengthOffset= (4 + roomCount * 16) + i;
                let bytesRoomNameLength= bytes.slice(roomNameLengthOffset, roomNameLengthOffset + 1);
                roomNameLengths.push(bytesRoomNameLength[0]);
                let roomNameBytesOffset= 0;
                if (0 < roomNameLengths.length && 0 < i) {
                    let prevRoomNameLengths = roomNameLengths.slice(0, i);
                    if (0 < prevRoomNameLengths.length)
                        roomNameBytesOffset = prevRoomNameLengths.reduce((p, c) => p + c);
                }
                let roomNameOffset = 4 + (roomCount * 16) + roomCount + roomNameBytesOffset + roomNameBytesOffset;
                let bytesRoomName = bytes.slice(roomNameOffset, roomNameOffset + roomNameLengths[i]);
                let roomName =  new TextDecoder().decode(bytesRoomName);
                roomNames.push(roomName);
            }

            return new UpdateChatRoomRes(roomIds, roomNames);
        }
    }

    export class NoticeEnterChatRoomRes {
        public userName: string;

        constructor(userName: string) {
            this.userName = userName;
        }

        public static decode(bytes: Uint8Array): NoticeEnterChatRoomRes|null {
            console.log('notice enter chatroom: ');
            console.log(bytes);

            const userName= new TextDecoder().decode(bytes);
            return new NoticeEnterChatRoomRes(userName);
        }
    }

    export class NoticeExitChatRoomRes {
        public userName: string;

        constructor(userName: string) {
            this.userName = userName;
        }

        public static decode(bytes: Uint8Array): NoticeExitChatRoomRes|null {
            console.log('notice exit chatroom: ');
            console.log(bytes);

            const userName= new TextDecoder().decode(bytes);
            return new NoticeExitChatRoomRes(userName);
        }
    }
}

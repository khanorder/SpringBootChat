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
        roomId: string;
        type: Defines.ChatType;
        id: string;
        time: number;
        userName: string;
        message: string;

        constructor(roomId: string, type: Defines.ChatType, id: string, time: number, userName: string, message: string) {
            this.roomId = roomId;
            this.type = type;
            this.id = id;
            this.time = time;
            this.userName = userName;
            this.message = message;
        }

        public static decode(bytes: Uint8Array): Chat|null {
            console.log('update chatroom: ');
            console.log(bytes);

            const bytesRoomId= bytes.slice(0, 16);
            const roomId= Helpers.getUUIDFromByteArray(bytesRoomId);
            const type = bytes[16];
            const bytesId = bytes.slice(17, 33);
            const id = Helpers.getUUIDFromByteArray(bytesId);
            const bytesTime = bytes.slice(33, 37);
            const time = Helpers.getIntFromByteArray(bytesTime);
            const userNameByteLength = bytes[37];
            const bytesMessageByteLength = bytes.slice(37, 41);
            const messageByteLength = Helpers.getIntFromByteArray(bytesMessageByteLength);
            const bytesUserName = bytes.slice(41, 41 + userNameByteLength);
            const userName = new TextDecoder().decode(bytesUserName);
            const bytesMessage = bytes.slice(41 + userNameByteLength, 41 + userNameByteLength + messageByteLength);
            const message = new TextDecoder().decode(bytesMessage);

            return new Chat(roomId, type, id, time, userName, message);
        }
    }

    export class CreateChatRoomRes {
        public result: Errors.CreateChatRoom;
        public roomId: string;

        constructor(result: Errors.CreateChatRoom, roomId: string) {
            this.result = result;
            this.roomId = roomId;
        }

        public static decode(bytes: Uint8Array): CreateChatRoomRes|null {
            console.log('create chatroom: ');
            console.log(bytes);
            if (1 != bytes.byteLength && 17 != bytes.byteLength)
                return null;

            const bytesRoomId = bytes.slice(1, 17);
            const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
            return new CreateChatRoomRes(bytes[0], roomId);
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

        constructor(result: Errors.EnterChatRoom, roomId: string) {
            this.result = result;
            this.roomId = roomId;
        }

        public static decode(bytes: Uint8Array): EnterChatRoomRes|null {
            console.log('enter chatroom: ');
            console.log(bytes);

            const bytesRoomId = bytes.slice(1, 17);
            const roomId = Helpers.getUUIDFromByteArray(bytesRoomId);

            return new EnterChatRoomRes(bytes[0], roomId);
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

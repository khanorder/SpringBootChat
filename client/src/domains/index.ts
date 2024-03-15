import {Helpers} from "@/helpers";
import {Errors} from "@/defines/errors";
import ExitChatRoom = Errors.ExitChatRoom;

export namespace Domains {

    export class ChatRoom {
        roomId: string;
        roomName: string;

        constructor(roomId: string, roomName: string) {
            this.roomId = roomId;
            this.roomName = roomName;
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

            const roomCountBytes= bytes.slice(0, 4);
            const roomCount= Helpers.getIntFromByteArray(roomCountBytes);
            const roomIds: string[] = [];
            const roomNames: string[] = [];
            const roomNameLengths: number[] = [];
            for (let i = 0; i < roomCount; i++) {
                let roomIdOffset= 4 + (i * 16);
                let roomIdBytes= bytes.slice(roomIdOffset, roomIdOffset + (i + 1) * 16);
                let roomId = Helpers.getUUIDFromByteArray(roomIdBytes);
                roomIds.push(roomId);
                let roomNameLengthOffset= (4 + roomCount * 16) + i;
                let roomNameLengthBytes= bytes.slice(roomNameLengthOffset, roomNameLengthOffset + 1);
                roomNameLengths.push(roomNameLengthBytes[0]);
                let roomNameBytesOffset= 0;
                if (0 < roomNameLengths.length && 0 < i) {
                    let prevRoomNameLengths = roomNameLengths.slice(0, i);
                    if (0 < prevRoomNameLengths.length)
                        roomNameBytesOffset = prevRoomNameLengths.reduce((p, c) => p + c);
                }
                let roomNameOffset = 4 + (roomCount * 16) + roomCount + roomNameBytesOffset + roomNameBytesOffset;
                let roomNameBytes = bytes.slice(roomNameOffset, roomNameOffset + roomNameLengths[i]);
                let roomName =  new TextDecoder().decode(roomNameBytes);
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

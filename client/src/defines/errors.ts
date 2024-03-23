export namespace Errors {
    export enum CreateChatRoom {
        NONE,
        EXISTS_ROOM,
        REQUIRED_ROOM_ID,
    }

    export enum ExitChatRoom {
        NONE,
        ROOM_REMOVED,
        NO_EXISTS_ROOM,
        NOT_IN_ROOM,
        FAILED_TO_EXIT,
    }

    export enum EnterChatRoom {
        NONE,
        ROOM_REMOVED,
        NO_EXISTS_ROOM,
        ALREADY_IN_ROOM,
        FAILED_TO_ENTER,
    }

    export enum TalkChatRoom {
        NONE,
        ROOM_REMOVED = 1,
        NO_EXISTS_ROOM = 2,
        NOT_IN_ROOM = 3,
        NOT_FOUND_USER = 4,
        NOT_AVAILABLE_CHAT_TYPE = 5,
        FAILED_TO_SEND = 6,
    }
}
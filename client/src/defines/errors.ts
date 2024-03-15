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
}
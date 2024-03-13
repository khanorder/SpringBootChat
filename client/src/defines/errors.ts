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
}
export namespace Errors {
    export enum CheckAuthentication {
        NONE = 0,
        ALREADY_SIGN_IN_USER = 1,
        FAILED_TO_CREATE_USER = 2,
    }

    export enum CreateChatRoom {
        NONE = 0,
        NOT_ALLOWED_OPEN_TYPE = 1,
        NOT_FOUND_USER = 2,
        NOT_MATCHED_USER = 3,
        EXISTS_ROOM = 4,
        REQUIRED_ROOM_ID = 5,
    }

    export enum ExitChatRoom {
        NONE = 0,
        NOT_FOUND_USER = 1,
        ROOM_REMOVED = 2,
        NO_EXISTS_ROOM = 3,
        NOT_IN_ROOM = 4,
        FAILED_TO_EXIT = 5,
    }

    export enum EnterChatRoom {
        NONE = 0,
        ROOM_REMOVED = 1,
        NO_EXISTS_ROOM = 2,
        NOT_FOUND_USER = 3,
        ALREADY_IN_ROOM = 4,
        FAILED_TO_ENTER = 5,
    }

    export enum TalkChatRoom {
        NONE,
        ROOM_REMOVED = 1,
        NO_EXISTS_ROOM = 2,
        NOT_IN_ROOM = 3,
        NOT_FOUND_USER = 4,
        NOT_MATCHED_USER = 5,
        NOT_AVAILABLE_CHAT_TYPE = 6,
        FAILED_TO_SEND = 7,
    }

    export enum SubscribeChatRoom {
        NONE = 0,
        REQUIRED_ROOM_ID = 1,
        REQUIRED_USER_ID = 2,
        NOT_FOUND_CHAT_ROOM = 3,
        EMPTY_USER_IN_ROOM = 4,
        NOT_FOUND_USER_IN_ROOM = 5,
        ALREADY_SUBSCRIBE_ROOM = 6,
    }
}
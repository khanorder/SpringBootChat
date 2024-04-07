export namespace Defines {
    export enum PacketType {
        NONE = 0,
        CHECK_CONNECTION = 1,
        CHECK_AUTHENTICATION = 2,
        CHANGE_USER_NAME = 3,
        CREATE_CHAT_ROOM = 11,
        ADD_CHAT_ROOM = 12,
        REMOTE_CHAT_ROOM = 13,
        UPDATE_CHAT_ROOMS = 14,
        ENTER_CHAT_ROOM = 15,
        EXIT_CHAT_ROOM = 16,
        UPDATE_CHAT_ROOM = 17,
        NOTICE_ENTER_CHAT_ROOM = 18,
        NOTICE_EXIT_CHAT_ROOM = 19,
        NOTICE_CHANGE_NAME_CHAT_ROOM = 20,
        NOTICE_CHAT_ROOM = 21,
        TALK_CHAT_ROOM = 22,
        HISTORY_CHAT_ROOM = 23,
        TEST = 255,
    }

    export enum AuthStateType {
        NONE = 0,
        SIGN_IN = 1,
        ALREADY_SIGN_IN = 2,
    }

    export enum ChatType {
        TALK = 0,
        IMAGE = 1,
        NOTICE = 2,
    }

    export enum RoomOpenType {
        PRIVATE = 0,
        PUBLIC = 1,
        FRIEND = 2,
    }
}
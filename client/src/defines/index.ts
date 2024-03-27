export namespace Defines {
    export enum PacketType {
        NONE = 0,
        CHECK_CONNECTION = 1,
        CHECK_AUTHENTICATION = 2,
        CHANGE_USER_NAME = 3,
        CREATE_CHAT_ROOM = 11,
        UPDATE_CHAT_ROOMS = 12,
        ENTER_CHAT_ROOM = 13,
        EXIT_CHAT_ROOM = 14,
        UPDATE_CHAT_ROOM = 15,
        NOTICE_ENTER_CHAT_ROOM = 16,
        NOTICE_EXIT_CHAT_ROOM = 17,
        NOTICE_CHANGE_NAME_CHAT_ROOM = 18,
        NOTICE_CHAT_ROOM = 19,
        TALK_CHAT_ROOM = 20,
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
}
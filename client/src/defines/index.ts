export namespace Defines {
    export enum PacketType {
        NONE = 0,
        CHECK_CONNECTION = 1,
        CREATE_CHAT_ROOM = 11,
        UPDATE_CHAT_ROOMS = 12,
        ENTER_CHAT_ROOM = 13,
        EXIT_CHAT_ROOM = 14,
        UPDATE_CHAT_ROOM = 15,
        NOTICE_ENTER_CHAT_ROOM = 16,
        NOTICE_EXIT_CHAT_ROOM = 17,
        NOTICE_CHAT_ROOM = 18,
        TALK_CHAT_ROOM = 19,
        TEST = 255,
    }

    export enum ChatType {
        TALK = 0,
        IMAGE = 1,
        NOTICE = 2,
    }
}
export namespace Defines {
    export enum PacketType {
        NONE = 0,
        CREATE_CHAT_ROOM = 1,
        UPDATE_CHAT_ROOMS = 2,
        ENTER_CHAT_ROOM = 3,
        EXIT_CHAT_ROOM = 4,
        UPDATE_CHAT_ROOM = 5,
        NOTICE_ENTER_CHAT_ROOM = 6,
        NOTICE_EXIT_CHAT_ROOM = 7,
        NOTICE_CHAT_ROOM = 8,
        TALK_CHAT_ROOM = 9,
    }

    export enum ChatType {
        TALK = 0,
        NOTICE = 1,
    }
}
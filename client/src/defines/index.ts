export namespace Defines {

    export enum ReqType {
        REQ_NONE = 0,
        REQ_CHECK_CONNECTION = 1,
        REQ_CHECK_AUTHENTICATION = 2,
        REQ_CONNECTED_USERS = 3,
        REQ_FOLLOW = 4,
        REQ_UNFOLLOW = 5,
        REQ_CHANGE_USER_NAME = 6,
        REQ_CREATE_CHAT_ROOM = 7,
        REQ_ENTER_CHAT_ROOM = 8,
        REQ_EXIT_CHAT_ROOM = 9,
        REQ_TALK_CHAT_ROOM = 10,
        REQ_TEST = 255,
    }

    export enum ResType {
        RES_NONE = 0,
        RES_CHECK_CONNECTION = 1,
        RES_CHECK_AUTHENTICATION = 2,
        RES_CONNECTED_USERS = 3,
        RES_NOTICE_CONNECTED_USER = 4,
        RES_NOTICE_DISCONNECTED_USER = 5,
        RES_FOLLOW = 6,
        RES_UNFOLLOW = 7,
        RES_FOLLOWER = 8,
        RES_UNFOLLOWER = 9,
        RES_CHANGE_USER_NAME = 10,
        RES_CREATE_CHAT_ROOM = 11,
        RES_ADD_CHAT_ROOM = 12,
        RES_REMOTE_CHAT_ROOM = 13,
        RES_UPDATE_CHAT_ROOMS = 14,
        RES_ENTER_CHAT_ROOM = 15,
        RES_EXIT_CHAT_ROOM = 16,
        RES_UPDATE_CHAT_ROOM = 17,
        RES_NOTICE_ENTER_CHAT_ROOM = 18,
        RES_NOTICE_EXIT_CHAT_ROOM = 19,
        RES_NOTICE_CHANGE_NAME_CHAT_ROOM = 20,
        NOTICE_CHAT_ROOM = 21,
        RES_TALK_CHAT_ROOM = 22,
        RES_HISTORY_CHAT_ROOM = 23,
        RES_TEST = 255,
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
        FOLLOW = 2,
    }

    export enum TabType {
        FOLLOW = 0,
        CHAT = 1,
        SEARCH = 2
    }
}
export namespace Defines {

    export enum ReqType {
        REQ_NONE = 0,
        REQ_CHECK_CONNECTION = 1,
        REQ_CHECK_AUTHENTICATION = 2,
        REQ_CHECK_NOTIFICATION = 3,
        REQ_REMOVE_NOTIFICATION = 4,
        REQ_CONNECTED_USERS = 5,
        REQ_GET_USER_INFO = 6,
        REQ_FOLLOW = 7,
        REQ_UNFOLLOW = 8,
        REQ_START_CHAT = 9,
        REQ_CHANGE_USER_NAME = 10,
        REQ_CHANGE_USER_MESSAGE = 11,
        REQ_CHANGE_USER_PROFILE = 12,
        REQ_REMOVE_USER_PROFILE = 13,
        REQ_CREATE_CHAT_ROOM = 14,
        REQ_REMOVE_CHAT_ROOM = 15,
        REQ_ENTER_CHAT_ROOM = 16,
        REQ_EXIT_CHAT_ROOM = 17,
        REQ_TALK_CHAT_ROOM = 18,
        REQ_HISTORY_CHAT_ROOM = 19,
        REQ_TEST = 255,
    }

    export enum ResType {
        RES_NONE = 0,
        RES_CHECK_CONNECTION = 1,
        RES_CHECK_AUTHENTICATION = 2,
        RES_NOTIFICATION = 3,
        RES_CHECK_NOTIFICATION = 4,
        RES_REMOVE_NOTIFICATION = 5,
        RES_CONNECTED_USERS = 6,
        RES_NOTICE_CONNECTED_USER = 7,
        RES_NOTICE_DISCONNECTED_USER = 8,
        RES_GET_USER_INFO = 9,
        RES_FOLLOWS = 10,
        RES_FOLLOWERS = 11,
        RES_CHAT_ROOMS = 12,
        RES_FOLLOW = 13,
        RES_UNFOLLOW = 14,
        RES_FOLLOWER = 15,
        RES_UNFOLLOWER = 16,
        RES_START_CHAT = 17,
        RES_CHANGE_USER_NAME = 18,
        RES_NOTICE_USER_NAME_CHANGED = 19,
        RES_CHANGE_USER_MESSAGE = 20,
        RES_NOTICE_USER_MESSAGE_CHANGED = 21,
        RES_CHANGE_USER_PROFILE = 22,
        RES_NOTICE_USER_PROFILE_CHANGED = 23,
        RES_REMOVE_USER_PROFILE = 24,
        RES_NOTICE_USER_PROFILE_REMOVED = 25,
        RES_CREATE_CHAT_ROOM = 26,
        RES_ADD_CHAT_ROOM = 27,
        RES_REMOTE_CHAT_ROOM = 28,
        RES_ENTER_CHAT_ROOM = 29,
        RES_EXIT_CHAT_ROOM = 30,
        RES_UPDATE_CHAT_ROOM = 31,
        RES_NOTICE_ENTER_CHAT_ROOM = 32,
        RES_NOTICE_EXIT_CHAT_ROOM = 33,
        RES_NOTICE_CHANGE_NAME_CHAT_ROOM = 34,
        RES_NOTICE_CHAT_ROOM = 35,
        RES_TALK_CHAT_ROOM = 36,
        RES_HISTORY_CHAT_ROOM = 37,
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
        PREPARED = 0,
        PRIVATE = 1,
        PUBLIC = 2,
    }

    export enum TabType {
        FOLLOW = 0,
        CHAT = 1,
        SEARCH = 2
    }

    export enum NotificationType {
        FOLLOWER = 0,
        CHAT = 1,
    }
}
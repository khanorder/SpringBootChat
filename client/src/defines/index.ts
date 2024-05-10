export namespace Defines {

    export enum ReqType {
        REQ_NONE = 0,
        REQ_CHECK_CONNECTION = 1,
        REQ_CHECK_AUTHENTICATION = 2,
        REQ_SIGN_IN = 3,
        REQ_SIGN_OUT = 4,
        REQ_CHECK_NOTIFICATION = 5,
        REQ_REMOVE_NOTIFICATION = 6,
        REQ_CONNECTED_USERS = 7,
        REQ_GET_TOKEN_USER_INFO = 8,
        REQ_GET_OTHERS_USER_INFO = 9,
        REQ_FOLLOW = 10,
        REQ_UNFOLLOW = 11,
        REQ_START_CHAT = 12,
        REQ_CHANGE_NICK_NAME = 13,
        REQ_CHANGE_USER_MESSAGE = 14,
        REQ_CHANGE_USER_PROFILE = 15,
        REQ_REMOVE_USER_PROFILE = 16,
        REQ_CREATE_CHAT_ROOM = 17,
        REQ_ADD_USER_CHAT_ROOM = 18,
        REQ_REMOVE_CHAT_ROOM = 19,
        REQ_ENTER_CHAT_ROOM = 20,
        REQ_EXIT_CHAT_ROOM = 21,
        REQ_TALK_CHAT_ROOM = 22,
        REQ_HISTORY_CHAT_ROOM = 23,
        REQ_TEST = 255,
    }

    export enum ResType {
        RES_NONE = 0,
        RES_CHECK_CONNECTION = 1,
        RES_CHECK_AUTHENTICATION = 2,
        RES_SIGN_IN = 3,
        RES_SIGN_OUT = 4,
        RES_DEMAND_REFRESH_TOKEN = 5,
        RES_ACCESS_TOKEN_EXPIRED = 6,
        RES_REFRESH_TOKEN_EXPIRED = 7,
        RES_NOTIFICATION = 8,
        RES_NOTIFICATIONS_START_CHAT = 9,
        RES_NOTIFICATIONS_FOLLOWER = 10,
        RES_CHECK_NOTIFICATION = 11,
        RES_REMOVE_NOTIFICATION = 12,
        RES_LATEST_ACTIVE_USERS = 13,
        RES_CONNECTED_USERS = 14,
        RES_NOTICE_CONNECTED_USER = 15,
        RES_NOTICE_DISCONNECTED_USER = 16,
        RES_GET_TOKEN_USER_INFO = 17,
        RES_GET_OTHERS_USER_INFO = 18,
        RES_FOLLOWS = 19,
        RES_FOLLOWERS = 20,
        RES_CHAT_ROOMS = 21,
        RES_FOLLOW = 22,
        RES_UNFOLLOW = 23,
        RES_FOLLOWER = 24,
        RES_UNFOLLOWER = 25,
        RES_START_CHAT = 26,
        RES_OPEN_PREPARED_CHAT_ROOM = 27,
        RES_CHANGE_NICK_NAME = 28,
        RES_NOTICE_NICK_NAME_CHANGED = 29,
        RES_CHANGE_USER_MESSAGE = 30,
        RES_NOTICE_USER_MESSAGE_CHANGED = 31,
        RES_CHANGE_USER_PROFILE = 32,
        RES_NOTICE_USER_PROFILE_CHANGED = 33,
        RES_REMOVE_USER_PROFILE = 34,
        RES_NOTICE_USER_PROFILE_REMOVED = 35,
        RES_CREATE_CHAT_ROOM = 36,
        RES_ADD_USER_CHAT_ROOM = 37,
        RES_ADD_CHAT_ROOM = 38,
        RES_REMOTE_CHAT_ROOM = 39,
        RES_ENTER_CHAT_ROOM = 40,
        RES_EXIT_CHAT_ROOM = 41,
        RES_UPDATE_CHAT_ROOM = 42,
        RES_NOTICE_ADD_CHAT_ROOM_USER = 43,
        RES_NOTICE_REMOVE_CHAT_ROOM_USER = 44,
        RES_NOTICE_ENTER_CHAT_ROOM = 45,
        RES_NOTICE_EXIT_CHAT_ROOM = 46,
        RES_NOTICE_CHANGE_NICK_NAME_CHAT_ROOM = 47,
        RES_NOTICE_CHAT_ROOM = 48,
        RES_TALK_CHAT_ROOM = 49,
        RES_HISTORY_CHAT_ROOM = 50,
        RES_TEST = 255,
    }

    export enum TokenType {
        NONE = 0,
        ACCESS = 1,
        REFRESH = 2
    }

    export enum AccountType {
        NONE = 0,
        TEMP = 1,
        NORMAL = 2
    }

    export enum AllowedImageType {
        NONE = 0,
        PNG = 1,
        JPG = 2,
        GIF = 3,
        BMP = 4,
        SVG = 5,
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
        SEARCH = 2,
        SETTING = 3,
    }

    export enum NotificationType {
        FOLLOWER = 0,
        START_CHAT = 1,
        ADD_USER_CHAT_ROOM = 2,
    }

    export enum SlideDialogType {
        PROFILE = 0,
        NOTIFICATION = 1,
        CHAT_ROOM_INFO = 2,
    }

    export enum CenterDialogType {
        CREATE_CHAT_ROOM = 0,
        PROFILE_IMAGE_INPUT = 1,
        CHAT_IMAGE_INPUT = 2,
        ADD_USER_CHAT_ROOM = 3,
        CHANGE_USER = 4,
        SIGN_UP = 5,
        SIGN_IN = 6,
        IMOJI_INPUT = 7,
        CHAT_DETAIL = 8,
    }

    export enum CenterDialogSize {
        TINY = 0,
        SMALL = 1,
        MEDIUM = 2,
        LARGE = 3,
    }
}
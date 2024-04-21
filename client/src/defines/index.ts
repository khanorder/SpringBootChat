export namespace Defines {

    export enum ReqType {
        REQ_NONE = 0,
        REQ_CHECK_CONNECTION = 1,
        REQ_CHECK_AUTHENTICATION = 2,
        REQ_SIGN_OUT = 3,
        REQ_CHECK_NOTIFICATION = 4,
        REQ_REMOVE_NOTIFICATION = 5,
        REQ_CONNECTED_USERS = 6,
        REQ_GET_TOKEN_USER_INFO = 7,
        REQ_GET_OTHERS_USER_INFO = 8,
        REQ_FOLLOW = 9,
        REQ_UNFOLLOW = 10,
        REQ_START_CHAT = 11,
        REQ_CHANGE_USER_NAME = 12,
        REQ_CHANGE_USER_MESSAGE = 13,
        REQ_CHANGE_USER_PROFILE = 14,
        REQ_REMOVE_USER_PROFILE = 15,
        REQ_CREATE_CHAT_ROOM = 16,
        REQ_ADD_USER_CHAT_ROOM = 17,
        REQ_REMOVE_CHAT_ROOM = 18,
        REQ_ENTER_CHAT_ROOM = 19,
        REQ_EXIT_CHAT_ROOM = 20,
        REQ_TALK_CHAT_ROOM = 21,
        REQ_HISTORY_CHAT_ROOM = 22,
        REQ_TEST = 255,
    }

    export enum ResType {
        RES_NONE = 0,
        RES_CHECK_CONNECTION = 1,
        RES_CHECK_AUTHENTICATION = 2,
        RES_SIGN_OUT = 3,
        RES_NOTIFICATION = 4,
        RES_NOTIFICATIONS_START_CHAT = 5,
        RES_NOTIFICATIONS_FOLLOWER = 6,
        RES_CHECK_NOTIFICATION = 7,
        RES_REMOVE_NOTIFICATION = 8,
        RES_LATEST_ACTIVE_USERS = 9,
        RES_CONNECTED_USERS = 10,
        RES_NOTICE_CONNECTED_USER = 11,
        RES_NOTICE_DISCONNECTED_USER = 12,
        RES_GET_TOKEN_USER_INFO = 13,
        RES_GET_OTHERS_USER_INFO = 14,
        RES_FOLLOWS = 15,
        RES_FOLLOWERS = 16,
        RES_CHAT_ROOMS = 17,
        RES_FOLLOW = 18,
        RES_UNFOLLOW = 19,
        RES_FOLLOWER = 20,
        RES_UNFOLLOWER = 21,
        RES_START_CHAT = 22,
        RES_OPEN_PREPARED_CHAT_ROOM = 23,
        RES_CHANGE_USER_NAME = 24,
        RES_NOTICE_USER_NAME_CHANGED = 25,
        RES_CHANGE_USER_MESSAGE = 26,
        RES_NOTICE_USER_MESSAGE_CHANGED = 27,
        RES_CHANGE_USER_PROFILE = 28,
        RES_NOTICE_USER_PROFILE_CHANGED = 29,
        RES_REMOVE_USER_PROFILE = 30,
        RES_NOTICE_USER_PROFILE_REMOVED = 31,
        RES_CREATE_CHAT_ROOM = 32,
        RES_ADD_USER_CHAT_ROOM = 33,
        RES_ADD_CHAT_ROOM = 34,
        RES_REMOTE_CHAT_ROOM = 35,
        RES_ENTER_CHAT_ROOM = 36,
        RES_EXIT_CHAT_ROOM = 37,
        RES_UPDATE_CHAT_ROOM = 38,
        RES_NOTICE_ADD_CHAT_ROOM_USER = 39,
        RES_NOTICE_REMOVE_CHAT_ROOM_USER = 40,
        RES_NOTICE_ENTER_CHAT_ROOM = 41,
        RES_NOTICE_EXIT_CHAT_ROOM = 42,
        RES_NOTICE_CHANGE_NAME_CHAT_ROOM = 43,
        RES_NOTICE_CHAT_ROOM = 44,
        RES_TALK_CHAT_ROOM = 45,
        RES_HISTORY_CHAT_ROOM = 46,
        RES_TEST = 255,
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
        SEARCH = 2
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
    }

    export enum CenterDialogSize {
        SMALL = 0,
        MEDIUM = 1,
        LARGE = 2,
    }
}
export namespace Errors {
    export enum CheckAuth {
        NONE = 0,
        NOT_VALID_TOKEN = 1,
        TOKEN_IS_EMPTY = 2,
        AUTH_EXPIRED = 3,
        ALREADY_SIGN_IN_USER = 4,
        FAILED_TO_CREATE_USER = 5,
        FAILED_TO_ISSUE_TOKEN = 6,
        FAILED_TO_AUTH = 7,
    }

    export enum SignUp {
        NONE = 0,
        UPGRADE_EXISTS_ACCOUNT = 1,
        USER_NAME_REQUIRED = 2,
        USER_NAME_TOO_SHORT = 3,
        ALREADY_USED_USER_NAME = 4,
        PASSWORD_REQUIRED = 5,
        PASSWORD_TOO_SHORT = 6,
        NOT_SUITABLE_PASSWORD = 7,
        NOT_VALID_ACCESS_TOKEN = 8,
        NOT_VALID_TOKEN_USER = 9,
        NOT_VALID_ACCOUNT_TYPE = 10,
        NOT_FOUND_TEMP_USER = 11,
        FAILED_TO_ISSUE_TOKEN = 12,
        FAILED_TO_SIGN_UP = 13,
    }

    export enum SignIn {
        NONE = 0,
        USER_NAME_REQUIRED = 1,
        PASSWORD_REQUIRED = 2,
        ALREADY_SIGN_IN = 3,
        FAILED_TO_SIGN_IN = 4,
    }

    export enum SignOut {
        NONE = 0,
        AUTH_REQUIRED = 1,
        NOT_VALID_TOKEN = 2,
        AUTH_EXPIRED = 3,
        ID_REQUIRED = 4,
        NOT_FOUND_USER = 5,
        FAILED_TO_SIGN_OUT = 6,
    }

    export enum ChangePassword {
        NONE = 0,
        AUTH_REQUIRED = 1,
        PASSWORD_REQUIRED = 2,
        NEW_PASSWORD_REQUIRED = 3,
        NEW_PASSWORD_CONFIRM_REQUIRED = 4,
        NEW_PASSWORD_NOT_MATCHED = 5,
        NOT_FOUND_USER = 6,
        PASSWORD_NOT_MATCHED = 7,
        FAILED_TO_CHANGE = 8,
    }

    export enum CheckNotification {
        NONE = 0,
        AUTH_REQUIRED = 1,
        ID_REQUIRED = 2,
        NOT_FOUND_NOTIFICATION = 3,
        ALREADY_CHECKED = 4,
        FAILED_TO_CHECK = 5,
    }

    export enum RemoveNotification {
        NONE = 0,
        AUTH_REQUIRED = 1,
        ID_REQUIRED = 2,
        NOT_FOUND_NOTIFICATION = 3,
        FAILED_TO_REMOVE = 4,
    }

    export enum CheckConnection {
        NONE = 0,
        UPDATE_REQUIRED = 1,
    }

    export enum StartChat {
        NONE = 0,
        AUTH_REQUIRED = 1,
        NOT_FOUND_TARGET_USER = 2,
        FAILED_TO_START_CHAT = 3,
    }

    export enum ChangeUserProfile {
        NONE = 0,
        AUTH_REQUIRED = 1,
        DATA_TOO_LONG = 2,
        NOT_SUITABLE_DATA = 3,
        NOT_ALLOWED_FIlE_TYPE = 4,
        SMALL_IMAGE_REQUIRED = 5,
        LARGE_IMAGE_REQUIRED = 6,
        SMALL_IMAGE_BYTES_TOO_LONG = 7,
        LARGE_IMAGE_BYTES_TOO_LONG = 8,
        FAILED_TO_CHANGE = 9,
    }

    export enum RemoveUserProfile {
        NONE = 0,
        AUTH_REQUIRED = 1,
        NOT_HAVE_PROFILE = 2,
        FAILED_TO_REMOVE = 3,
    }

    export enum CreateChatRoom {
        NONE = 0,
        AUTH_REQUIRED = 1,
        NOT_ALLOWED_OPEN_TYPE = 2,
        NOT_MATCHED_USER = 3,
        EXISTS_ROOM = 4,
        FAILED_TO_CREATE = 5,
        REQUIRED_ROOM_ID = 6,
    }

    export enum RemoveChatRoom {
        NONE = 0,
        AUTH_REQUIRED = 1,
        REQUIRED_ROOM_ID = 2,
        NOT_FOUND_CHAT_ROOM = 3,
        NOT_ALLOWED_OPEN_TYPE = 4,
        NOT_IN_ROOM = 5,
        FAILED_TO_REMOVE = 6,
    }

    export enum GetTokenUserInfo {
        NONE = 0,
        NOT_VALID_TOKEN = 1,
        AUTH_EXPIRED = 2,
        NOT_FOUND_USER = 3,
    }

    export enum GetOthersUserInfo {
        NONE = 0,
        AUTH_REQUIRED = 1,
        NOT_FOUND_USER = 2,
    }

    export enum Follow {
        NONE = 0,
        AUTH_REQUIRED = 1,
        NOT_FOUND_USER = 2,
        CAN_NOT_FOLLOW_SELF = 3,
        ALREADY_FOLLOWED = 4,
        FAILED_TO_FOLLOW = 5,
    }

    export enum Unfollow {
        NONE = 0,
        AUTH_REQUIRED = 1,
        NOT_FOUND_USER = 2,
        CAN_NOT_UNFOLLOW_SELF = 3,
        NOT_FOUND_FOLLOWED = 4,
        FAILED_TO_UNFOLLOW = 5,
    }

    export enum ExitChatRoom {
        NONE = 0,
        AUTH_REQUIRED = 1,
        ROOM_REMOVED = 2,
        NO_EXISTS_ROOM = 3,
        NOT_IN_ROOM = 4,
        FAILED_TO_EXIT = 5,
    }

    export enum EnterChatRoom {
        NONE = 0,
        AUTH_REQUIRED = 1,
        ROOM_REMOVED = 2,
        NO_EXISTS_ROOM = 3,
        NOT_MATCHED_USER = 4,
        ALREADY_IN_ROOM = 5,
        NOT_AVAILABLE_ROOM = 6,
        FAILED_TO_ENTER = 7,
    }

    export enum TalkChatRoom {
        NONE,
        NOT_FOUND_USER = 1,
        ROOM_REMOVED = 2,
        NO_EXISTS_ROOM = 3,
        NOT_IN_ROOM = 4,
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

    export enum SubscribeNotification {
        NONE = 0,
        REQUIRED_USER_ID = 1,
        NOT_FOUND_USER = 2,
        ALREADY_SUBSCRIBE = 3,
        FAILED_SUBSCRIBE = 4,
    }

    export enum DownloadChatImage {
        NONE = 0,
        AUTH_REQUIRED = 1,
        ID_REQUIRED = 2,
        NOT_FOUND_DATA = 3,
        NOT_FOUND_FILE = 4,
        FAILED_TO_DOWNLOAD = 5,
    }
}
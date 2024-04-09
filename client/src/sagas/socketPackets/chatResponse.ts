import {Domains} from "@/domains";
import {Errors} from "@/defines/errors";
import {Helpers} from "@/helpers";
import {
    addChatRooms,
    removeChatRooms,
    setChatRooms,
    setChatRoomUsers,
    addChatData,
    setChatDatas,
    exitChatRoom,
    enterChatRoom,
    ChatState
} from '@/stores/reducers/chat';
import {
    addConnectedUser,
    addFollow,
    addFollower,
    removeConnectedUser,
    removeFollow, removeFollower,
    setAuthState,
    setConnectedUsers,
    setFollowers,
    setFollows,
    setUserId,
    setUserName
} from '@/stores/reducers/user';
import {put, select} from "redux-saga/effects";
import {Defines} from "@/defines";
import {v4 as uuid} from "uuid";
import {push} from "connected-next-router";
import isEmpty from "lodash/isEmpty";
import {RootState} from "@/stores/reducers";

export function* checkAuthenticationRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - checkAuthentication`);

    const response = Domains.CheckAuthenticationRes.decode(data);
    if (null == response) {
        alert('데이터 형식 오류.');
        return null;
    }

    switch (response.result) {
        case Errors.CheckAuthentication.NONE:
            yield put(setAuthState(Defines.AuthStateType.SIGN_IN));
            yield put(setUserId(response.userId));
            yield put(setUserName(response.userName));
            yield put(setFollows(response.follows));
            yield put(setFollowers(response.followers));
            yield put(setChatRooms(response.chatRooms));
            Helpers.setCookie("userId", response.userId, 3650);

            break;

        case Errors.CheckAuthentication.ALREADY_SIGN_IN_USER:
            yield put(setAuthState(Defines.AuthStateType.ALREADY_SIGN_IN));
            alert('다른 창으로 로그인 중입니다.');
            break;

        case Errors.CheckAuthentication.FAILED_TO_CREATE_USER:
            alert('유저 생성 실패.');
            break;
    }

    return response;
}

export function* connectedUsersRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - connectedUsers`);

    const response = Domains.ConnectedUsersRes.decode(data);
    if (null == response) {
        alert('데이터 형식 오류.');
        return null;
    }

    yield put(setConnectedUsers(response.users));
    return response;
}

export function* noticeConnectedUserRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - noticeConnectedUser`);

    const response = Domains.NoticeConnectedUserRes.decode(data);
    if (null == response) {
        alert('데이터 형식 오류.');
        return null;
    }

    if (null == response.user) {
        return null;
    }

    yield put(addConnectedUser(response.user));
    return response;
}

export function* noticeDisconnectedUserRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - noticeDisconnectedUser`);

    const response = Domains.NoticeDisconnectedUserRes.decode(data);
    if (null == response) {
        alert('데이터 형식 오류.');
        return null;
    }

    if (isEmpty(response.userId)) {
        return null;
    }

    yield put(removeConnectedUser(response.userId));
    return response;
}

export function* followRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - followRes`);

    const response = Domains.FollowRes.decode(data);
    if (null == response) {
        alert('데이터 형식 오류.');
        return null;
    }
    
    switch (response.result) {
        case Errors.Follow.NONE:
            if (null != response.user)
                yield put(addFollow(response.user));
            break;

        case Errors.Follow.AUTH_REQUIRED:
            alert('로그인 후 이용해 주세요.');
            break;

        case Errors.Follow.NOT_FOUND_USER:
            alert('사용자를 찾을 수 없습니다.');
            break;

        case Errors.Follow.CAN_NOT_FOLLOW_SELF:
            alert('자신은 팔로우 할 수 없습니다.');
            break;

        case Errors.Follow.ALREADY_FOLLOWED:
            alert('팔로우 중인 사용자 입니다.');
            break;

        case Errors.Follow.FAILED_TO_FOLLOW:
            alert('팔로우하지 못했습니다.');
            break;
    }

    return response;
}

export function* unfollowRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - followRes`);

    const response = Domains.UnfollowRes.decode(data);
    if (null == response) {
        alert('데이터 형식 오류.');
        return null;
    }

    switch (response.result) {
        case Errors.Unfollow.NONE:
            if (!isEmpty(response.userId))
                yield put(removeFollow(response.userId));
            break;

        case Errors.Unfollow.AUTH_REQUIRED:
            alert('로그인 후 이용해 주세요.');
            break;

        case Errors.Unfollow.NOT_FOUND_USER:
            alert('사용자를 찾을 수 없습니다.');
            break;

        case Errors.Unfollow.CAN_NOT_UNFOLLOW_SELF:
            alert('자신은 팔로우 할 수 없습니다.');
            break;

        case Errors.Unfollow.NOT_FOUND_FOLLOWED:
            alert('팔로우 중인 사용자가 아닙니다.');
            break;

        case Errors.Unfollow.FAILED_TO_UNFOLLOW:
            alert('언팔로우하지 못했습니다.');
            break;
    }

    return response;
}

export function* followerRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - followerRes`);

    const response = Domains.FollowerRes.decode(data);
    if (null == response) {
        alert('데이터 형식 오류.');
        return null;
    }

    if (null != response.user)
        yield put(addFollower(response.user));

    return response;
}

export function* unfollowerRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - unfollowerRes`);

    const response = Domains.UnfollowerRes.decode(data);
    if (null == response) {
        alert('데이터 형식 오류.');
        return null;
    }

    if (!isEmpty(response.userId))
        yield put(removeFollower(response.userId));

    return response;
}

export function* createChatRoomRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - createChatRoom`);

    const response = Domains.CreateChatRoomRes.decode(data);
    if (null == response) {
        alert('데이터 형식 오류.');
        return null;
    }

    switch (response.result) {
        case Errors.CreateChatRoom.NONE:
            yield put(enterChatRoom(response.roomId));
            yield put(push(`/chat/${Helpers.getBase62FromUUID(response.roomId)}`));

            break;

        case Errors.CreateChatRoom.NOT_ALLOWED_OPEN_TYPE:
            alert('채팅방 공개 범위가 잘못 설되었습니다.');
            break;

        case Errors.CreateChatRoom.EXISTS_ROOM:
            alert('이미 개설된 채팅방 이름입니다.');
            break;
    }

    return response;
}

export function* addChatRoomRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - createChatRoom`);

    const response = Domains.AddChatRoomRes.decode(data);
    if (null == response) {
        alert('데이터 형식 오류.');
        return null;
    }

    if (isEmpty(response.roomId)) {
        return null;
    }

    if (isEmpty(response.roomName)) {
        return null;
    }

    const chatState: ChatState = yield select((state: RootState) => state.chat);
    const existsRoom = chatState.chatRooms.find(_ => _.roomId == response.roomId);

    if ('undefined' != typeof existsRoom && null != existsRoom)
        return response;

    yield put(addChatRooms([new Domains.ChatRoom(response.roomId, response.roomName, response.roomOpenType, [], [])]));

    return response;
}

export function* removeChatRoomRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - removeChatRoomRes`);

    const response = Domains.RemoveChatRoomRes.decode(data);
    if (null == response) {
        alert('데이터 형식 오류.');
        return null;
    }

    if (isEmpty(response.roomId))
        return response;

    const chatState: ChatState = yield select((state: RootState) => state.chat);
    const existsRoom = chatState.chatRooms.find(_ => _.roomId == response.roomId);

    if (null == existsRoom || 'undefined' == typeof existsRoom)
        return response;

    yield put(removeChatRooms([response.roomId]));

    return response;
}

export function* updateChatRoomsRes(data: Uint8Array) {
    const response = Domains.UpdateChatRoomsRes.decode(data);
    if (response && 0 < response.roomIds.length) {
        const list: Domains.ChatRoom[] = [];
        for (let i = 0; i < response.roomIds.length; i++) {
            list.push(new Domains.ChatRoom(response.roomIds[i], response.roomNames[i], Defines.RoomOpenType.PRIVATE, [], []));

        }
        yield put(setChatRooms(list));
    }
    return response;
}

export function* updateChatRoomRes(data: Uint8Array) {
    const response = Domains.UpdateChatRoomUsersRes.decode(data);
    yield put(setChatRoomUsers({roomId: response?.roomId ?? '', chatRoomUsers: []}));
    if (response && 0 < response.userIds.length) {
        const list: Domains.User[] = [];
        for (let i = 0; i < response.userIds.length; i++)
            list.push(new Domains.User(response.userIds[i], response.userNames[i]));

        yield put(setChatRoomUsers({roomId: response?.roomId ?? '', chatRoomUsers: list}));
    }
    return response;
}

export function* enterChatRoomRes(data: Uint8Array) {
    const response = Domains.EnterChatRoomRes.decode(data);

    if (!response) {
        alert('데이터 형식 오류.');
        return null;
    }

    switch (response.result) {
        case Errors.EnterChatRoom.NONE:
            yield put(enterChatRoom(response.roomId));
            yield put(push(`/chat/${Helpers.getBase62FromUUID(response.roomId)}`));
            break;

        case Errors.EnterChatRoom.NO_EXISTS_ROOM:
            alert('그런 채팅방은 없습니다.');
            break;

        case Errors.EnterChatRoom.NOT_FOUND_USER:
            alert('유저 정보를 찾을 수 없습니다.');
            break;

        case Errors.EnterChatRoom.ALREADY_IN_ROOM:
            alert('이미 입장한 채팅방 입니다.');
            break;
    }

    return response;
}

export function* exitChatRoomRes(data: Uint8Array) {
    const response = Domains.ExitChatRoomRes.decode(data);

    if (null == response) {
        alert('데이터 형식 오류.');
        return null;
    }

    switch (response.result) {
        case Errors.ExitChatRoom.NONE:
            break;

        case Errors.ExitChatRoom.ROOM_REMOVED:
            alert('삭제된 채팅방입니다.');
            break;

        case Errors.ExitChatRoom.NO_EXISTS_ROOM:
            alert('그 채팅방은 없습니다.');
            break;

        case Errors.ExitChatRoom.NOT_IN_ROOM:
            alert('현재 그 채팅방에 입장중이 아닙니다.');
            break;

        case Errors.ExitChatRoom.FAILED_TO_EXIT:
            alert('채팅방 나가기 실패.');
            break;
    }

    yield put(exitChatRoom());
    yield put(push('/'));

    return response;
}

export function* noticeEnterChatRoomRes(data: Uint8Array) {
    const response = Domains.NoticeEnterChatRoomRes.decode(data);

    const enterNotice = new Domains.Chat(Defines.ChatType.NOTICE, response?.roomId ?? '', uuid(), uuid(), new Date().getTime(), '', `'${response?.userName}'님이 입장했습니다.`);
    yield put(addChatData({roomId: response?.roomId ?? '', chatData: enterNotice}));
    return response;
}

export function* noticeExitChatRoomRes(data: Uint8Array) {
    const response = Domains.NoticeExitChatRoomRes.decode(data);

    const exitNotice = new Domains.Chat(Defines.ChatType.NOTICE, response?.roomId ?? '', uuid(), uuid(), new Date().getTime(), '', `'${response?.userName}'님이 퇴장했습니다.`);
    yield put(addChatData({roomId: response?.roomId ?? '', chatData: exitNotice}));
    return response;
}

export function* noticeChangeNameChatRoomRes(data: Uint8Array) {
    const response = Domains.NoticeChangeNameChatRoomRes.decode(data);

    const changeNameNotice = new Domains.Chat(Defines.ChatType.NOTICE, response?.roomId ?? '', uuid(), uuid(), new Date().getTime(), '', `'${response?.oldUserName}'님이 '${response?.newUserName}'으로 대화명을 변경했습니다.`);
    yield put(addChatData({roomId: response?.roomId ?? '', chatData: changeNameNotice}));
    return response;
}

export function* talkChatRoomRes(data: Uint8Array) {
    const response = Domains.TalkChatRoomRes.decode(data);
    if (!response)
        return null;

    yield put(addChatData({roomId: response.roomId ?? '', chatData: response.getChatData()}));
    return response;
}

export function* historyChatRoomRes(data: Uint8Array) {
    const response = Domains.HistoryChatRoomRes.decode(data);
    if (!response)
        return null;

    yield put(setChatDatas({ roomId: response.roomId ?? '', chatDatas: response.getChatHistories()}));
    return response;
}
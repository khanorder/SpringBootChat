import {Domains} from "@/domains";
import {Errors} from "@/defines/errors";
import {Helpers} from "@/helpers";
import {
    addChatRoom,
    removeChatRoom,
    setChatRoomList,
    addChatRoomUser,
    removeChatRoomUser,
    setChatRoomUserList,
    addChatData,
    setChatDatas,
    ChatState
} from '@/stores/reducers/chat';
import {
    setUserId,
    setUserName
} from '@/stores/reducers/user';
import {put, select} from "redux-saga/effects";
import {RootState} from "@/stores/reducers";
import {Defines} from "@/defines";
import {v4 as uuid} from "uuid";
import deepmerge from "deepmerge";
import {push} from "connected-next-router";

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
            yield put(setChatDatas([]));
            yield put(setUserId(response.userId));
            yield put(push(`/chat/${Helpers.getBase62FromUUID(response.roomId)}`));

            break;

        case Errors.CreateChatRoom.EXISTS_ROOM:
            alert('이미 개설된 채팅방 이름입니다.');
            break;
    }

    return response;
}

export function* updateChatRoomsRes(data: Uint8Array) {
    const response = Domains.UpdateChatRoomsRes.decode(data);
    yield put(setChatRoomList([]));
    if (response && 0 < response.roomIds.length) {
        const list: Domains.ChatRoom[] = [];
        for (let i = 0; i < response.roomIds.length; i++) {
            list.push(new Domains.ChatRoom(response.roomIds[i], response.roomNames[i], response.roomUserCounts[i]));

        }
        yield put(setChatRoomList(list));
    }
    return response;
}

export function* updateChatRoomRes(data: Uint8Array) {
    const response = Domains.UpdateChatRoomUsersRes.decode(data);
    yield put(setChatRoomUserList([]));
    if (response && 0 < response.userIds.length) {
        const list: Domains.ChatRoomUser[] = [];
        for (let i = 0; i < response.userIds.length; i++) {
            list.push(new Domains.ChatRoomUser(response.userIds[i], response.userNames[i]));

        }
        yield put(setChatRoomUserList(list));
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
            const chatState: ChatState = yield select((state: RootState) => state.chat);
            yield put(setChatDatas([]));
            yield put(setUserId(response.userId));
            yield put(push(`/chat/${Helpers.getBase62FromUUID(response.roomId)}`));
            break;

        case Errors.EnterChatRoom.NO_EXISTS_ROOM:
            alert('그런 채팅방은 없습니다..');
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
    yield put(setChatDatas([]));
    yield put(setUserId(''));
    yield put(setUserName(''));
    yield put(setChatRoomUserList([]));
    yield put(push('/'));

    return response;
}

export function* noticeEnterChatRoomRes(data: Uint8Array) {
    const response = Domains.NoticeEnterChatRoomRes.decode(data);

    const enterNotice = new Domains.Chat(Defines.ChatType.NOTICE, response?.roomId ?? '', uuid(), uuid(), new Date().getTime(), '', `'${response?.userName}'님이 입장했습니다.`);
    yield put(addChatData(enterNotice));
    return response;
}

export function* noticeExitChatRoomRes(data: Uint8Array) {
    const response = Domains.NoticeExitChatRoomRes.decode(data);

    const exitNotice = new Domains.Chat(Defines.ChatType.NOTICE, response?.roomId ?? '', uuid(), uuid(), new Date().getTime(), '', `'${response?.userName}'님이 퇴장했습니다.`);
    yield put(addChatData(exitNotice));
    return response;
}

export function* talkChatRoomRes(data: Uint8Array) {
    const response = Domains.TalkChatRoomRes.decode(data);
    if (!response)
        return null;

    yield put(addChatData(response.getChatData()));
    return response;
}
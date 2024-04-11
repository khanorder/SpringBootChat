import {select} from "redux-saga/effects";
import {RootState} from "@/stores/reducers";
import {UserState} from "@/stores/reducers/user";
import {WebSocketState} from "@/stores/reducers/webSocket";
import {Defines} from "@/defines";
import {Helpers} from "@/helpers";
import {PayloadAction} from "@reduxjs/toolkit";
import {Domains} from "@/domains";
import isEmpty from "lodash/isEmpty";
import {AppConfigsState} from "@/stores/reducers/appConfigs";

export function* callCheckAuthenticationReq(socket: WebSocket) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callCheckAuthenticationReq`);

    if (!socket || WebSocket.OPEN != socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callCheckAuthenticationReq: socket is not available.`);
        return;
    }

    try {
        const flag = new Uint8Array([Defines.ReqType.REQ_CHECK_AUTHENTICATION]);
        const userId = Helpers.getCookie("userId");
        console.log(`saga - callCheckAuthenticationReq: ${userId}`);
        const bytesUserId = new Uint8Array(isEmpty(userId) || 36 !== userId.length ? 0 : 16);
        if (!isEmpty(userId) && 36 === userId.length)
            bytesUserId.set(Helpers.getByteArrayFromUUID(userId));

        const packet = new Uint8Array(flag.byteLength + bytesUserId.byteLength);
        packet.set(flag);
        if (0 < bytesUserId.byteLength)
            packet.set(bytesUserId, flag.byteLength);

        socket.send(packet);
    } catch (error) {
        console.error(error);
    }
}

export function* callCheckConnectionReq(socket: WebSocket) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - checkConnectionReq`);

    if (!socket || WebSocket.OPEN != socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - checkConnectionReq: socket is not available.`);
        return;
    }

    const appConfigs: AppConfigsState = yield select((state: RootState) => state.appConfigs);

    try {
        const packet = new Uint8Array(
            [
                Defines.ReqType.REQ_CHECK_CONNECTION,
                appConfigs.clientVersionMain,
                appConfigs.clientVersionUpdate,
                appConfigs.clientVersionMaintenance
            ]
        );
        socket.send(packet);
    } catch (error) {
        console.error(error);
    }
}

export function* callConnectedUsersReq() {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callConnectedUsersReq`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callConnectedUsersReq: socket is not available.`);
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_CONNECTED_USERS]);
    webSocketState.socket.send(flag);
}

export function* callFollowReq(action: PayloadAction<Domains.User>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callFollowReq`);

    const userState: UserState = yield select((state: RootState) => state.user);
    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callFollowReq: socket is not available.`);
        return;
    }

    if (!action || !action.payload || isEmpty(action.payload.userId)) {
        alert('팔로우할 사용자를 선택해 주세요.');
        return;
    }
    
    if (userState.id == action.payload.userId) {
        alert('자신을 팔로우 할 수는 없습니다.');
        return;
    }
    
    if (null != userState.follows.find(_ => _.userId == action.payload.userId)) {
        alert('이미 팔로우 한 사용자 입니다!');
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_FOLLOW]);
    const bytesUserId = Helpers.getByteArrayFromUUID(action.payload.userId.trim());
    const packet = Helpers.mergeBytesPacket([flag, bytesUserId]);
    webSocketState.socket.send(packet);
}

export function* callUnfollowReq(action: PayloadAction<Domains.User>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callUnfollowReq`);

    const userState: UserState = yield select((state: RootState) => state.user);
    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callUnfollowReq: socket is not available.`);
        return;
    }

    if (!action || !action.payload || isEmpty(action.payload.userId)) {
        alert('언팔로우할 사용자를 선택해 주세요.');
        return;
    }

    if (userState.id == action.payload.userId) {
        alert('자신을 언팔로우 할 수는 없습니다.');
        return;
    }

    if (null == userState.follows.find(_ => _.userId == action.payload.userId)) {
        alert('팔로우 중인 사용자가 아닙다.');
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_UNFOLLOW]);
    const bytesUserId = Helpers.getByteArrayFromUUID(action.payload.userId.trim());
    const packet = Helpers.mergeBytesPacket([flag, bytesUserId]);
    webSocketState.socket.send(packet);
}

export function* callStartChatReq(action: PayloadAction<Domains.User>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callStartChatReq`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callStartChatReq: socket is not available.`);
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_START_CHAT]);
    const bytesUserId = Helpers.getByteArrayFromUUID(action.payload.userId);
    const packet = Helpers.mergeBytesPacket([flag, bytesUserId]);
    webSocketState.socket.send(packet);
}

export function* callCreateChatRoomReq(action: PayloadAction<Domains.CreateChatRoomReq>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callCreateChatRoomReq`);

    const userState: UserState = yield select((state: RootState) => state.user);
    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callCreateChatRoomReq: socket is not available.`);
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_CREATE_CHAT_ROOM]);
    const bytesRoomOpenType = new Uint8Array([action.payload.openType]);
    const bytesUserId = Helpers.getByteArrayFromUUID(userState.id.trim());
    const bytesChatRoomName = new Uint8Array(Buffer.from(action.payload.roomName.trim(), 'utf-8'));
    const packet = Helpers.mergeBytesPacket([flag, bytesRoomOpenType, bytesUserId, bytesChatRoomName]);
    webSocketState.socket.send(packet);
}

export function* callEnterChatRoomReq(action: PayloadAction<string>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callEnterChatRoomReq`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callEnterChatRoomReq: socket is not available.`);
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_ENTER_CHAT_ROOM]);
    const bytesChatRoomId = Helpers.getByteArrayFromUUID(action.payload.trim());
    const packet = Helpers.mergeBytesPacket([flag, bytesChatRoomId]);
    webSocketState.socket.send(packet);
}

export function* callExitChatRoomReq(action: PayloadAction<string>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callExitChatRoomReq`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - sendEnterChatRoomReq: socket is not available.`);
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_EXIT_CHAT_ROOM]);
    const bytesRoomId = Helpers.getByteArrayFromUUID(action.payload);
    const packet = Helpers.mergeBytesPacket([flag, bytesRoomId]);
    webSocketState.socket.send(packet);
}

export function* callSendMessageReq(action: PayloadAction<Domains.SendMessage>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callSendMessageReq`);

    switch (action.payload.type) {
        case Defines.ChatType.TALK:
            break;

        case Defines.ChatType.IMAGE:
            break;

        default:
            if ('production' !== process.env.NODE_ENV)
                console.log(`saga - callSendMessageReq: not available chat type.`);
            return;
    }

    const userState: UserState = yield select((state: RootState) => state.user);
    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callSendMessageReq: socket is not available.`);
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_TALK_CHAT_ROOM]);
    const bytesChatType = new Uint8Array([action.payload.type]);
    const bytesChatId = Helpers.getByteArrayFromUUID(action.payload.id.trim());
    const bytesChatRoomId = Helpers.getByteArrayFromUUID(action.payload.roomId.trim());
    const bytesUserId = Helpers.getByteArrayFromUUID(userState.id.trim());
    const bytesMessage = new Uint8Array(Buffer.from(action.payload.message.trim(), 'utf8'));
    const bytesMessageLength = Helpers.getByteArrayFromInt(bytesMessage.byteLength);
    const packet = Helpers.mergeBytesPacket([flag, bytesChatType, bytesChatId, bytesChatRoomId, bytesUserId, bytesMessageLength, bytesMessage]);
    webSocketState.socket.send(packet);
}

export function* callSaveUserNameReq() {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callSaveUserNameReq`);

    const userState: UserState = yield select((state: RootState) => state.user);
    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callSaveUserNameReq: socket is not available.`);
        return;
    }

    if (!userState.id) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callSaveUserNameReq: not found user id.`);
        return;
    }

    if (2 > userState.name.length || 10 < userState.name.length) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callSaveUserNameReq: not found user id.`);

        alert('대화명은 2 글자 이상, 10 이하로 입력해주세요.');
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_CHANGE_USER_NAME]);
    const bytesUserId = Helpers.getByteArrayFromUUID(userState.id.trim());
    const bytesUserName = new Uint8Array(Buffer.from(userState.name.trim(), 'utf8'));
    const packet = Helpers.mergeBytesPacket([flag, bytesUserId, bytesUserName]);
    webSocketState.socket.send(packet);
}
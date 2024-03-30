import {select} from "redux-saga/effects";
import {RootState} from "@/stores/reducers";
import {UserState} from "@/stores/reducers/user";
import {WebSocketState} from "@/stores/reducers/webSocket";
import {Defines} from "@/defines";
import {Helpers} from "@/helpers";
import {PayloadAction} from "@reduxjs/toolkit";
import {Domains} from "@/domains";

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

    const flag = new Uint8Array([Defines.PacketType.CREATE_CHAT_ROOM]);
    const bytesRoomOpenType = new Uint8Array([action.payload.openType]);
    const bytesUserId = Helpers.getByteArrayFromUUID(userState.id.trim());
    const bytesChatRoomName = new Uint8Array(Buffer.from(action.payload.roomName.trim(), 'utf-8'));
    const packet = Helpers.mergeBytesPacket([flag, bytesRoomOpenType, bytesUserId, bytesChatRoomName]);
    webSocketState.socket.send(packet);
}

export function* callEnterChatRoomReq(action: PayloadAction<string>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callEnterChatRoomReq`);

    const userState: UserState = yield select((state: RootState) => state.user);
    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callEnterChatRoomReq: socket is not available.`);
        return;
    }

    const flag = new Uint8Array([Defines.PacketType.ENTER_CHAT_ROOM]);
    const bytesChatRoomId = Helpers.getByteArrayFromUUID(action.payload.trim());
    const bytesUserId = Helpers.getByteArrayFromUUID(userState.id.trim());
    const packet = Helpers.mergeBytesPacket([flag, bytesChatRoomId, bytesUserId]);
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

    const flag = new Uint8Array([Defines.PacketType.EXIT_CHAT_ROOM]);
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

    const flag = new Uint8Array([Defines.PacketType.TALK_CHAT_ROOM]);
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

    const flag = new Uint8Array([Defines.PacketType.CHANGE_USER_NAME]);
    const bytesUserId = Helpers.getByteArrayFromUUID(userState.id.trim());
    const bytesUserName = new Uint8Array(Buffer.from(userState.name.trim(), 'utf8'));
    const packet = Helpers.mergeBytesPacket([flag, bytesUserId, bytesUserName]);
    webSocketState.socket.send(packet);
}
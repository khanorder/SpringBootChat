import {ChatState} from "@/stores/reducers/chat";
import {select} from "redux-saga/effects";
import {RootState} from "@/stores/reducers";
import {UserState} from "@/stores/reducers/user";
import {WebSocketState} from "@/stores/reducers/webSocket";
import {Defines} from "@/defines";
import {Helpers} from "@/helpers";
import {PayloadAction} from "@reduxjs/toolkit";
import {Domains} from "@/domains";
import ChatType = Defines.ChatType;

export function* callCreateChatRoomReq(action: PayloadAction<string>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callCreateChatRoomReq`);

    const userState: UserState = yield select((state: RootState) => state.user);
    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callCreateChatRoomReq: socket is not available.`);
        return;
    }

    const flag = new Uint8Array(1);
    flag[0] = Defines.PacketType.CREATE_CHAT_ROOM;
    const bytesUserId = Helpers.getByteArrayFromUUID(userState.id.trim());
    const bytesChatRoomName = new Uint8Array(Buffer.from(action.payload.trim(), 'utf-8'));
    const packet = new Uint8Array(flag.byteLength + bytesUserId.byteLength + bytesChatRoomName.byteLength);
    packet.set(flag);
    packet.set(bytesUserId, flag.byteLength);
    packet.set(bytesChatRoomName, flag.byteLength + bytesUserId.byteLength);
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

    const flag = new Uint8Array(1);
    flag[0] = Defines.PacketType.ENTER_CHAT_ROOM;
    const bytesChatRoomId = Helpers.getByteArrayFromUUID(action.payload.trim());
    const bytesUserId = Helpers.getByteArrayFromUUID(userState.id.trim());
    const packet = new Uint8Array(flag.byteLength + bytesChatRoomId.byteLength + bytesUserId.byteLength);
    packet.set(flag);
    packet.set(bytesChatRoomId, flag.byteLength);
    packet.set(bytesUserId, flag.byteLength + bytesChatRoomId.byteLength);
    webSocketState.socket.send(packet);
}

export function* callExitChatRoomReq(action: PayloadAction<string>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callExitChatRoomReq`);

    const chatState: ChatState = yield select((state: RootState) => state.chat);
    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - sendEnterChatRoomReq: socket is not available.`);
        return;
    }

    const flag = new Uint8Array(1);
    flag[0] = Defines.PacketType.EXIT_CHAT_ROOM;
    const message = Helpers.getByteArrayFromUUID(action.payload);
    const packet = new Uint8Array(flag.byteLength + message.byteLength);
    packet.set(flag);
    packet.set(message, flag.byteLength);
    webSocketState.socket.send(packet);
}

export function* callSendMessageReq(action: PayloadAction<Domains.SendMessage>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callSendMessageReq`);

    switch (action.payload.type) {
        case ChatType.TALK:
            break;

        case ChatType.IMAGE:
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

    const flag = new Uint8Array(1);
    flag[0] = Defines.PacketType.TALK_CHAT_ROOM;
    const chatType = new Uint8Array(1);
    chatType[0] = action.payload.type;
    const bytesId = Helpers.getByteArrayFromUUID(action.payload.id.trim());
    const bytesChatRoomId = Helpers.getByteArrayFromUUID(action.payload.roomId.trim());
    const bytesUserId = Helpers.getByteArrayFromUUID(userState.id.trim());
    const bytesMessage = new Uint8Array(Buffer.from(action.payload.message.trim(), 'utf8'));
    const bytesMessageByteLength = Helpers.getByteArrayFromInt(bytesMessage.byteLength);

    const packet = new Uint8Array(flag.byteLength + bytesId.byteLength + chatType.byteLength + bytesChatRoomId.byteLength + bytesUserId.byteLength + bytesMessageByteLength.length + bytesMessage.byteLength);
    packet.set(flag);
    packet.set(chatType, flag.byteLength);
    packet.set(bytesId, flag.byteLength + chatType.byteLength);
    packet.set(bytesChatRoomId, flag.byteLength + chatType.byteLength + bytesId.byteLength);
    packet.set(bytesUserId, flag.byteLength + chatType.byteLength + bytesId.byteLength + bytesChatRoomId.byteLength);
    packet.set(bytesMessageByteLength, flag.byteLength + chatType.byteLength + bytesId.byteLength + bytesChatRoomId.byteLength + bytesUserId.byteLength);
    packet.set(bytesMessage, flag.byteLength + chatType.byteLength + bytesId.byteLength + bytesChatRoomId.byteLength + bytesUserId.byteLength + bytesMessageByteLength.length);
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

    const flag = new Uint8Array(1);
    flag[0] = Defines.PacketType.CHANGE_USER_NAME;
    const bytesUserId = Helpers.getByteArrayFromUUID(userState.id.trim());
    const bytesUserName = new Uint8Array(Buffer.from(userState.name.trim(), 'utf8'));

    const packet = new Uint8Array(flag.byteLength + bytesUserId.byteLength + bytesUserName.byteLength);
    packet.set(flag);
    packet.set(bytesUserId, flag.byteLength);
    packet.set(bytesUserName, flag.byteLength + bytesUserId.byteLength);
    webSocketState.socket.send(packet);
}
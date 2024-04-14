import {put, select, take, takeLatest} from "redux-saga/effects";
import {
    WebSocketState,
    initSocket,
    setSocket,
    setConnectionState,
    addCountTryConnect,
    resetCountTryConnect,
    startReconnecting,
    createChatRoomReq,
    enterChatRoomReq,
    exitChatRoomReq,
    sendMessageReq,
    saveUserNameReq,
    connectedUsersReq,
    followReq,
    unfollowReq,
    startChatReq,
    checkNotificationReq,
    removeNotificationReq,
    saveUserMessageReq,
    saveUserProfileReq,
    removeUserProfileReq,
    historyChatRoomReq,
    removeChatRoomReq
} from '@/stores/reducers/webSocket';
import { RootState } from '@/stores/reducers';
import {PayloadAction} from "@reduxjs/toolkit";
import {call, fork} from "redux-saga/effects";
import { dayjs } from '@/helpers/localizedDayjs';
import {eventChannel, EventChannel, Unsubscribe} from "redux-saga";
import {Defines} from "@/defines";
import {Helpers} from "@/helpers";
import {
    addChatRoomRes,
    checkAuthenticationRes,
    checkConnectionRes,
    connectedUsersRes,
    createChatRoomRes,
    enterChatRoomRes,
    exitChatRoomRes,
    followerRes,
    followRes,
    historyChatRoomRes,
    noticeChangeNameChatRoomRes,
    noticeConnectedUserRes,
    noticeDisconnectedUserRes,
    noticeEnterChatRoomRes,
    noticeExitChatRoomRes,
    removeChatRoomRes,
    talkChatRoomRes,
    unfollowerRes,
    unfollowRes,
    updateChatRoomRes,
    chatRoomsRes,
    followsRes,
    followersRes,
    startChatRes,
    notificationRes,
    checkNotificationRes,
    removeNotificationRes,
    noticeUserNameChangedRes,
    noticeUserMessageChangedRes,
    changeUserProfileRes,
    noticeUserProfileChangedRes,
    removeUserProfileRes, noticeUserProfileRemovedRes
} from "@/sagas/socketPackets/chatResponse";
import {
    callConnectedUsersReq,
    callCreateChatRoomReq,
    callEnterChatRoomReq,
    callExitChatRoomReq,
    callFollowReq,
    callSaveUserNameReq,
    callSendMessageReq,
    callUnfollowReq,
    callCheckConnectionReq,
    callCheckAuthenticationReq,
    callStartChatReq,
    callCheckNotificationReq,
    callRemoveNotificationReq,
    callSaveUserMessageReq,
    callSaveUserProfileReq,
    callRemoveUserProfileReq, callHistoryChatRoomReq, callRemoveChatRoomReq
} from "@/sagas/socketPackets/chatRequest";
import isEmpty from "lodash/isEmpty";

function createConnectionStateChannel (socket: WebSocket): EventChannel<number> {
    return eventChannel<number>(emit => {
        const emitter = () => emit(socket.readyState);
        const interval = 'production' !== process.env.NODE_ENV ? 1000 : 3000;
        const reconnect = setInterval(emitter, interval);
        const unsubscribe: Unsubscribe = () => clearInterval(reconnect);
        return unsubscribe;
    });
}

function* reconnect (socket: WebSocket) {
    const channel: EventChannel<number> = yield call(createConnectionStateChannel, socket);
    yield put(setConnectionState(WebSocket.CONNECTING));

    try {
        while (true) {
            try {
                const readyState: number = yield take(channel);
                if ('production' !== process.env.NODE_ENV)
                    console.log(`saga - reconnect: ${readyState}`);

                switch (readyState) {
                    case WebSocket.CLOSED:
                        channel.close();
                        if ('production' !== process.env.NODE_ENV) {
                            console.log(`saga - reconnect: websocket is trying connect.(${dayjs().format("YYYY-MM-DD HH:mm:ss")})`);
                            console.log(`the reconnect channel closed.`);
                        }
                        break;

                    case WebSocket.OPEN:
                        yield put(setConnectionState(WebSocket.OPEN));
                        yield put(resetCountTryConnect());
                        channel.close();
                        if ('production' !== process.env.NODE_ENV) {
                            console.log(`saga - reconnect: websocket connected to the server.(${dayjs().format("YYYY-MM-DD HH:mm:ss")})`);
                            console.log(`the reconnect channel closed.`);
                        }
                        break;

                    default:
                        if ('production' !== process.env.NODE_ENV)
                            console.log(`websocket ${socket.readyState.toString()}.(${dayjs().format("YYYY-MM-DD HH:mm:ss")})`);
                        break;
                }
            } catch (innerError) {
                console.error(innerError);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

function createCheckConnectionChannel (socket: WebSocket): EventChannel<number> {
    return eventChannel<number>(emit => {
        const emitter = () => emit(socket.readyState);
        const interval = 7000;
        const reconnect = setInterval(emitter, interval);
        const unsubscribe: Unsubscribe = () => clearInterval(reconnect);
        return unsubscribe;
    });
}

export function* checkConnection (socket: WebSocket) {
    const channel: EventChannel<number> = yield call(createCheckConnectionChannel, socket);

    try {
        while (true) {
            try {
                const readyState: 0|1|2|3 = yield take(channel);
                if ('production' !== process.env.NODE_ENV)
                    console.log(`saga - checkConnection: ${readyState}`);

                switch (readyState) {
                    case WebSocket.OPEN:
                        if ('production' !== process.env.NODE_ENV)
                            console.log(`saga - checkConnection: websocket connection checked.(${dayjs().format("YYYY-MM-DD HH:mm:ss")})`);

                        yield setConnectionState(readyState);
                        yield call(callCheckConnectionReq, socket);
                        break;

                    default:
                        if ('production' !== process.env.NODE_ENV)
                            console.log(`saga - checkConnection: stop check connection.(${dayjs().format("YYYY-MM-DD HH:mm:ss")})`);

                        channel.close();
                        break;
                }
            } catch (innerError) {
                console.error(innerError);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

function createWebSocketOpenChannel (socket: WebSocket): EventChannel<Event> {
    return eventChannel<Event>(emit => {
        const emitter = (event: Event) => emit(event);
        socket.addEventListener('open', emitter);
        const unsubscribe: Unsubscribe = () => socket.removeEventListener("open", () => {});
        return unsubscribe;
    });
}

function* onOpen (socket: WebSocket) {
    if (socket) {
        const channel: EventChannel<Event> = yield call(createWebSocketOpenChannel, socket);

        try {
            while (true) {
                try {
                    const event: Event = yield take(channel);
                    yield call(setConnectionState, WebSocket.OPEN);
                    yield call(callCheckAuthenticationReq, socket);

                    if ('production' !== process.env.NODE_ENV)
                        console.log("connection opened.");
                } catch (innerError) {
                    console.error(innerError);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
}

function createWebSocketCloseChannel (socket: WebSocket): EventChannel<Event> {
    return eventChannel<Event>(emit => {
        const emitter = (event: Event) => emit(event);
        socket.addEventListener('close', emitter);
        const unsubscribe: Unsubscribe = () => socket.removeEventListener("close", () => {});
        return unsubscribe;
    });
}

function* onClose (socket: WebSocket) {
    if (socket) {
        const channel: EventChannel<Event> = yield call(createWebSocketCloseChannel, socket);

        try {
            while (true) {
                try {
                    const event: Event = yield take(channel);
                    yield put(addCountTryConnect());
                    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);
                    const maxReTryCount = 'production' !== process.env.NODE_ENV ? 5 : 20;

                    if (maxReTryCount < webSocketState.countTryConnect) {
                        if ('production' !== process.env.NODE_ENV)
                            console.log(`saga - reconnect: stop reconnect.`);

                        yield put(setConnectionState(WebSocket.CLOSED));
                    } else {
                        yield call(setSocketInfo, socket.url);
                    }
                } catch (innerError) {
                    console.error(innerError);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
}

function createWebSocketMessageChannel (socket: WebSocket): EventChannel<MessageEvent> {
    return eventChannel<MessageEvent>(emit => {
        const emitter = (event: MessageEvent) => emit(event);
        socket.addEventListener('message', emitter);
        const unsubscribe: Unsubscribe = () => socket.removeEventListener("message", () => {});
        return unsubscribe;
    });
}

function* onMessage (socket: WebSocket) {
    if (socket) {
        const channel: EventChannel<MessageEvent> = yield call(createWebSocketMessageChannel, socket);

        try {
            while (true) {
                try {
                    const event: MessageEvent = yield take(channel);
                    if (!event.data || !(event.data instanceof ArrayBuffer))
                        continue;

                    const byteLen = event.data.byteLength;

                    if (2 > byteLen)
                        continue;

                    const packetFlag = Helpers.getFlagBytes(event);
                    const packetData = Helpers.getDataBytes(event);

                    switch (packetFlag[0]) {
                        case Defines.ResType.RES_CHECK_CONNECTION:
                            yield call(checkConnectionRes, packetData);
                            break;

                        case Defines.ResType.RES_CHECK_AUTHENTICATION:
                            yield call(checkAuthenticationRes, packetData);
                            break;

                        case Defines.ResType.RES_NOTIFICATION:
                            yield call(notificationRes, packetData);
                            break;

                        case Defines.ResType.RES_CHECK_NOTIFICATION:
                            yield call(checkNotificationRes, packetData);
                            break;

                        case Defines.ResType.RES_REMOVE_NOTIFICATION:
                            yield call(removeNotificationRes, packetData);
                            break;

                        case Defines.ResType.RES_CONNECTED_USERS:
                            yield call(connectedUsersRes, packetData);
                            break;

                        case Defines.ResType.RES_NOTICE_CONNECTED_USER:
                            yield call(noticeConnectedUserRes, packetData);
                            break;

                        case Defines.ResType.RES_NOTICE_DISCONNECTED_USER:
                            yield call(noticeDisconnectedUserRes, packetData);
                            break;

                        case Defines.ResType.RES_FOLLOWS:
                            yield call(followsRes, packetData);
                            break;

                        case Defines.ResType.RES_FOLLOWERS:
                            yield call(followersRes, packetData);
                            break;

                        case Defines.ResType.RES_CHAT_ROOMS:
                            yield call(chatRoomsRes, packetData);
                            break;

                        case Defines.ResType.RES_FOLLOW:
                            yield call(followRes, packetData);
                            break;

                        case Defines.ResType.RES_UNFOLLOW:
                            yield call(unfollowRes, packetData);
                            break;

                        case Defines.ResType.RES_FOLLOWER:
                            yield call(followerRes, packetData);
                            break;

                        case Defines.ResType.RES_UNFOLLOWER:
                            yield call(unfollowerRes, packetData);
                            break;

                        case Defines.ResType.RES_START_CHAT:
                            yield call(startChatRes, packetData);
                            break;

                        case Defines.ResType.RES_NOTICE_USER_NAME_CHANGED:
                            yield call(noticeUserNameChangedRes, packetData);
                            break;

                        case Defines.ResType.RES_NOTICE_USER_MESSAGE_CHANGED:
                            yield call(noticeUserMessageChangedRes, packetData);
                            break;

                        case Defines.ResType.RES_CHANGE_USER_PROFILE:
                            yield call(changeUserProfileRes, packetData);
                            break;

                        case Defines.ResType.RES_NOTICE_USER_PROFILE_CHANGED:
                            yield call(noticeUserProfileChangedRes, packetData);
                            break;

                        case Defines.ResType.RES_REMOVE_USER_PROFILE:
                            yield call(removeUserProfileRes, packetData);
                            break;

                        case Defines.ResType.RES_NOTICE_USER_PROFILE_REMOVED:
                            yield call(noticeUserProfileRemovedRes, packetData);
                            break;

                        case Defines.ResType.RES_CREATE_CHAT_ROOM:
                            yield call(createChatRoomRes, packetData);
                            break;

                        case Defines.ResType.RES_ADD_CHAT_ROOM:
                            yield call(addChatRoomRes, packetData);
                            break;

                        case Defines.ResType.RES_REMOTE_CHAT_ROOM:
                            yield call(removeChatRoomRes, packetData);
                            break;

                        case Defines.ResType.RES_ENTER_CHAT_ROOM:
                            yield call(enterChatRoomRes, packetData);
                            break;

                        case Defines.ResType.RES_EXIT_CHAT_ROOM:
                            yield call(exitChatRoomRes, packetData);
                            break;

                        case Defines.ResType.RES_UPDATE_CHAT_ROOM:
                            yield call(updateChatRoomRes, packetData);
                            break;

                        case Defines.ResType.RES_NOTICE_ENTER_CHAT_ROOM:
                            yield call(noticeEnterChatRoomRes, packetData);
                            break;

                        case Defines.ResType.RES_NOTICE_EXIT_CHAT_ROOM:
                            yield call(noticeExitChatRoomRes, packetData);
                            break;

                        case Defines.ResType.RES_NOTICE_CHANGE_NAME_CHAT_ROOM:
                            yield call(noticeChangeNameChatRoomRes, packetData);
                            break;

                        case Defines.ResType.RES_TALK_CHAT_ROOM:
                            yield call(talkChatRoomRes, packetData);
                            break;

                        case Defines.ResType.RES_HISTORY_CHAT_ROOM:
                            yield call(historyChatRoomRes, packetData);
                            break;
                    }
                } catch (innerError) {
                    console.error(innerError);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
}

function* setSocketInfo(url: string): any {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - setSocketInfo`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.CLOSED === webSocketState.socket.readyState) {
        try {
            const newSocket = new WebSocket(url);
            newSocket.binaryType = 'arraybuffer';

            yield fork(onOpen, newSocket);
            yield fork(onClose, newSocket);
            yield fork(onMessage, newSocket);
            yield fork(checkConnection, newSocket);
            yield call(reconnect, newSocket);
            yield put(setSocket(newSocket));

        } catch (error) {
            console.error(error);
        }
    }
}

function* callInitSocket(action: PayloadAction<string>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callInitSocket`);
    yield call(setSocketInfo, `${action.payload}/ws/game`);
}

function* callStartReconnecting() {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callStartReconnecting`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (webSocketState.socket) {
        switch (webSocketState.socket.readyState) {
            case WebSocket.OPEN:
                yield put(setConnectionState(WebSocket.OPEN));
                break;

            default:
                try {
                    //yield put(setConnectionState(WebSocket.CONNECTING));
                    yield call(setSocketInfo, webSocketState.socket.url);
                } catch (error) {
                    console.error(error);
                }
        }
    }
}

export function* watchWebSocket() {
    yield takeLatest(initSocket, callInitSocket);
    yield takeLatest(startReconnecting, callStartReconnecting);
    yield takeLatest(connectedUsersReq, callConnectedUsersReq);
    yield takeLatest(followReq, callFollowReq);
    yield takeLatest(unfollowReq, callUnfollowReq);
    yield takeLatest(startChatReq, callStartChatReq);
    yield takeLatest(createChatRoomReq, callCreateChatRoomReq);
    yield takeLatest(removeChatRoomReq, callRemoveChatRoomReq);
    yield takeLatest(enterChatRoomReq, callEnterChatRoomReq);
    yield takeLatest(exitChatRoomReq, callExitChatRoomReq);
    yield takeLatest(sendMessageReq, callSendMessageReq);
    yield takeLatest(saveUserNameReq, callSaveUserNameReq);
    yield takeLatest(saveUserMessageReq, callSaveUserMessageReq);
    yield takeLatest(saveUserProfileReq, callSaveUserProfileReq);
    yield takeLatest(removeUserProfileReq, callRemoveUserProfileReq);
    yield takeLatest(checkNotificationReq, callCheckNotificationReq);
    yield takeLatest(removeNotificationReq, callRemoveNotificationReq);
    yield takeLatest(historyChatRoomReq, callHistoryChatRoomReq);
}
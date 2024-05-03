import {call, put, select} from "redux-saga/effects";
import {RootState} from "@/stores/reducers";
import {expireAccessToken, expireRefreshToken, setUserId, UserState} from "@/stores/reducers/user";
import {WebSocketState} from "@/stores/reducers/webSocket";
import {Defines} from "@/defines";
import {Helpers} from "@/helpers";
import {PayloadAction} from "@reduxjs/toolkit";
import {Domains} from "@/domains";
import isEmpty from "lodash/isEmpty";
import {AppConfigsState} from "@/stores/reducers/appConfigs";
import {ChatState} from "@/stores/reducers/chat";

export function* callCheckConnectionReq(socket: WebSocket) {
    // if ('production' !== process.env.NODE_ENV)
    //     console.log(`saga - checkConnectionReq`);

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

export function* callCheckAuthenticationReq() {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callCheckAuthenticationReq`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callCheckAuthenticationReq: socket is not available.`);
        return;
    }

    const userState: UserState = yield select((state: RootState) => state.user);
    const userInfo = Helpers.getUserInfo(userState.id, userState.userInfos)

    try {
        const flag = new Uint8Array([Defines.ReqType.REQ_CHECK_AUTHENTICATION]);

        let token = userInfo.accessToken;
        if (isEmpty(token))
            token = userInfo.refreshToken;

        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callCheckAuthenticationReq: ${isEmpty(token) ? 'token is empty.' : token}`);

        if (isEmpty(token)) {
            alert("인증정보가 없습니다.");
            yield put(expireRefreshToken(""));
            return;
        }
        const bytesToken = isEmpty(token.trim()) ? new Uint8Array() : new Uint8Array(Buffer.from(token.trim(), 'utf-8'));
        const reqPacket = Helpers.mergeBytesPacket([flag, bytesToken]);
        webSocketState.socket.send(reqPacket);
    } catch (error) {
        console.error(error);
    }
}

export function* callCheckAuthenticationOnOpenReq(socket?: WebSocket) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callCheckAuthenticationOnOpenReq`);

    if (!socket || WebSocket.OPEN != socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callCheckAuthenticationOnOpenReq: socket is not available.`);
        return;
    }

    const userState: UserState = yield select((state: RootState) => state.user);
    const userInfo = Helpers.getUserInfo(userState.id, userState.userInfos)
    if (isEmpty(userState.id) && !isEmpty(userInfo.userId))
        yield put(setUserId(userInfo.userId));

    try {
        const flag = new Uint8Array([Defines.ReqType.REQ_CHECK_AUTHENTICATION]);
        let token = userInfo.accessToken;

        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callCheckAuthenticationOnOpenReq: ${isEmpty(token) ? 'token is empty.' : token}`);

        if (isEmpty(token))
            return;

        const bytesToken = isEmpty(token.trim()) ? new Uint8Array() : new Uint8Array(Buffer.from(token.trim(), 'utf-8'));
        const reqPacket = Helpers.mergeBytesPacket([flag, bytesToken]);
        socket.send(reqPacket);
    } catch (error) {
        console.error(error);
    }
}

export function* callStartGuestReq() {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callStartGuestReq`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callStartGuestReq: socket is not available.`);
        return;
    }

    try {
        const flag = new Uint8Array([Defines.ReqType.REQ_CHECK_AUTHENTICATION]);
        webSocketState.socket.send(flag);
    } catch (error) {
        console.error(error);
    }
}

export function* callSignInReq(action: PayloadAction<Domains.SignInReq>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callSignInReq`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callSignInReq: socket is not available.`);
        return;
    }

    const userState: UserState = yield select((state: RootState) => state.user);

    if (Defines.AuthStateType.SIGN_IN === userState.authState && !isEmpty(userState.id)) {
        alert("이미 로그인 상태입니다.");
        return;
    }
    
    if (isEmpty(action.payload.userName.trim())) {
        alert("계정이름을 입력해 주세요.");
        return;
    }

    if (10 < action.payload.userName.trim().length) {
        alert("계정이름은 10글자 이하로 입력해 주세요.");
        return;
    }

    if (isEmpty(action.payload.password.trim())) {
        alert("비밀번호를 입력해 주세요.");
        return;
    }

    if (20 < action.payload.userName.trim().length) {
        alert("비밀번호는 20글자 이하로 입력해 주세요.");
        return;
    }

    try {
        const flag = new Uint8Array([Defines.ReqType.REQ_SIGN_IN]);
        const bytesUserName = new Uint8Array(Buffer.from(action.payload.userName.trim(), 'utf-8'));
        console.log("userName: " + action.payload.userName);
        console.log("bytesUserName: " + bytesUserName);
        const bytesUserNameLength = new Uint8Array([bytesUserName.byteLength]);
        const bytesPassword = new Uint8Array(Buffer.from(action.payload.password.trim(), 'utf-8'));
        const reqPacket = Helpers.mergeBytesPacket([flag, bytesUserNameLength, bytesUserName, bytesPassword]);
        webSocketState.socket.send(reqPacket);
    } catch (error) {
        console.error(error);
    }
}

export function* callSignOutReq() {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callSignOutReq`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callSignOutReq: socket is not available.`);
        return;
    }

    const userState: UserState = yield select((state: RootState) => state.user);
    const userInfo = Helpers.getUserInfo(userState.id, userState.userInfos);

    if (Defines.AuthStateType.SIGN_IN != userState.authState || isEmpty(userState.id)) {
        alert("로그인 상태가 아닙니다.");
        return;
    }

    try {
        const flag = new Uint8Array([Defines.ReqType.REQ_SIGN_OUT]);

        if (isEmpty(userInfo.accessToken)) {
            alert("로그인 후 이용해 주세요.");
            return;
        }

        const bytesToken = new Uint8Array(Buffer.from(userInfo.accessToken.trim(), 'utf-8'));
        const reqPacket = Helpers.mergeBytesPacket([flag, bytesToken]);
        webSocketState.socket.send(reqPacket);
    } catch (error) {
        console.error(error);
    }
}

export function* callCheckNotificationReq(action: PayloadAction<Domains.Notification>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callCheckNotificationReq`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callCheckNotificationReq: socket is not available.`);
        return;
    }

    if (!action.payload || isEmpty(action.payload.id)) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callCheckNotificationReq: not notification id.`);
        return;
    }

    if (action.payload.isCheck) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callCheckNotificationReq: already checked.`);
        return;
    }

    const userState: UserState = yield select((state: RootState) => state.user);
    const userInfo = Helpers.getUserInfo(userState.id, userState.userInfos)

    if (isEmpty(userInfo.accessToken)) {
        alert("로그인 후 이용해 주세요.");
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_CHECK_NOTIFICATION]);
    const bytesId = Helpers.getByteArrayFromUUID(action.payload.id.trim());
    const packet = Helpers.mergeBytesPacket([flag, bytesId]);
    webSocketState.socket.send(packet);
}

export function* callRemoveNotificationReq(action: PayloadAction<Domains.Notification>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callRemoveNotificationReq`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callRemoveNotificationReq: socket is not available.`);
        return;
    }

    if (!action.payload || isEmpty(action.payload.id)) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callRemoveNotificationReq: not notification id.`);
        return;
    }

    const userState: UserState = yield select((state: RootState) => state.user);
    const userInfo = Helpers.getUserInfo(userState.id, userState.userInfos)

    if (isEmpty(userInfo.accessToken)) {
        alert("로그인 후 이용해 주세요.");
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_REMOVE_NOTIFICATION]);
    const bytesId = Helpers.getByteArrayFromUUID(action.payload.id.trim());
    const packet = Helpers.mergeBytesPacket([flag, bytesId]);
    webSocketState.socket.send(packet);
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

export function* callGetOthersUserInfoReq(action: PayloadAction<string>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callGetOthersUserInfoReq`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callGetOthersUserInfoReq: socket is not available.`);
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_GET_OTHERS_USER_INFO]);
    const bytesUserId = Helpers.getByteArrayFromUUID(action.payload.trim());
    const packet = Helpers.mergeBytesPacket([flag, bytesUserId]);
    webSocketState.socket.send(packet);
}

export function* callGetTokenUserInfoReq(action: PayloadAction<string>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callGetTokenUserInfoReq`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callGetTokenUserInfoReq: socket is not available.`);
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_GET_TOKEN_USER_INFO]);
    const bytesToken = new Uint8Array(Buffer.from(action.payload.trim(), 'utf8'));
    const packet = Helpers.mergeBytesPacket([flag, bytesToken]);
    webSocketState.socket.send(packet);
}

export function* callFollowReq(action: PayloadAction<Domains.User>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callFollowReq`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callFollowReq: socket is not available.`);
        return;
    }

    const userState: UserState = yield select((state: RootState) => state.user);
    const userInfo = Helpers.getUserInfo(userState.id, userState.userInfos)

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

    if (isEmpty(userInfo.accessToken)) {
        alert("로그인 후 이용해 주세요.");
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_FOLLOW]);
    const bytesUserId = Helpers.getByteArrayFromUUID(action.payload.userId.trim());
    const bytesToken = new Uint8Array(Buffer.from(userInfo.accessToken, 'utf8'));
    const packet = Helpers.mergeBytesPacket([flag, bytesUserId, bytesToken]);
    webSocketState.socket.send(packet);
}

export function* callUnfollowReq(action: PayloadAction<Domains.User>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callUnfollowReq`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callUnfollowReq: socket is not available.`);
        return;
    }

    const userState: UserState = yield select((state: RootState) => state.user);
    const userInfo = Helpers.getUserInfo(userState.id, userState.userInfos)

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

    if (isEmpty(userInfo.accessToken)) {
        alert("로그인 후 이용해 주세요.");
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_UNFOLLOW]);
    const bytesUserId = Helpers.getByteArrayFromUUID(action.payload.userId.trim());
    const bytesToken = new Uint8Array(Buffer.from(userInfo.accessToken, 'utf8'));
    const packet = Helpers.mergeBytesPacket([flag, bytesUserId, bytesToken]);
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

export function* callSaveNickNameReq() {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callSaveNickNameReq`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callSaveNickNameReq: socket is not available.`);
        return;
    }

    const userState: UserState = yield select((state: RootState) => state.user);
    const userInfo = Helpers.getUserInfo(userState.id, userState.userInfos)

    if (!userState.id) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callSaveNickNameReq: not found user id.`);
        return;
    }

    if (2 > userInfo.nickName.length || 10 < userInfo.nickName.length) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callSaveNickNameReq: not suitable user nick name length.`);

        alert('대화명은 2 글자 이상, 10글자 이하로 입력해주세요.');
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_CHANGE_NICK_NAME]);
    const bytesUserId = Helpers.getByteArrayFromUUID(userState.id.trim());
    const bytesNickName = new Uint8Array(Buffer.from(userInfo.nickName.trim(), 'utf8'));
    const packet = Helpers.mergeBytesPacket([flag, bytesUserId, bytesNickName]);
    webSocketState.socket.send(packet);
}

export function* callSaveUserMessageReq() {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callSaveUserMessageReq`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callSaveUserMessageReq: socket is not available.`);
        return;
    }

    const userState: UserState = yield select((state: RootState) => state.user);
    const userInfo = Helpers.getUserInfo(userState.id, userState.userInfos)

    if (!userState.id) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callSaveUserMessageReq: not found user id.`);
        return;
    }

    if (128 < userInfo.message.length) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callSaveUserMessageReq: too long user message.`);

        alert('상태 메세지는 128글자 이하로 입력해주세요.');
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_CHANGE_USER_MESSAGE]);
    const bytesUserId = Helpers.getByteArrayFromUUID(userState.id.trim());
    const bytesUserMessage = new Uint8Array(Buffer.from(userInfo.message.trim(), 'utf8'));
    const packet = Helpers.mergeBytesPacket([flag, bytesUserId, bytesUserMessage]);
    webSocketState.socket.send(packet);
}

export function* callSaveUserProfileReq(action: PayloadAction<Domains.SaveUserProfileReq>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callSaveUserProfileReq`);

    const userState: UserState = yield select((state: RootState) => state.user);
    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callSaveUserProfileReq: socket is not available.`);
        return;
    }

    if (!userState.id) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callSaveUserMessageReq: not found user id.`);
        return;
    }

    if (!action || !action.payload) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callSaveUserMessageReq: parameters are null.`);

        alert('프로필 이미지를 선택해주세요.');
        return;
    }

    if (1 > action.payload.mime || (Defines.AllowedImageType.SVG != action.payload.mime && (isEmpty(action.payload.bytesSmall) || isEmpty(action.payload.bytesLarge)))) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callSaveUserMessageReq: upload image is null.`);

        alert('프로필 이미지를 선택해주세요.');
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_CHANGE_USER_PROFILE]);
    const bytesMime = new Uint8Array([action.payload.mime]);
    const bytesLargeLength = Helpers.getByteArrayFromInt(action.payload.bytesLarge.byteLength);
    const bytesSmallLength = Helpers.getByteArrayFromInt(action.payload.bytesSmall.byteLength);
    const packet = Helpers.mergeBytesPacket([flag, bytesMime, bytesLargeLength, bytesSmallLength, action.payload.bytesLarge, action.payload.bytesSmall]);
    webSocketState.socket.send(packet);
}

export function* callRemoveUserProfileReq() {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callRemoveUserProfileReq`);

    const userState: UserState = yield select((state: RootState) => state.user);
    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callRemoveUserProfileReq: socket is not available.`);
        return;
    }

    if (!userState.id) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callRemoveUserProfileReq: not found user id.`);
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_REMOVE_USER_PROFILE]);
    const packet = Helpers.mergeBytesPacket([flag]);
    webSocketState.socket.send(packet);
}

export function* callCreateChatRoomReq(action: PayloadAction<Domains.CreateChatRoomReq>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callCreateChatRoomReq`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callCreateChatRoomReq: socket is not available.`);
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_CREATE_CHAT_ROOM]);
    const bytesRoomOpenType = new Uint8Array([action.payload.openType]);
    const bytesUsersCount = Helpers.getByteArrayFromInt(action.payload.userIds.length);
    let bytesUserIds = new Uint8Array();
    if (0 < action.payload.userIds.length) {
        for (let i = 0; i < action.payload.userIds.length; i++) {
            bytesUserIds = Helpers.mergeBytesPacket([bytesUserIds, Helpers.getByteArrayFromUUID(action.payload.userIds[i])]);
        }
    }
    let bytesChatRoomName = new Uint8Array();
    if (!isEmpty(action.payload.roomName.trim()))
        bytesChatRoomName = new Uint8Array(Buffer.from(action.payload.roomName.trim(), 'utf-8'));

    const packet = Helpers.mergeBytesPacket([flag, bytesRoomOpenType, bytesUsersCount, bytesUserIds, bytesChatRoomName]);
    webSocketState.socket.send(packet);
}

export function* callAddUserChatRoomReq(action: PayloadAction<string[]>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callAddUserChatRoomReq`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);
    const chatState: ChatState = yield select((state: RootState) => state.chat);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callAddUserChatRoomReq: socket is not available.`);
        return;
    }

    if (isEmpty(chatState.currentChatRoomId)) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callAddUserChatRoomReq: the roomId to invite required.`);
        return;
    }

    if (1 > action.payload.length) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callAddUserChatRoomReq: one more users required.`);
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_ADD_USER_CHAT_ROOM]);
    const bytesChatRoomId = Helpers.getByteArrayFromUUID(chatState.currentChatRoomId);
    const bytesUsersCount = Helpers.getByteArrayFromInt(action.payload.length);
    let bytesUserIds = new Uint8Array();
    if (0 < action.payload.length) {
        for (let i = 0; i < action.payload.length; i++) {
            bytesUserIds = Helpers.mergeBytesPacket([bytesUserIds, Helpers.getByteArrayFromUUID(action.payload[i])]);
        }
    }

    const packet = Helpers.mergeBytesPacket([flag, bytesChatRoomId, bytesUsersCount, bytesUserIds]);
    webSocketState.socket.send(packet);
}

export function* callRemoveChatRoomReq(action: PayloadAction<string>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callRemoveChatRoomReq`);

    if (isEmpty(action.payload)) {
        alert("삭제할 채팅방 아이디가 필요합니다.");
        return;
    }

    const chat: ChatState = yield select((state: RootState) => state.chat);
    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callRemoveChatRoomReq: socket is not available.`);
        return;
    }

    const existsChatRoom = chat.chatRooms.find(_ => _.roomId == action.payload);
    if (!existsChatRoom) {
        alert("이용중인 채팅방이 아닙니다.");
        return;
    }

    if (Defines.RoomOpenType.PUBLIC == existsChatRoom.openType) {
        alert("삭제할 수있는 채팅방이 아닙니다.");
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_REMOVE_CHAT_ROOM]);
    const bytesRoomId = Helpers.getByteArrayFromUUID(action.payload.trim());
    const packet = Helpers.mergeBytesPacket([flag, bytesRoomId]);
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
    const bytesMessage = new Uint8Array(Buffer.from(action.payload.message.trim(), 'utf8'));
    const bytesMessageLength = Helpers.getByteArrayFromInt(bytesMessage.byteLength);
    const packet = Helpers.mergeBytesPacket([flag, bytesChatType, bytesChatId, bytesChatRoomId, bytesMessageLength, bytesMessage]);
    webSocketState.socket.send(packet);
}

export function* callHistoryChatRoomReq(action: PayloadAction<Domains.ChatRoom>) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callHistoryChatRoomReq`);

    const webSocketState: WebSocketState = yield select((state: RootState) => state.webSocket);

    if (!webSocketState.socket || WebSocket.OPEN != webSocketState.socket.readyState) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callHistoryChatRoomReq: socket is not available.`);
        return;
    }

    if (!action.payload || isEmpty(action.payload.roomId)) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`saga - callHistoryChatRoomReq: not chatRoom id.`);
        return;
    }

    const flag = new Uint8Array([Defines.ReqType.REQ_HISTORY_CHAT_ROOM]);
    const bytesRoomId = Helpers.getByteArrayFromUUID(action.payload.roomId.trim());
    const packet = Helpers.mergeBytesPacket([flag, bytesRoomId]);
    webSocketState.socket.send(packet);
}
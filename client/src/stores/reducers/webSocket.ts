import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Domains} from "@/domains";

interface WebSocketState {
    socket: WebSocket|null;
    connectionState: 0|1|2|3;
    countTryConnect: number;
}

const initialState: WebSocketState = {
    socket: null,
    connectionState: WebSocket.CLOSED,
    countTryConnect: 0,
}

const webSocketSlice = createSlice({
    name: 'WebSocket',
    initialState,
    reducers: {
        initSocket: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - initSocket: ${JSON.stringify(action.payload)}`);
        },
        setSocket: (state, action: PayloadAction<WebSocket|null>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setSocket: ${JSON.stringify(action.payload)}`);

            state.socket = action.payload;
        },
        setConnectionState: (state, action: PayloadAction<0|1|2|3>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setConnectionState: ${JSON.stringify(action.payload)}`);

            state.connectionState = action.payload;
        },
        addCountTryConnect: (state) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - addCountTryConnect: ${(state.countTryConnect + 1)}`);

            state.countTryConnect += 1;
        },
        resetCountTryConnect: (state) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - resetCountTryConnect`);

            state.countTryConnect = 0;
        },
        startReconnecting: (state) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - startReconnecting`);
        },
        checkAuthenticationReq: (state) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - checkAuthenticationReq`);
        },
        signInReq: (state, action: PayloadAction<Domains.SignInReq>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - signInReq`);
        },
        signOutReq: (state) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - signOutReq`);
        },
        connectedUsersReq: (state) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - connectedUsersReq`);
        },
        startGuestReq: (state) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - startGuestReq`);
        },
        getTokenUserInfoReq: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - getTokenUserInfoReq`);
        },
        getOthersUserInfoReq: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - getOthersUserInfoReq`);
        },
        followReq: (state, action: PayloadAction<Domains.User>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - followReq`);
        },
        unfollowReq: (state, action: PayloadAction<Domains.User>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - unfollowReq`);
        },
        startChatReq: (state, action: PayloadAction<Domains.User>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - startChatReq`);
        },
        createChatRoomReq: (state, action: PayloadAction<Domains.CreateChatRoomReq>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - createChatRoomReq`);
        },
        addUserChatRoomReq: (state, action: PayloadAction<string[]>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - addUserChatRoomReq`);
        },
        enterChatRoomReq: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - enterChatRoomReq`);
        },
        exitChatRoomReq: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - exitChatRoomReq`);
        },
        removeChatRoomReq: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - removeChatRoomReq`);
        },
        sendMessageReq: (state, action: PayloadAction<Domains.SendMessage>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - sendMessage`);
        },
        saveNickNameReq: (state) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - saveNickNameReq`);
        },
        saveUserMessageReq: (state) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - saveUserMessageReq`);
        },
        saveUserProfileReq: (state, action: PayloadAction<Domains.SaveUserProfileReq>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - saveUserProfileReq`);
        },
        removeUserProfileReq: (state) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - removeUserProfileReq`);
        },
        checkNotificationReq: (state, action: PayloadAction<Domains.Notification>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - checkNotificationReq`);
        },
        removeNotificationReq: (state, action: PayloadAction<Domains.Notification>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - removeNotificationReq`);
        },
        historyChatRoomReq: (state, action: PayloadAction<Domains.ChatRoom>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - historyChatRoomReq`);
        },
    }
});

export type { WebSocketState };
export const {
    initSocket,
    setSocket,
    setConnectionState,
    addCountTryConnect,
    resetCountTryConnect,
    startReconnecting,
    checkAuthenticationReq,
    connectedUsersReq,
    startGuestReq,
    signInReq,
    signOutReq,
    getTokenUserInfoReq,
    getOthersUserInfoReq,
    followReq,
    unfollowReq,
    startChatReq,
    createChatRoomReq,
    addUserChatRoomReq,
    enterChatRoomReq,
    exitChatRoomReq,
    removeChatRoomReq,
    sendMessageReq,
    saveNickNameReq,
    saveUserMessageReq,
    saveUserProfileReq,
    removeUserProfileReq,
    checkNotificationReq,
    removeNotificationReq,
    historyChatRoomReq,
} = webSocketSlice.actions;

export default webSocketSlice.reducer;
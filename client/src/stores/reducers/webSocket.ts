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
        connectedUsersReq: (state) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - connectedUsersReq`);
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
        enterChatRoomReq: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - enterChatRoomReq`);
        },
        exitChatRoomReq: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - exitChatRoomReq`);
        },
        sendMessageReq: (state, action: PayloadAction<Domains.SendMessage>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - sendMessage`);
        },
        saveUserNameReq: (state) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - saveUserNameReq`);
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
    connectedUsersReq,
    followReq,
    unfollowReq,
    startChatReq,
    createChatRoomReq,
    enterChatRoomReq,
    exitChatRoomReq,
    sendMessageReq,
    saveUserNameReq
} = webSocketSlice.actions;

export default webSocketSlice.reducer;
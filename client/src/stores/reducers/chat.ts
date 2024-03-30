import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Domains} from "@/domains";
import deepmerge from "deepmerge";
import isEmpty from "lodash/isEmpty";

interface ChatState {
    roomList: Domains.ChatRoom[];
    roomUserList: Domains.ChatRoomUser[];
    chatDatas: Domains.Chat[];
    latestUpdate: Date;
}

const initialState: ChatState = {
    roomList: [],
    roomUserList: [],
    chatDatas: [],
    latestUpdate: new Date()
}

const chatSlice = createSlice({
    name: 'Chat',
    initialState,
    reducers: {
        addChatRooms: (state, action: PayloadAction<Domains.ChatRoom[]>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - addRoom: ${JSON.stringify(action.payload)}`);

            if (!action || !action.payload || 1 > action.payload.length)
                return;

            const addChatRoomList: Domains.ChatRoom[] = [];
            for (let chatRoom of action.payload) {
                if (0 <= state.roomList.findIndex(_ => _.roomId == chatRoom.roomId))
                    continue;

                addChatRoomList.push(chatRoom);
            }
            state.roomList = deepmerge(state.roomList, addChatRoomList);
        },
        removeChatRooms: (state, action: PayloadAction<string[]>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - removeRoom: ${JSON.stringify(action.payload)}`);

            if (!action || !action.payload || 1 > action.payload.length)
                return;

            const filterList = state.roomList.filter(_ => !action.payload.includes(_.roomId));
            state.roomList = deepmerge([], filterList);
        },
        setChatRoomList: (state, action: PayloadAction<Domains.ChatRoom[]>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setRoomList: ${JSON.stringify(action.payload)}`);

            if (!action || !action.payload)
                return;

            state.roomList = action.payload;
        },
        addChatRoomUser: (state, action: PayloadAction<Domains.ChatRoomUser>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - addRoomUser: ${JSON.stringify(action.payload)}`);

            if (!action || !action.payload)
                return;

            state.roomUserList.push(action.payload);
            state.roomUserList = deepmerge([], state.roomUserList);
        },
        removeChatRoomUser: (state, action: PayloadAction<Domains.ChatRoomUser>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - removeRoomUser: ${JSON.stringify(action.payload)}`);

            if (!action || !action.payload || isEmpty(action.payload.userId))
                return;

            const filterList = state.roomUserList.filter(_ => _.userId != action.payload.userId)
            state.roomUserList = deepmerge([], filterList);
        },
        setChatRoomUserList: (state, action: PayloadAction<Domains.ChatRoomUser[]>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setRoomUserList: ${JSON.stringify(action.payload)}`);

            if (!action || !action.payload)
                return;

            state.roomUserList = action.payload;
        },
        addChatData: (state, action: PayloadAction<Domains.Chat>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - addChatData: ${JSON.stringify(action.payload)}`);

            if (!action || !action.payload)
                return;

            state.chatDatas.push(action.payload);
            state.chatDatas = deepmerge([], state.chatDatas);
        },
        setChatDatas: (state, action: PayloadAction<Domains.Chat[]>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setChatDatas: ${JSON.stringify(action.payload)}`);

            if (!action || !action.payload)
                return;

            state.chatDatas = action.payload;
        },
    }
});

export type { ChatState };
export const {
    addChatRooms,
    removeChatRooms,
    setChatRoomList,
    addChatRoomUser,
    removeChatRoomUser,
    setChatRoomUserList,
    addChatData,
    setChatDatas,
} = chatSlice.actions;

export default chatSlice.reducer;
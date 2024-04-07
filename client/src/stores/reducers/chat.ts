import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Domains} from "@/domains";
import deepmerge from "deepmerge";
import isEmpty from "lodash/isEmpty";

interface ChatState {
    currentChatRoomId: string;
    chatRooms: Domains.ChatRoom[];
}

const initialState: ChatState = {
    currentChatRoomId: "",
    chatRooms: []
}

const chatSlice = createSlice({
    name: 'Chat',
    initialState,
    reducers: {
        enterChatRoom: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - enterChatRoom: ${JSON.stringify(action.payload)}`);

            if (!action || !action.payload || 1 > action.payload.length)
                return;

            state.currentChatRoomId = action.payload;
        },
        exitChatRoom: (state) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - exitChatRoom`);

            state.currentChatRoomId = '';
        },
        addChatRooms: (state, action: PayloadAction<Domains.ChatRoom[]>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - addChatRooms: ${JSON.stringify(action.payload)}`);

            if (!action || !action.payload || 1 > action.payload.length)
                return;

            const addChatRoomList: Domains.ChatRoom[] = [];
            for (let chatRoom of action.payload) {
                if (0 <= state.chatRooms.findIndex(_ => _.roomId == chatRoom.roomId))
                    continue;

                addChatRoomList.push(chatRoom);
            }
            state.chatRooms = deepmerge(state.chatRooms, addChatRoomList);
        },
        removeChatRooms: (state, action: PayloadAction<string[]>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - removeChatRooms: ${JSON.stringify(action.payload)}`);

            if (!action || !action.payload || 1 > action.payload.length)
                return;

            const filterList = state.chatRooms.filter(_ => !action.payload.includes(_.roomId));
            state.chatRooms = deepmerge([], filterList);
        },
        setChatRooms: (state, action: PayloadAction<Domains.ChatRoom[]>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setChatRooms: ${JSON.stringify(action.payload)}`);

            if (!action || !action.payload)
                return;

            state.chatRooms = action.payload;
        },
        setChatRoomUsers: (state, action: PayloadAction<SetChatRoomUsersProps>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setChatRoomUsers: ${JSON.stringify(action.payload)}`);

            if (!action || !action.payload || isEmpty(action.payload.roomId) || !action.payload.chatRoomUsers)
                return;

            const chatRoom = state.chatRooms.find(_ => _.roomId == action.payload.roomId);
            if (!chatRoom)
                return;

            chatRoom.users = action.payload.chatRoomUsers;
            state.chatRooms = deepmerge([], state.chatRooms);
        },
        addChatData: (state, action: PayloadAction<AddChatDataProps>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - addChatData: ${JSON.stringify(action.payload)}`);

            if (!action || !action.payload || isEmpty(action.payload.roomId) || !action.payload.chatData)
                return;

            const chatRoom = state.chatRooms.find(_ => _.roomId == action.payload.roomId);
            if (!chatRoom)
                return;

            if (0 <= chatRoom.chatDatas.findIndex(_ => _.id == action.payload.chatData.id))
                return;

            chatRoom.chatDatas.push(action.payload.chatData);
            state.chatRooms = deepmerge([], state.chatRooms);
        },
        setChatDatas: (state, action: PayloadAction<SetChatDatasProps>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setChatDatas: ${JSON.stringify(action.payload)}`);

            if (!action || !action.payload || isEmpty(action.payload.roomId) || !action.payload.chatDatas)
                return;

            const chatRoom = state.chatRooms.find(_ => _.roomId == action.payload.roomId);
            if (!chatRoom)
                return;

            chatRoom.chatDatas = action.payload.chatDatas;
            state.chatRooms = deepmerge([], state.chatRooms);
        },
    }
});

export interface AddChatRoomUserProps {
    roomId: string;
    chatRoomUser: Domains.ChatRoomUser;
}

export interface RemoveChatRoomUserProps {
    roomId: string;
    chatRoomUser: Domains.ChatRoomUser;
}

export interface SetChatRoomUsersProps {
    roomId: string;
    chatRoomUsers: Domains.ChatRoomUser[];
}

export interface AddChatDataProps {
    roomId: string;
    chatData: Domains.Chat;
}

export interface SetChatDatasProps {
    roomId: string;
    chatDatas: Domains.Chat[];
}

export type { ChatState };
export const {
    enterChatRoom,
    exitChatRoom,
    addChatRooms,
    removeChatRooms,
    setChatRooms,
    setChatRoomUsers,
    addChatData,
    setChatDatas,
} = chatSlice.actions;

export default chatSlice.reducer;
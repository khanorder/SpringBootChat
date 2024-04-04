import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import isEmpty from "lodash/isEmpty";

interface DialogsState {
    isActiveCreateChatRoom: boolean;
    isActiveChatImageInput: boolean;
    isActiveChatImageDetail: boolean;
}

const initialState: DialogsState = {
    isActiveCreateChatRoom: false,
    isActiveChatImageInput: false,
    isActiveChatImageDetail: false
}

const dialogsStateSlice = createSlice({
    name: 'DialogsState',
    initialState,
    reducers: {
        setIsActiveCreateChatRoom: (state, action: PayloadAction<boolean>) => {
            state.isActiveCreateChatRoom = action.payload;
        },
        setIsActiveChatImageInput: (state, action: PayloadAction<boolean>) => {
            state.isActiveChatImageInput = action.payload;
        },
        setIsActiveChatImageDetail: (state, action: PayloadAction<boolean>) => {
            state.isActiveChatImageDetail = action.payload;
        },
        toggleIsActiveCreateChatRoom: (state) => {
            state.isActiveCreateChatRoom = !state.isActiveCreateChatRoom;
        },
        toggleIsActiveChatImageInput: (state) => {
            state.isActiveChatImageInput = !state.isActiveChatImageInput;
        },
        toggleIsActiveChatImageDetail: (state) => {
            state.isActiveChatImageDetail = !state.isActiveChatImageDetail;
        },
    }
});

export type { DialogsState };
export const {
    setIsActiveCreateChatRoom,
    setIsActiveChatImageInput,
    setIsActiveChatImageDetail,
    toggleIsActiveCreateChatRoom,
    toggleIsActiveChatImageInput,
    toggleIsActiveChatImageDetail
} = dialogsStateSlice.actions;

export default dialogsStateSlice.reducer;
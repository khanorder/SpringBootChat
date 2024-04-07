import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import isEmpty from "lodash/isEmpty";
import {Defines} from "@/defines";

interface DialogsState {
    activeTab: Defines.ActiveTab;
    isActiveGNB: boolean;
    isActiveCreateChatRoom: boolean;
    isActiveChatImageInput: boolean;
    isActiveChatImageDetail: boolean;
}

const initialState: DialogsState = {
    activeTab: Defines.ActiveTab.Friend,
    isActiveGNB: false,
    isActiveCreateChatRoom: false,
    isActiveChatImageInput: false,
    isActiveChatImageDetail: false
}

const dialogsStateSlice = createSlice({
    name: 'DialogsState',
    initialState,
    reducers: {
        setActiveTab: (state, action: PayloadAction<Defines.ActiveTab>) => {
            state.activeTab = action.payload;
        },
        setIsActiveGNB: (state, action: PayloadAction<boolean>) => {
            state.isActiveGNB = action.payload;
        },
        setIsActiveCreateChatRoom: (state, action: PayloadAction<boolean>) => {
            state.isActiveCreateChatRoom = action.payload;
        },
        setIsActiveChatImageInput: (state, action: PayloadAction<boolean>) => {
            state.isActiveChatImageInput = action.payload;
        },
        setIsActiveChatImageDetail: (state, action: PayloadAction<boolean>) => {
            state.isActiveChatImageDetail = action.payload;
        },
        toggleIsActiveGNB: (state) => {
            state.isActiveGNB = !state.isActiveGNB;
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
    setActiveTab,
    setIsActiveGNB,
    setIsActiveCreateChatRoom,
    setIsActiveChatImageInput,
    setIsActiveChatImageDetail,
    toggleIsActiveGNB,
    toggleIsActiveCreateChatRoom,
    toggleIsActiveChatImageInput,
    toggleIsActiveChatImageDetail
} = dialogsStateSlice.actions;

export default dialogsStateSlice.reducer;
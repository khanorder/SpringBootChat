import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import isEmpty from "lodash/isEmpty";
import {Defines} from "@/defines";

interface UIState {
    activeTab: Defines.TabType;
    isActiveLNB: boolean;
    isActiveCreateChatRoom: boolean;
    isActiveChatImageInput: boolean;
    isActiveChatImageDetail: boolean;
}

const initialState: UIState = {
    activeTab: Defines.TabType.FOLLOW,
    isActiveLNB: false,
    isActiveCreateChatRoom: false,
    isActiveChatImageInput: false,
    isActiveChatImageDetail: false
}

const uiStateSlice = createSlice({
    name: 'UIState',
    initialState,
    reducers: {
        setActiveTab: (state, action: PayloadAction<Defines.TabType>) => {
            state.activeTab = action.payload;
        },
        setIsActiveLNB: (state, action: PayloadAction<boolean>) => {
            state.isActiveLNB = action.payload;
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
        toggleIsActiveLNB: (state) => {
            state.isActiveLNB = !state.isActiveLNB;
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

export type { UIState };
export const {
    setActiveTab,
    setIsActiveLNB,
    setIsActiveCreateChatRoom,
    setIsActiveChatImageInput,
    setIsActiveChatImageDetail,
    toggleIsActiveLNB,
    toggleIsActiveCreateChatRoom,
    toggleIsActiveChatImageInput,
    toggleIsActiveChatImageDetail
} = uiStateSlice.actions;

export default uiStateSlice.reducer;
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import isEmpty from "lodash/isEmpty";
import {Defines} from "@/defines";

interface UIState {
    activeTab: Defines.TabType;
    isActiveProfile: boolean;
    isActiveProfileImageInput: boolean;
    isActiveNotification: boolean;
    isActiveChatRoomInfo: boolean;
    isActiveCreateChatRoom: boolean;
    isActiveAddUser: boolean;
    isActiveChatImageInput: boolean;
    isActiveChatImageDetail: boolean;
    isActiveChangeUser: boolean;
    isActiveSignUp: boolean;
    isActiveSignIn: boolean;
}

const initialState: UIState = {
    activeTab: Defines.TabType.FOLLOW,
    isActiveProfile: false,
    isActiveProfileImageInput: false,
    isActiveNotification: false,
    isActiveChatRoomInfo: false,
    isActiveCreateChatRoom: false,
    isActiveAddUser: false,
    isActiveChatImageInput: false,
    isActiveChatImageDetail: false,
    isActiveChangeUser: false,
    isActiveSignUp: false,
    isActiveSignIn: false
}

const uiSlice = createSlice({
    name: 'UI',
    initialState,
    reducers: {
        initUI: (state) => {
            state.activeTab = Defines.TabType.FOLLOW;
            state.isActiveProfile = false;
            state.isActiveProfileImageInput = false;
            state.isActiveNotification = false;
            state.isActiveChatRoomInfo = false;
            state.isActiveCreateChatRoom = false;
            state.isActiveAddUser = false;
            state.isActiveChatImageInput = false;
            state.isActiveChatImageDetail = false;
            state.isActiveChangeUser = false;
            state.isActiveSignUp = false;
            state.isActiveSignIn = false;
        },
        setActiveTab: (state, action: PayloadAction<Defines.TabType>) => {
            state.activeTab = action.payload;
        },
        setIsActiveProfile: (state, action: PayloadAction<boolean>) => {
            state.isActiveProfile = action.payload;
        },
        setIsActiveProfileImageInput: (state, action: PayloadAction<boolean>) => {
            state.isActiveProfileImageInput = action.payload;
        },
        setIsActiveNotification: (state, action: PayloadAction<boolean>) => {
            state.isActiveNotification = action.payload;
        },
        setIsActiveChatRoomInfo: (state, action: PayloadAction<boolean>) => {
            state.isActiveChatRoomInfo = action.payload;
        },
        setIsActiveCreateChatRoom: (state, action: PayloadAction<boolean>) => {
            state.isActiveCreateChatRoom = action.payload;
        },
        setIsActiveAddUser: (state, action: PayloadAction<boolean>) => {
            state.isActiveAddUser = action.payload;
        },
        setIsActiveChatImageInput: (state, action: PayloadAction<boolean>) => {
            state.isActiveChatImageInput = action.payload;
        },
        setIsActiveChatImageDetail: (state, action: PayloadAction<boolean>) => {
            state.isActiveChatImageDetail = action.payload;
        },
        setIsActiveChangeUser: (state, action: PayloadAction<boolean>) => {
            state.isActiveChangeUser = action.payload;
        },
        setIsActiveSignUp: (state, action: PayloadAction<boolean>) => {
            state.isActiveSignUp = action.payload;
        },
        setIsActiveSignIn: (state, action: PayloadAction<boolean>) => {
            state.isActiveSignIn = action.payload;
        },
        toggleIsActiveProfile: (state) => {
            state.isActiveProfile = !state.isActiveProfile;
        },
        toggleIsActiveProfileImageInput: (state) => {
            state.isActiveProfileImageInput = !state.isActiveProfileImageInput;
        },
        toggleIsActiveNotification: (state) => {
            state.isActiveNotification = !state.isActiveNotification;
        },
        toggleIsActiveChatRoomInfo: (state) => {
            state.isActiveChatRoomInfo = !state.isActiveChatRoomInfo;
        },
        toggleIsActiveCreateChatRoom: (state) => {
            state.isActiveCreateChatRoom = !state.isActiveCreateChatRoom;
        },
        toggleIsActiveAddUser: (state) => {
            state.isActiveAddUser = !state.isActiveAddUser;
        },
        toggleIsActiveChatImageInput: (state) => {
            state.isActiveChatImageInput = !state.isActiveChatImageInput;
        },
        toggleIsActiveChatImageDetail: (state) => {
            state.isActiveChatImageDetail = !state.isActiveChatImageDetail;
        },
        toggleIsActiveChangeUser: (state) => {
            state.isActiveChangeUser = !state.isActiveChangeUser;
        },
        toggleIsActiveSignUp: (state) => {
            state.isActiveSignUp = !state.isActiveSignUp;
        },
        toggleIsActiveSignIn: (state) => {
            state.isActiveSignIn = !state.isActiveSignIn;
        },
    }
});

export type { UIState };
export const {
    initUI,
    setActiveTab,
    setIsActiveProfile,
    setIsActiveProfileImageInput,
    setIsActiveNotification,
    setIsActiveChatRoomInfo,
    setIsActiveCreateChatRoom,
    setIsActiveAddUser,
    setIsActiveChatImageInput,
    setIsActiveChatImageDetail,
    setIsActiveChangeUser,
    setIsActiveSignUp,
    setIsActiveSignIn,
    toggleIsActiveNotification,
    toggleIsActiveProfile,
    toggleIsActiveProfileImageInput,
    toggleIsActiveChatRoomInfo,
    toggleIsActiveCreateChatRoom,
    toggleIsActiveAddUser,
    toggleIsActiveChatImageInput,
    toggleIsActiveChatImageDetail,
    toggleIsActiveChangeUser,
    toggleIsActiveSignUp,
    toggleIsActiveSignIn,
} = uiSlice.actions;

export default uiSlice.reducer;
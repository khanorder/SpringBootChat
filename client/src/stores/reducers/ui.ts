import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import isEmpty from "lodash/isEmpty";
import {Defines} from "@/defines";
import {Domains} from "@/domains";

interface UIState {
    chatDetail: Domains.Chat|null;
    chatDetailImageId: string;
    profileDetailUserId: string;
    activeTab: Defines.TabType;
    isActiveMyProfile: boolean;
    isActiveProfile: boolean;
    isActiveProfileImageInput: boolean;
    isActiveNotification: boolean;
    isActiveChatRoomInfo: boolean;
    isActiveCreateChatRoom: boolean;
    isActiveAddUser: boolean;
    isActiveChatImageInput: boolean;
    isActiveChatImageDetail: boolean;
    isActiveChatDetail: boolean;
    isActiveChangeUser: boolean;
    isActiveSignUp: boolean;
    isActiveSignIn: boolean;
    isActiveImojiInput: boolean;
}

const initialState: UIState = {
    chatDetail: null,
    chatDetailImageId: "",
    profileDetailUserId: "",
    activeTab: Defines.TabType.FOLLOW,
    isActiveMyProfile: false,
    isActiveProfile: false,
    isActiveProfileImageInput: false,
    isActiveNotification: false,
    isActiveChatRoomInfo: false,
    isActiveCreateChatRoom: false,
    isActiveAddUser: false,
    isActiveChatImageInput: false,
    isActiveChatImageDetail: false,
    isActiveChatDetail: false,
    isActiveChangeUser: false,
    isActiveSignUp: false,
    isActiveSignIn: false,
    isActiveImojiInput: false
}

const uiSlice = createSlice({
    name: 'UI',
    initialState,
    reducers: {
        setChatDetail: (state, action: PayloadAction<Domains.Chat|null>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setChatDetail: ${action.payload}`);

            state.chatDetail = action.payload;
        },
        setChatDetailImageId: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setChatDetailImageId: ${action.payload}`);

            state.chatDetailImageId = action.payload;
        },
        setProfileDetailUserId: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setProfileDetailUserId: ${action.payload}`);

            state.profileDetailUserId = action.payload;
        },
        initUI: (state) => {
            state.activeTab = Defines.TabType.FOLLOW;
            state.isActiveMyProfile = false;
            state.isActiveProfileImageInput = false;
            state.isActiveNotification = false;
            state.isActiveChatRoomInfo = false;
            state.isActiveCreateChatRoom = false;
            state.isActiveAddUser = false;
            state.isActiveChatImageInput = false;
            state.isActiveChatImageDetail = false;
            state.isActiveChatDetail = false;
            state.isActiveChangeUser = false;
            state.isActiveSignUp = false;
            state.isActiveSignIn = false;
            state.isActiveImojiInput = false;
        },
        setActiveTab: (state, action: PayloadAction<Defines.TabType>) => {
            state.activeTab = action.payload;
        },
        setIsActiveMyProfile: (state, action: PayloadAction<boolean>) => {
            state.isActiveMyProfile = action.payload;
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
        setIsActiveChatDetail: (state, action: PayloadAction<boolean>) => {
            state.isActiveChatDetail = action.payload;
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
        setIsActiveImojiInput: (state, action: PayloadAction<boolean>) => {
            state.isActiveImojiInput = action.payload;
        },
        toggleIsActiveMyProfile: (state) => {
            state.isActiveMyProfile = !state.isActiveMyProfile;
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
        toggleIsActiveChatDetail: (state) => {
            state.isActiveChatDetail = !state.isActiveChatDetail;
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
        toggleIsActiveImojiInput: (state) => {
            state.isActiveImojiInput = !state.isActiveImojiInput;
        },
    }
});

export type { UIState };
export const {
    setChatDetail,
    setChatDetailImageId,
    setProfileDetailUserId,
    initUI,
    setActiveTab,
    setIsActiveMyProfile,
    setIsActiveProfile,
    setIsActiveProfileImageInput,
    setIsActiveNotification,
    setIsActiveChatRoomInfo,
    setIsActiveCreateChatRoom,
    setIsActiveAddUser,
    setIsActiveChatImageInput,
    setIsActiveChatImageDetail,
    setIsActiveChatDetail,
    setIsActiveChangeUser,
    setIsActiveSignUp,
    setIsActiveSignIn,
    setIsActiveImojiInput,
    toggleIsActiveNotification,
    toggleIsActiveMyProfile,
    toggleIsActiveProfile,
    toggleIsActiveProfileImageInput,
    toggleIsActiveChatRoomInfo,
    toggleIsActiveCreateChatRoom,
    toggleIsActiveAddUser,
    toggleIsActiveChatImageInput,
    toggleIsActiveChatImageDetail,
    toggleIsActiveChatDetail,
    toggleIsActiveChangeUser,
    toggleIsActiveSignUp,
    toggleIsActiveSignIn,
    toggleIsActiveImojiInput,
} = uiSlice.actions;

export default uiSlice.reducer;
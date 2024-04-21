import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import isEmpty from "lodash/isEmpty";
import {Defines} from "@/defines";
import {Domains} from "@/domains";
import deepmerge from "deepmerge";
import AuthStateType = Defines.AuthStateType;
import defaultProfileImageUrl = Domains.defaultProfileImageUrl;
import {Helpers} from "@/helpers";

interface UserState {
    token: string;
    id: string;
    accountType: Defines.AccountType;
    name: string;
    message: string;
    haveProfile: boolean;
    latestActive: number;
    profileImageUrl: string;
    authState: Defines.AuthStateType;
    others: Domains.User[];
    latestActiveUsers: Domains.User[];
    connectedUsers: Domains.User[];
    follows: Domains.User[];
    followers: Domains.User[];
}

const initialState: UserState = {
    token: "",
    id: "",
    accountType: Defines.AccountType.NONE,
    name: "",
    message: "",
    haveProfile: false,
    latestActive: 0,
    profileImageUrl: defaultProfileImageUrl,
    authState: AuthStateType.NONE,
    others: [],
    latestActiveUsers: [],
    connectedUsers: [],
    follows: [],
    followers: []
}

const userSlice = createSlice({
    name: 'User',
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setToken: ${action.payload}`);

            state.token = action.payload;
            Helpers.setCookie("token", action.payload, 3650);
        },
        setRefreshToken: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setRefreshToken: ${action.payload}`);

            state.token = action.payload;
            Helpers.setCookie("rtk", action.payload, 365);
        },
        signIn: (state, action: PayloadAction<Domains.SignInProps>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - signIn: ${action.payload}`);

            if (isEmpty(action.payload.token)) {
                if ('production' !== process.env.NODE_ENV)
                    console.log(`reducer - signIn: token is empty`);
                return;
            }

            Helpers.setCookie("token", action.payload.token, 3650);
            if (!isEmpty(action.payload.refreshToken))
                Helpers.setCookie("rtk", action.payload.refreshToken, 365);

            state.token = action.payload.token;
            state.authState = Defines.AuthStateType.SIGN_IN;
            state.id = action.payload.user.userId;
            state.accountType = action.payload.user.accountType;
            state.name = action.payload.user.userName;
            state.message = action.payload.user.message;
            state.haveProfile = action.payload.user.haveProfile;
            state.latestActive = action.payload.user.latestActive;
            state.profileImageUrl = defaultProfileImageUrl;
            state.others = [];
            state.latestActiveUsers = [];
            state.connectedUsers = [];
            state.follows = [];
            state.followers = [];
        },
        signOut: (state) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - signOut`);

            state.authState = Defines.AuthStateType.NONE;
            state.id = "";
            state.accountType = Defines.AccountType.NONE;
            state.name = "";
            state.message = "";
            state.haveProfile = false;
            state.latestActive = 0;
            state.profileImageUrl = defaultProfileImageUrl;
            state.others = [];
            state.latestActiveUsers = [];
            state.connectedUsers = [];
            state.follows = [];
            state.followers = [];
        },
        setUserId: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setUserId: ${action.payload}`);

            state.id = isEmpty(action.payload) ? '' : action.payload;
        },
        setUserAccountType: (state, action: PayloadAction<Defines.AccountType>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setUserAccountType: ${action.payload}`);

            state.accountType = action.payload;
        },
        setUserName: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setUserName: ${action.payload}`);

            if (action.payload && 10 < action.payload.trim().length) {
                alert(`대화명은 10글자 이내로 입력해주세요.`);
                state.name = state.name.trim();
                return;
            }

            state.name = isEmpty(action.payload) ? '' : action.payload;
        },
        setUserMessage: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setUserMessage: ${action.payload}`);

            if (action.payload && 128 < action.payload.trim().length) {
                alert(`상태 메시지는 128글자 이내로 입력해주세요.`);
                state.message = state.message.trim();
                return;
            }

            state.message = isEmpty(action.payload) ? '' : action.payload;
        },
        setHaveProfile: (state, action: PayloadAction<boolean>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setHaveProfile: ${action.payload}`);

            state.haveProfile = action.payload ?? false;
        },
        setLatestActive: (state, action: PayloadAction<number>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setLatestActive: ${action.payload}`);

            state.latestActive = 0 > action.payload ? 0 : action.payload;
        },
        setProfileImageUrl: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setHaveProfile: ${action.payload}`);

            state.haveProfile = !isEmpty(action.payload);
            state.profileImageUrl = isEmpty(action.payload) ? defaultProfileImageUrl : action.payload;
        },
        setAuthState: (state, action: PayloadAction<Defines.AuthStateType>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setAuthState: ${JSON.stringify(Defines.AuthStateType[action.payload])}`);

            state.authState = action.payload;
        },
        setOthers: (state, action: PayloadAction<Domains.User[]>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setOthers: ${JSON.stringify(action.payload)}`);

            state.others = action.payload.filter(_ => _.userId != state.id);
        },
        addOthers: (state, action: PayloadAction<Domains.User>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - addOthers: ${JSON.stringify(action.payload)}`);

            if (!action || !action.payload || isEmpty(action.payload.userId))
                return;

            if (action.payload.userId == state.id)
                return;

            if (null != state.others.find(_ => _.userId == action.payload.userId))
                return;

            state.others.push(action.payload);
            state.others = deepmerge([], state.others);
        },
        removeOthers: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - removeOthers: ${action.payload}`);

            if (!action || isEmpty(action.payload))
                return;

            if (null == state.others.find(_ => _.userId == action.payload))
                return;

            state.others = state.others.filter(_ => _.userId != action.payload);
            state.others = deepmerge([], state.others);
        },
        setLatestActiveUsers: (state, action: PayloadAction<Domains.User[]>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setLatestActiveUsers: ${JSON.stringify(action.payload)}`);

            state.latestActiveUsers = action.payload.filter(_ => _.userId != state.id);
        },
        setConnectedUsers: (state, action: PayloadAction<Domains.User[]>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setConnectedUsers: ${JSON.stringify(action.payload)}`);

            state.connectedUsers = action.payload.filter(_ => _.userId != state.id);
        },
        addConnectedUser: (state, action: PayloadAction<Domains.User>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - addConnectedUser: ${JSON.stringify(action.payload)}`);

            if (!action || !action.payload || isEmpty(action.payload.userId))
                return;

            if (null != state.connectedUsers.find(_ => _.userId == action.payload.userId))
                return;

            if (action.payload.userId == state.id)
                return;

            state.connectedUsers.push(action.payload);
            state.connectedUsers = deepmerge([], state.connectedUsers);

            const other = state.others.find(_ => _.userId == action.payload.userId);
            if (null != other) {
                other.online = true;
                state.others = deepmerge([], state.others);
            }
        },
        removeConnectedUser: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - removeConnectedUser: ${action.payload}`);

            if (!action || isEmpty(action.payload))
                return;

            if (null == state.connectedUsers.find(_ => _.userId == action.payload))
                return;

            state.connectedUsers = state.connectedUsers.filter(_ => _.userId != action.payload);
            state.connectedUsers = deepmerge([], state.connectedUsers);

            const other = state.others.find(_ => _.userId == action.payload);
            if (null != other) {
                other.online = false;
                state.others = deepmerge([], state.others);
            }
        },
        setFollows: (state, action: PayloadAction<Domains.User[]>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setFollows: ${JSON.stringify(action.payload)}`);

            state.follows = action.payload.filter(_ => _.userId != state.id);
        },
        addFollow: (state, action: PayloadAction<Domains.User>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - addFollow: ${JSON.stringify(action.payload)}`);

            if (!action || !action.payload || isEmpty(action.payload.userId))
                return;

            if (null != state.follows.find(_ => _.userId == action.payload.userId))
                return;

            if (action.payload.userId == state.id)
                return;

            state.follows.push(action.payload);
            state.follows = deepmerge([], state.follows);
        },
        removeFollow: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - removeFollow: ${action.payload}`);

            if (!action || isEmpty(action.payload))
                return;

            if (null == state.follows.find(_ => _.userId == action.payload))
                return;

            state.follows = state.follows.filter(_ => _.userId != action.payload);
            state.follows = deepmerge([], state.follows);
        },
        setFollowers: (state, action: PayloadAction<Domains.User[]>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setFollowers: ${JSON.stringify(action.payload)}`);

            state.followers = action.payload.filter(_ => _.userId != state.id);
        },
        addFollower: (state, action: PayloadAction<Domains.User>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - addFollower: ${JSON.stringify(action.payload)}`);

            if (!action || !action.payload || isEmpty(action.payload.userId))
                return;

            if (null != state.followers.find(_ => _.userId == action.payload.userId))
                return;

            if (action.payload.userId == state.id)
                return;

            state.followers.push(action.payload);
            state.followers = deepmerge([], state.followers);
        },
        removeFollower: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - removeFollower: ${action.payload}`);

            if (!action || isEmpty(action.payload))
                return;

            if (null == state.followers.find(_ => _.userId == action.payload))
                return;

            state.followers = state.followers.filter(_ => _.userId != action.payload);
            state.followers = deepmerge([], state.followers);
        },
        updateUsersData: (state, action: PayloadAction<UpdateUsersDataProps>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - updateUsersData: ${action.payload}`);

            if (!action || !action.payload) {
                console.log(`reducer - updateUsersData: data is null.`);
                return;
            }

            if ('name' != action.payload.dataType && 'message' != action.payload.dataType && 'profile' != action.payload.dataType) {
                console.log(`reducer - updateUsersData: not suitable dataType.`);
                return;
            }

            if (isEmpty(action.payload.userId)) {
                console.log(`reducer - updateUsersData: userId required.`);
                return;
            }

            if ('name' == action.payload.dataType && isEmpty(action.payload.userData)) {
                console.log(`reducer - updateUsersData: userName can not be empty.`);
                return;
            }

            const other = state.others.find(_ => _.userId == action.payload.userId);

            switch (action.payload.dataType) {
                case "name":
                    if (null != other) {
                        other.userName = action.payload.userData;
                        state.others = deepmerge([], state.others);
                    }
                    break;

                case "message":
                    if (null != other) {
                        other.message = action.payload.userData;
                        state.others = deepmerge([], state.others);
                    }
                    break;

                case "profile":
                    if (null != other) {
                        if (isEmpty(action.payload.userData)) {
                            other.haveProfile = false;
                            other.profileImageUrl = defaultProfileImageUrl;
                        } else {
                            other.haveProfile = true;
                            other.profileImageUrl = action.payload.userData;
                        }
                        state.others = deepmerge([], state.others);
                    }
                    break;
            }
        },
    }
});

export interface UpdateUsersDataProps {
    dataType: 'name'|'message'|'profile'
    userId: string;
    userData: string;
}

export type { UserState };
export const {
    setToken,
    setRefreshToken,
    signIn,
    signOut,
    setUserId,
    setUserAccountType,
    setUserName,
    setUserMessage,
    setHaveProfile,
    setLatestActive,
    setProfileImageUrl,
    setAuthState,
    setOthers,
    addOthers,
    setLatestActiveUsers,
    setConnectedUsers,
    addConnectedUser,
    removeConnectedUser,
    setFollows,
    addFollow,
    removeFollow,
    setFollowers,
    addFollower,
    removeFollower,
    updateUsersData
} = userSlice.actions;

export default userSlice.reducer;
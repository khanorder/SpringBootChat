import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import isEmpty from "lodash/isEmpty";
import {Defines} from "@/defines";
import {Domains} from "@/domains";
import deepmerge from "deepmerge";
import AuthStateType = Defines.AuthStateType;
import {Helpers} from "@/helpers";

interface UserState {
    userInfos: {[p: string]: Domains.UserInfo};
    id: string;
    authState: Defines.AuthStateType;
    others: Domains.User[];
    latestActiveUsers: Domains.User[];
    connectedUsers: Domains.User[];
    follows: Domains.User[];
    followers: Domains.User[];
}

const initialState: UserState = {
    userInfos: {},
    id: "",
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
        setUserInfo: (state, action: PayloadAction<Domains.UserInfo>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setUserInfo: ${JSON.stringify(action.payload)}`);

            state.userInfos = Helpers.mapToObject(Helpers.mergeUserInfoCookie(action.payload));
        },
        removeUserInfo: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - removeUserInfo: ${action.payload}`);

            const userInfos = Helpers.objectToMap(state.userInfos);
            if (userInfos.has(action.payload)) {
                userInfos.delete(action.payload);
                Helpers.setUserInfosCookie(userInfos);
                state.userInfos = Helpers.mapToObject(userInfos);
            }
        },
        setUserInfos: (state, action: PayloadAction<Map<string, Domains.UserInfo>>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setUserInfos: ${JSON.stringify(action.payload, Helpers.replacer)}`);

            state.userInfos = Helpers.mapToObject(action.payload);
            Helpers.setUserInfosCookie(action.payload);
        },
        signIn: (state, action: PayloadAction<Domains.SignInProps>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - signIn: ${action.payload}`);

            if (isEmpty(action.payload.accessToken)) {
                if ('production' !== process.env.NODE_ENV)
                    console.log(`reducer - signIn: token is empty`);
                return;
            }

            const userTokenInfo: Domains.UserInfo = {
                userId: action.payload.user.userId,
                accessToken: action.payload.accessToken,
                refreshToken: action.payload.refreshToken,
                accountType: action.payload.user.accountType,
                nickName: action.payload.user.nickName,
                message: action.payload.user.message,
                haveProfile: action.payload.user.haveProfile,
                latestActiveAt: action.payload.user.latestActive,
                profileImageUrl: Domains.defaultProfileImageUrl
            };

            const userInfos = Helpers.mergeUserInfoCookie(userTokenInfo);
            state.userInfos = Helpers.mapToObject(userInfos);
            state.authState = Defines.AuthStateType.SIGN_IN;
            state.id = action.payload.user.userId;
            Helpers.mergeUserIdCookie(action.payload.user.userId);
            state.others = [];
            state.latestActiveUsers = [];
            state.connectedUsers = [];
            state.follows = [];
            state.followers = [];
        },
        updateSignIn: (state, action: PayloadAction<Domains.SignInProps>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - updateSignIn: ${JSON.stringify(action.payload)}`);

            if (isEmpty(action.payload.accessToken)) {
                if ('production' !== process.env.NODE_ENV)
                    console.log(`reducer - updateSignIn: token is empty`);
                return;
            }

            const userTokenInfo: Domains.UserInfo = {
                userId: action.payload.user.userId,
                accessToken: action.payload.accessToken,
                refreshToken: action.payload.refreshToken,
                accountType: action.payload.user.accountType,
                nickName: action.payload.user.nickName,
                message: action.payload.user.message,
                haveProfile: action.payload.user.haveProfile,
                latestActiveAt: action.payload.user.latestActive,
                profileImageUrl: Domains.defaultProfileImageUrl
            };
            const userInfos = Helpers.mergeUserInfoCookie(userTokenInfo);
            state.userInfos = Helpers.mapToObject(userInfos);
            state.authState = Defines.AuthStateType.SIGN_IN;
            state.id = action.payload.user.userId;
            Helpers.mergeUserIdCookie(action.payload.user.userId);
            state.latestActiveUsers = [];
            state.connectedUsers = [];
            state.follows = [];
            state.followers = [];
        },
        signOut: (state) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - signOut`);

            if (!isEmpty(state.id)) {
                const userInfos = Helpers.expireAccessTokenCookie(state.id);
                if (null != userInfos)
                    state.userInfos = Helpers.mapToObject(userInfos);
            }
            state.authState = Defines.AuthStateType.NONE;
            state.others = [];
            state.latestActiveUsers = [];
            state.connectedUsers = [];
            state.follows = [];
            state.followers = [];
        },
        expireAccessToken: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - expireAccessToken`);

            state.authState = Defines.AuthStateType.NONE;
            const userId = isEmpty(action.payload) ? state.id : action.payload;

            if (!isEmpty(userId)) {
                const userInfos = Helpers.expireAccessTokenCookie(userId);
                if (null != userInfos)
                    state.userInfos = Helpers.mapToObject(userInfos);
            }
            state.latestActiveUsers = [];
            state.connectedUsers = [];
            state.follows = [];
            state.followers = [];
        },
        expireRefreshToken: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - expireRefreshToken`);

            state.authState = Defines.AuthStateType.NONE;
            const userId = isEmpty(action.payload) ? state.id : action.payload;

            if (!isEmpty(userId)) {
                const userInfos = Helpers.expireRefreshTokenCookie(userId);
                if (null != userInfos)
                    state.userInfos = Helpers.mapToObject(userInfos);
            }
            state.latestActiveUsers = [];
            state.connectedUsers = [];
            state.follows = [];
            state.followers = [];
        },
        setUserId: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setUserId: ${action.payload}`);

            state.id = isEmpty(action.payload) ? '' : action.payload;
            Helpers.mergeUserIdCookie(state.id);
        },
        setUserAccountType: (state, action: PayloadAction<Defines.AccountType>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setUserAccountType: ${action.payload}`);

            if (isEmpty(state.id)) {
                alert(`선택된 사용자가 없습니다.`);
                return;
            }

            const userInfos = Helpers.setUserAccountTypeCookie(state.id, action.payload);
            if (null != userInfos)
                state.userInfos = Helpers.mapToObject(userInfos);
        },
        setNickName: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setNickName: ${action.payload}`);

            if (isEmpty(state.id)) {
                alert(`선택된 사용자가 없습니다.`);
                return;
            }

            if (action.payload && 10 < action.payload.trim().length) {
                alert(`대화명은 10글자 이내로 입력해주세요.`);
                return;
            }

            const userInfos = Helpers.setNickNameCookie(state.id, action.payload.trim());
            if (null != userInfos)
                state.userInfos = Helpers.mapToObject(userInfos);
        },
        setUserMessage: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setUserMessage: ${action.payload}`);

            if (isEmpty(state.id)) {
                alert(`선택된 사용자가 없습니다.`);
                return;
            }

            if (action.payload && 128 < action.payload.trim().length) {
                alert(`상태 메시지는 128글자 이내로 입력해주세요.`);
                return;
            }

            const userInfos = Helpers.setUserMessageCookie(state.id, action.payload.trim());
            if (null != userInfos)
                state.userInfos = Helpers.mapToObject(userInfos);
        },
        setHaveProfile: (state, action: PayloadAction<boolean>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setHaveProfile: ${action.payload}`);

            if (isEmpty(state.id)) {
                alert(`선택된 사용자가 없습니다.`);
                return;
            }

            const userInfos = Helpers.setUserHaveProfileCookie(state.id, action.payload ?? false);
            if (null != userInfos)
                state.userInfos = Helpers.mapToObject(userInfos);
        },
        setLatestActive: (state, action: PayloadAction<number>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setLatestActive: ${action.payload}`);

            if (isEmpty(state.id)) {
                alert(`선택된 사용자가 없습니다.`);
                return;
            }

            const userInfos = Helpers.setUserLatestActiveAtCookie(state.id, 0 > action.payload ? 0 : action.payload);
            if (null != userInfos)
                state.userInfos = Helpers.mapToObject(userInfos);
        },
        setProfileImageUrl: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setProfileImageUrl: ${action.payload}`);

            if (isEmpty(state.id)) {
                alert(`선택된 사용자가 없습니다.`);
                return;
            }

            const userInfos = Helpers.setUserProfileImageCookie(state.id, action.payload);
            if (null != userInfos)
                state.userInfos = Helpers.mapToObject(userInfos);
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
            localStorage.setItem("others", JSON.stringify((state.others)));
        },
        loadOthers: (state) => {
            let others: Domains.User[] = [];
            const othersJson = localStorage.getItem("others");
            try {
                if (null != othersJson && !isEmpty(othersJson)) {
                    others = JSON.parse(othersJson);
                    for (let i = 0; i < others.length; i++)
                        others[i].online = false;
                }
            } catch (error) {
                console.error(error);
            }

            // if ('production' !== process.env.NODE_ENV)
            //     console.log(`reducer - loadOthers: ${JSON.stringify(others)}`);

            state.others = others.filter(_ => _.userId != state.id);
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
            localStorage.setItem("others", JSON.stringify((state.others)));
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
            localStorage.setItem("others", JSON.stringify((state.others)));
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
            for (let i = 0; i < state.connectedUsers.length; i++) {
                if (1 > state.others.length)
                    return;

                const other = state.others.find(_ => _.userId == state.connectedUsers[i].userId);
                if (null != other)
                    other.online = true;
            }
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
            localStorage.setItem("others", JSON.stringify((state.others)));
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
            localStorage.setItem("others", JSON.stringify((state.others)));
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

            if ('nickName' != action.payload.dataType && 'message' != action.payload.dataType && 'profile' != action.payload.dataType) {
                console.log(`reducer - updateUsersData: not suitable dataType.`);
                return;
            }

            if (isEmpty(action.payload.userId)) {
                console.log(`reducer - updateUsersData: userId required.`);
                return;
            }

            if ('nickName' == action.payload.dataType && isEmpty(action.payload.userData)) {
                console.log(`reducer - updateUsersData: nickName can not be empty.`);
                return;
            }

            const other = state.others.find(_ => _.userId == action.payload.userId);

            switch (action.payload.dataType) {
                case "nickName":
                    if (null != other) {
                        other.nickName = action.payload.userData;
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
                            other.profileImageUrl = Domains.defaultProfileImageUrl;
                        } else {
                            other.haveProfile = true;
                            other.profileImageUrl = action.payload.userData;
                        }
                        state.others = deepmerge([], state.others);
                    }
                    break;
            }

            localStorage.setItem("others", JSON.stringify((state.others)));
        },
    }
});

export interface UpdateUsersDataProps {
    dataType: 'nickName'|'message'|'profile'
    userId: string;
    userData: string;
}

export type { UserState };
export const {
    // setToken,
    // setRefreshToken,
    setUserInfo,
    removeUserInfo,
    setUserInfos,
    signIn,
    updateSignIn,
    signOut,
    expireAccessToken,
    expireRefreshToken,
    setUserId,
    setUserAccountType,
    setNickName,
    setUserMessage,
    setHaveProfile,
    setLatestActive,
    setProfileImageUrl,
    setAuthState,
    setOthers,
    loadOthers,
    addOthers,
    removeOthers,
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
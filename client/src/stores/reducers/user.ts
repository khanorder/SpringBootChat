import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import isEmpty from "lodash/isEmpty";
import {Defines} from "@/defines";
import {Domains} from "@/domains";
import deepmerge from "deepmerge";
import AuthStateType = Defines.AuthStateType;
import defaultProfileImageUrl = Domains.defaultProfileImageUrl;

interface UserState {
    id: string;
    name: string;
    message: string;
    haveProfile: boolean;
    latestActive: number;
    profileImageUrl: string;
    authState: Defines.AuthStateType;
    others: Domains.User[];
    connectedUsers: Domains.User[];
    follows: Domains.User[];
    followers: Domains.User[];
}

const initialState: UserState = {
    id: '',
    name: '',
    message: '',
    haveProfile: false,
    latestActive: 0,
    profileImageUrl: defaultProfileImageUrl,
    authState: AuthStateType.NONE,
    others: [],
    connectedUsers: [],
    follows: [],
    followers: []
}

const userSlice = createSlice({
    name: 'User',
    initialState,
    reducers: {
        setUserId: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setUserId: ${action.payload}`);

            state.id = isEmpty(action.payload) ? '' : action.payload;
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
        setConnectedUsers: (state, action: PayloadAction<Domains.User[]>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setConnectedUsers: ${JSON.stringify(action.payload)}`);

            state.connectedUsers = action.payload.filter(_ => _.userId != state.id);
            for (let i = 0; i < state.connectedUsers.length; i++) {
                const connected = state.connectedUsers[i];
                const other = state.others.find(_ => _.userId == connected.userId);
                if (null == other)
                    state.others.push(connected);
            }
            state.others = deepmerge([], state.others);
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
            } else {
                state.others.push(action.payload);
                state.others = deepmerge([], state.others);
            }

            const follow = state.follows.find(_ => _.userId == action.payload.userId);
            if (null != follow) {
                follow.online = true;
                state.follows = deepmerge([], state.follows);
            }

            const follower = state.followers.find(_ => _.userId == action.payload.userId);
            if (null != follower) {
                follower.online = true;
                state.followers = deepmerge([], state.followers);
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

            const follow = state.follows.find(_ => _.userId == action.payload);
            if (null != follow) {
                follow.online = false;
                state.follows = deepmerge([], state.follows);
            }

            const follower = state.followers.find(_ => _.userId == action.payload);
            if (null != follower) {
                follower.online = false;
                state.followers = deepmerge([], state.followers);
            }
        },
        setFollows: (state, action: PayloadAction<Domains.User[]>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setFollows: ${JSON.stringify(action.payload)}`);

            state.follows = action.payload.filter(_ => _.userId != state.id);

            for (let i = 0; i < state.follows.length; i++) {
                const follow = state.follows[i];
                const other = state.others.find(_ => _.userId == follow.userId);
                if (null == other)
                    state.others.push(follow);
            }
            state.others = deepmerge([], state.others);
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

            const other = state.others.find(_ => _.userId == action.payload.userId);
            if (null == other) {
                state.others.push(action.payload);
                state.others = deepmerge([], state.others);
            }
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

            for (let i = 0; i < state.followers.length; i++) {
                const follower = state.followers[i];
                const other = state.others.find(_ => _.userId == follower.userId);
                if (null == other)
                    state.others.push(follower);
            }
            state.others = deepmerge([], state.others);
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

            const other = state.others.find(_ => _.userId == action.payload.userId);
            if (null == other) {
                state.others.push(action.payload);
                state.others = deepmerge([], state.others);
            }
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
            const connectedUser = state.connectedUsers.find(_ => _.userId == action.payload.userId);
            const follow = state.follows.find(_ => _.userId == action.payload.userId);
            const follower = state.followers.find(_ => _.userId == action.payload.userId);

            switch (action.payload.dataType) {
                case "name":
                    if (null != other) {
                        other.userName = action.payload.userData;
                        state.others = deepmerge([], state.others);
                    }

                    if (null != connectedUser) {
                        connectedUser.userName = action.payload.userData;
                        state.connectedUsers = deepmerge([], state.connectedUsers);
                    }

                    if (null != follow) {
                        follow.userName = action.payload.userData;
                        state.follows = deepmerge([], state.follows);
                    }

                    if (null != follower) {
                        follower.userName = action.payload.userData;
                        state.followers = deepmerge([], state.followers);
                    }
                    break;

                case "message":
                    if (null != other) {
                        other.message = action.payload.userData;
                        state.others = deepmerge([], state.others);
                    }

                    if (null != connectedUser) {
                        connectedUser.message = action.payload.userData;
                        state.connectedUsers = deepmerge([], state.connectedUsers);
                    }

                    if (null != follow) {
                        follow.message = action.payload.userData;
                        state.follows = deepmerge([], state.follows);
                    }

                    if (null != follower) {
                        follower.message = action.payload.userData;
                        state.followers = deepmerge([], state.followers);
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

                    if (null != connectedUser) {
                        if (isEmpty(action.payload.userData)) {
                            connectedUser.haveProfile = false;
                            connectedUser.profileImageUrl = defaultProfileImageUrl;
                        } else {
                            connectedUser.haveProfile = true;
                            connectedUser.profileImageUrl = action.payload.userData;
                        }
                        state.connectedUsers = deepmerge([], state.connectedUsers);
                    }

                    if (null != follow) {
                        if (isEmpty(action.payload.userData)) {
                            follow.haveProfile = false;
                            follow.profileImageUrl = defaultProfileImageUrl;
                        } else {
                            follow.haveProfile = true;
                            follow.profileImageUrl = action.payload.userData;
                        }
                        state.follows = deepmerge([], state.follows);
                    }

                    if (null != follower) {
                        if (isEmpty(action.payload.userData)) {
                            follower.haveProfile = false;
                            follower.profileImageUrl = defaultProfileImageUrl;
                        } else {
                            follower.haveProfile = true;
                            follower.profileImageUrl = action.payload.userData;
                        }
                        state.followers = deepmerge([], state.followers);
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
    setUserId,
    setUserName,
    setUserMessage,
    setHaveProfile,
    setLatestActive,
    setProfileImageUrl,
    setAuthState,
    setOthers,
    addOthers,
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
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import isEmpty from "lodash/isEmpty";
import {Defines} from "@/defines";
import {Domains} from "@/domains";
import deepmerge from "deepmerge";
import AuthStateType = Defines.AuthStateType;

interface UserState {
    id: string;
    name: string;
    authState: Defines.AuthStateType;
    connectedUsers: Domains.User[];
    follows: Domains.User[];
    followers: Domains.User[];
}

const initialState: UserState = {
    id: '',
    name: '',
    authState: AuthStateType.NONE,
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
                console.log(`reducer - setUserId: ${JSON.stringify(action.payload)}`);

            state.id = isEmpty(action.payload) ? '' : action.payload;
        },
        setUserName: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setUserName: ${JSON.stringify(action.payload)}`);

            if (action.payload && 10 < action.payload.trim().length) {
                alert(`대화명은 10글자 이내로 입력해주세요.`);
                state.name = state.name.trim();
                return;
            }

            state.name = isEmpty(action.payload) ? '' : action.payload;
        },
        setAuthState: (state, action: PayloadAction<Defines.AuthStateType>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setAuthState: ${JSON.stringify(Defines.AuthStateType[action.payload])}`);

            state.authState = action.payload;
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
    }
});

export type { UserState };
export const {
    setUserId,
    setUserName,
    setAuthState,
    setConnectedUsers,
    addConnectedUser,
    removeConnectedUser,
    setFollows,
    addFollow,
    removeFollow,
    setFollowers,
    addFollower,
    removeFollower
} = userSlice.actions;

export default userSlice.reducer;
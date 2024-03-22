import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import isEmpty from "lodash/isEmpty";

interface UserState {
    id: string;
    name: string;
}

const initialState: UserState = {
    id: '',
    name: ''
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
        }
    }
});

export type { UserState };
export const {
    setUserId,
    setUserName
} = userSlice.actions;

export default userSlice.reducer;
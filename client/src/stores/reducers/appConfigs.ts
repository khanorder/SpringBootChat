import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface AppConfigsState {
    name: string;
}

const initialState: AppConfigsState = {
    name: '채팅 샘플'
}

const appConfigsSlice = createSlice({
    name: 'AppConfigs',
    initialState,
    reducers: {
    }
});

export type { AppConfigsState };
export const {
} = appConfigsSlice.actions;

export default appConfigsSlice.reducer;
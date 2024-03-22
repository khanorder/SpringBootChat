import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface AppConfigsState {
    name: string;
}

const initialState: AppConfigsState = {
    name: '샘플 게임'
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
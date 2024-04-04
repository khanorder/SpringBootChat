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
        setAppName: (state, action: PayloadAction<string>) => {
            if (!action || !action.payload)
                return;

            state.name = action.payload;
        },
    }
});

export type { AppConfigsState };
export const {
    setAppName
} = appConfigsSlice.actions;

export default appConfigsSlice.reducer;
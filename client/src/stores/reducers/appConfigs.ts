import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface AppConfigsState {
    isProd: boolean;
    name: string;
}

const initialState: AppConfigsState = {
    isProd: false,
    name: '채팅 샘플'
}

const appConfigsSlice = createSlice({
    name: 'AppConfigs',
    initialState,
    reducers: {
        setIsProd: (state, action: PayloadAction<boolean>) => {
            state.isProd = action.payload;
        },
        setAppName: (state, action: PayloadAction<string>) => {
            if (!action || !action.payload)
                return;

            state.name = action.payload;
        },
    }
});

export type { AppConfigsState };
export const {
    setIsProd,
    setAppName
} = appConfigsSlice.actions;

export default appConfigsSlice.reducer;
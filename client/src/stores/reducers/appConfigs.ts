import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface AppConfigsState {
    isProd: boolean;
    clientVersionMain: number;
    clientVersionUpdate: number;
    clientVersionMaintenance: number;
    serverVersionMain: number;
    serverVersionUpdate: number;
    serverVersionMaintenance: number;
    name: string;
    description: string;
    keyword: string;
    author: string;
    copyright: string;
    url: string;
    ogImage: string;
}

const initialState: AppConfigsState = {
    isProd: false,
    clientVersionMain: 0,
    clientVersionUpdate: 1,
    clientVersionMaintenance: 3,
    serverVersionMain: 0,
    serverVersionUpdate: 0,
    serverVersionMaintenance: 0,
    name: '채팅 샘플',
    description: '웹소켓 구현, 채팅 샘플',
    keyword: '채팅 샘플, 웹소캣, 채팅방',
    author: 'baejangho.com',
    copyright: 'baejangho.com',
    url: 'chat.baejangho.com',
    ogImage: '/images/logo-m3_gmbaejangho.gif'
}

const appConfigsSlice = createSlice({
    name: 'AppConfigs',
    initialState,
    reducers: {
        setIsProd: (state, action: PayloadAction<boolean>) => {
            state.isProd = action.payload;
        },
        setServerVersion: (state, action: PayloadAction<[number, number, number]>) => {
            state.serverVersionMain = action.payload[0];
            state.serverVersionUpdate = action.payload[1];
            state.serverVersionMaintenance = action.payload[2];
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
    setServerVersion,
    setAppName
} = appConfigsSlice.actions;

export default appConfigsSlice.reducer;
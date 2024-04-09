import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface AppConfigsState {
    isProd: boolean;
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
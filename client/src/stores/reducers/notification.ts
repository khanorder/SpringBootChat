import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import isEmpty from "lodash/isEmpty";
import {Defines} from "@/defines";
import {Domains} from "@/domains";
import deepmerge from "deepmerge";

interface NotificationState {
    notifications: Domains.Notification[];
}

const initialState: NotificationState = {
    notifications: [],
}

const notificationSlice = createSlice({
    name: 'Notification',
    initialState,
    reducers: {
        setNotifications: (state, action: PayloadAction<Domains.Notification[]>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - setNotifications: ${JSON.stringify(action.payload)}`);

            state.notifications = action.payload;
        },
        addNotification: (state, action: PayloadAction<Domains.Notification>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - addNotification: ${JSON.stringify(action.payload)}`);

            if (!action.payload || isEmpty(action.payload.id))
                return;

            const exists = state.notifications.find(_ => _.id == action.payload.id);
            if (null != exists)
                return;

            state.notifications.push(action.payload);
            state.notifications = deepmerge([], state.notifications);
        },
        checkNotification: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - checkNotification: ${JSON.stringify(action.payload)}`);

            if (!action.payload || isEmpty(action.payload))
                return;

            const exists = state.notifications.find(_ => _.id == action.payload);
            if (null == exists)
                return;

            if (exists.isCheck)
                return;

            exists.isCheck = true;
            state.notifications = deepmerge([], state.notifications);
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            if ('production' !== process.env.NODE_ENV)
                console.log(`reducer - removeNotification: ${JSON.stringify(action.payload)}`);

            if (!action.payload || isEmpty(action.payload))
                return;

            state.notifications = state.notifications.filter(_ => _.id != action.payload);
            state.notifications = deepmerge([], state.notifications);
        },
    }
});

export type { NotificationState };
export const {
    setNotifications,
    addNotification,
    checkNotification,
    removeNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
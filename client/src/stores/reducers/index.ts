import {AnyAction, combineReducers} from 'redux';
import {routerReducer} from 'connected-next-router';
import {HYDRATE} from 'next-redux-wrapper';
import appConfigs from './appConfigs';
import chat from './chat';
import user from './user';
import webSocket from './webSocket';

const reducers = combineReducers({
    router: routerReducer,
    appConfigs,
    chat,
    user,
    webSocket
});

const rootReducer = (state: RootState | undefined, action: AnyAction) => {
    switch (action.type) {
        case HYDRATE:
            return action.payload;

        default: {
            return reducers(state, action);
        }
    }
}

export type RootState = ReturnType<typeof reducers>;
export default rootReducer;
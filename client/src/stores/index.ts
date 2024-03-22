import {configureStore} from '@reduxjs/toolkit';
import {createWrapper} from 'next-redux-wrapper';
import reducers from './reducers';
import {createRouterMiddleware} from 'connected-next-router';
import createSagaMiddleware from "redux-saga";
import rootSaga from '@/sagas/index';

const makeStore = () => {
    const sagaMiddleware = createSagaMiddleware();
    const routerMiddleware = createRouterMiddleware();

    const store = configureStore({
        reducer: reducers,
        // middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
        middleware: [sagaMiddleware, routerMiddleware],
        devTools: process.env.NODE_ENV !== 'production'
    });

    sagaMiddleware.run(rootSaga);

    return store;
};

export const store = makeStore();
export type AppDispatch = typeof store.dispatch;
export default createWrapper(makeStore, {debug: process.env.NODE_ENV !== 'production'});
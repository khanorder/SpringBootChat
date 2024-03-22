import {all, call, fork} from 'redux-saga/effects';
import {watchWebSocket} from './webSocket';

export default function* rootSaga() {
    yield all([
        call(watchWebSocket),
    ]);
}
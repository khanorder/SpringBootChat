import {all, call, fork} from 'redux-saga/effects';
import {watchWebSocket} from './webSocket';
import {user} from "@/sagas/user";

export default function* rootSaga() {
    yield all([
        call(watchWebSocket),
        call(user),
    ]);
}
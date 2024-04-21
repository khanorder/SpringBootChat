import {call, put, select, take, takeLatest} from "redux-saga/effects";
import {
    setProfileImageUrl, signIn,
    signOut, UserState
} from '@/stores/reducers/user';
import {setNotifications} from "@/stores/reducers/notification";
import {exitChatRoom, setChatRooms, setChatDetailImageId} from "@/stores/reducers/chat";
import {initUI} from "@/stores/reducers/ui";
import {WebSocketState} from "@/stores/reducers/webSocket";
import {RootState} from "@/stores/reducers";
import {AppConfigsState} from "@/stores/reducers/appConfigs";
import {Domains} from "@/domains";
import profileImageSmallUrlPrefix = Domains.profileImageSmallUrlPrefix;
import defaultProfileImageUrl = Domains.defaultProfileImageUrl;

function* callSignIn() {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callSignIn`);

    const appConfigs: AppConfigsState = yield select((state: RootState) => state.appConfigs);
    const userState: UserState = yield select((state: RootState) => state.user);

    if (userState.haveProfile) {
        yield put(setProfileImageUrl(`${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}${userState.id}?${(new Date()).getTime()}`));
    } else {
        yield put(setProfileImageUrl(defaultProfileImageUrl));
    }
}

function* callSignOut() {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callSignOut`);

    yield put(setNotifications([]));
    yield put(exitChatRoom());
    yield put(setChatRooms([]));
    yield put(setChatDetailImageId(""));
    yield put(initUI());
}

export function* user() {
    yield takeLatest(signIn, callSignIn);
    yield takeLatest(signOut, callSignOut);
}
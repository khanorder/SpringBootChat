import {call, put, select, take, takeLatest} from "redux-saga/effects";
import {
    expireAccessToken, expireRefreshToken,
    setProfileImageUrl, signIn,
    signOut, updateSignIn, UserState
} from '@/stores/reducers/user';
import {setNotifications} from "@/stores/reducers/notification";
import {exitChatRoom, setChatRooms, setChatDetailImageId} from "@/stores/reducers/chat";
import {initUI} from "@/stores/reducers/ui";
import {RootState} from "@/stores/reducers";
import {AppConfigsState} from "@/stores/reducers/appConfigs";
import {Domains} from "@/domains";
import profileImageSmallUrlPrefix = Domains.profileImageSmallUrlPrefix;
import {Helpers} from "@/helpers";

function* callSignIn() {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callSignIn`);

    const appConfigs: AppConfigsState = yield select((state: RootState) => state.appConfigs);
    const userState: UserState = yield select((state: RootState) => state.user);
    const userInfo = Helpers.getUserInfo(userState.id, userState.userInfos);

    if (userInfo.haveProfile) {
        yield put(setProfileImageUrl(`${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}${userState.id}?${(new Date()).getTime()}`));
    } else {
        yield put(setProfileImageUrl(Domains.defaultProfileImageUrl));
    }
}

function* callUpdateSignIn() {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callUpdateSignIn`);

    const appConfigs: AppConfigsState = yield select((state: RootState) => state.appConfigs);
    const userState: UserState = yield select((state: RootState) => state.user);
    const userInfo = Helpers.getUserInfo(userState.id, userState.userInfos);

    if (userInfo.haveProfile) {
        yield put(setProfileImageUrl(`${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}${userState.id}?${(new Date()).getTime()}`));
    } else {
        yield put(setProfileImageUrl(Domains.defaultProfileImageUrl));
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

function* callExpireAccessToken() {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callExpireAccessToken`);

    yield put(setNotifications([]));
    yield put(exitChatRoom());
    yield put(setChatRooms([]));
    yield put(setChatDetailImageId(""));
    yield put(initUI());
}

function* callExpireRefreshToken() {
    if ('production' !== process.env.NODE_ENV)
        console.log(`saga - callExpireRefreshToken`);

    yield put(setNotifications([]));
    yield put(exitChatRoom());
    yield put(setChatRooms([]));
    yield put(setChatDetailImageId(""));
    yield put(initUI());
}

export function* user() {
    yield takeLatest(signIn, callSignIn);
    yield takeLatest(updateSignIn, callUpdateSignIn);
    yield takeLatest(signOut, callSignOut);
    yield takeLatest(expireAccessToken, callExpireAccessToken);
    yield takeLatest(expireRefreshToken, callExpireRefreshToken);
}
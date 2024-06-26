import {Domains} from "@/domains";
import {Errors} from "@/defines/errors";
import {Helpers} from "@/helpers";
import {
    addChatRooms,
    removeChatRooms,
    setChatRooms,
    setChatRoomUsers,
    addChatData,
    setChatDatas,
    exitChatRoom,
    enterChatRoom,
    ChatState, addChatRoomUser, removeChatRoomUser, openPreparedChatRoom
} from '@/stores/reducers/chat';
import {
    addConnectedUser,
    addFollow,
    addFollower,
    removeConnectedUser,
    removeFollow,
    removeFollower,
    setAuthState,
    setConnectedUsers,
    setFollowers,
    setFollows,
    setUserMessage,
    setUserId,
    setNickName,
    setHaveProfile,
    setLatestActive,
    updateUsersData,
    setProfileImageUrl,
    UserState,
    addOthers,
    setLatestActiveUsers,
    signOut,
    signIn,
    expireAccessToken, updateSignIn, expireRefreshToken, setUserInfos
} from '@/stores/reducers/user';
import {call, put, select} from "redux-saga/effects";
import {Defines} from "@/defines";
import {v4 as uuid} from "uuid";
import {push} from "connected-next-router";
import isEmpty from "lodash/isEmpty";
import {RootState} from "@/stores/reducers";
import {AppConfigsState, setServerVersion} from "@/stores/reducers/appConfigs";
import {
    addNotification,
    addNotifications,
    checkNotification,
    removeNotification
} from "@/stores/reducers/notification";
import profileImageSmallUrlPrefix = Domains.profileImageSmallUrlPrefix;
import {callCheckAuthenticationReq} from "@/sagas/socketPackets/chatRequest";

export function* checkConnectionRes(data: Uint8Array) {
    // if ('production' !== process.env.NODE_ENV)
    //     console.log(`packet - checkConnectionRes`);

    const response = Domains.CheckConnectionRes.decode(data);

    if (null == response) {
        alert('데이터 형식 오류.');
        return null;
    }

    yield put(setServerVersion([response.serverVersionMain, response.serverVersionUpdate, response.serverVersionMaintenance]));

    switch (response.result) {
        case Errors.CheckConnection.NONE:
            break;

        case Errors.CheckConnection.UPDATE_REQUIRED:
            break;
    }

    return response;
}

export function* checkAuthenticationRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - checkAuthenticationRes`);

    const response = Domains.CheckAuthenticationRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - checkAuthenticationRes: response is null.`);
        return null;
    }


    switch (response.result) {
        case Errors.CheckAuth.NONE:
            if (isEmpty(response.token)) {
                if ('production' !== process.env.NODE_ENV)
                    console.log(`packet - checkAuthenticationRes: token is empty.`);

                alert("인증 실패.");
                return;
            }

            try {
                if ('production' !== process.env.NODE_ENV)
                    console.log(`packet - checkAuthenticationRes: ${response.token}`);

                const checkedUser = Helpers.getUserFromToken(response.token);
                if (null == checkedUser) {
                    alert("인증 실패.");
                    return;
                }

                checkedUser.nickName = response.nickName;
                checkedUser.message = response.userMessage;
                checkedUser.haveProfile = response.haveProfile;
                checkedUser.latestActive = response.latestActive;

                yield put(updateSignIn({ accessToken: response.token, refreshToken: response.refreshToken, user: checkedUser }));

            } catch (error) {
                if ('production' !== process.env.NODE_ENV)
                    console.log(`packet - checkAuthenticationRes: failed to decode token.`);

                alert("인증 실패.");
                return;
            }
            break;

        case Errors.CheckAuth.NOT_VALID_TOKEN:
            alert('인증 실패.');
            yield put(setUserId(""));
            break;

        case Errors.CheckAuth.AUTH_EXPIRED:
            alert("사용자 인증이 만료되었습니다.");
            yield put(setUserId(""));
            break;

        case Errors.CheckAuth.ALREADY_SIGN_IN_USER:
            //yield put(setAuthState(Defines.AuthStateType.ALREADY_SIGN_IN));
            yield put(setUserId(""));
            alert('로그인 중인 계정입니다.');
            break;

        case Errors.CheckAuth.FAILED_TO_CREATE_USER:
            alert('임시유저 계정생성 실패.');
            break;

        case Errors.CheckAuth.FAILED_TO_ISSUE_TOKEN:
            alert('인증정보 생성 실패.');
            break;
    }

    return response;
}

export function* signInRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - signInRes`);

    const response = Domains.SignInRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - signInRes: response is null.`);
        return null;
    }

    switch (response.result) {
        case Errors.SignIn.USER_NAME_REQUIRED:
            alert("계정이름을 입력해 주세요.");
            break;

        case Errors.SignIn.PASSWORD_REQUIRED:
            alert("비밀번호를 입력해 주세요.");
            break;

        case Errors.SignIn.ALREADY_SIGN_IN:
            alert("이미 로그인 중입니다.");
            break;

        default:
            alert("로그인 실패.");
            break;
    }

    return response;
}

export function* signOutRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - signOutRes`);

    const response = Domains.SignOutRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - signOutRes: response is null.`);
        return null;
    }

    switch (response.result) {
        case Errors.SignOut.NONE:
            yield put(signOut());
            yield put(push("/"));
            break;

        case Errors.SignOut.AUTH_REQUIRED:
            alert("로그인 상태가 아닙니다.");
            break;

        case Errors.SignOut.FAILED_TO_SIGN_OUT:
            alert("로그아웃 실패.");
            break;
    }

    return response;
}

export function* demandRefreshTokenRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - demandRefreshTokenRes`);

    const response = Domains.DemandRefreshTokenRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - demandRefreshTokenRes: response is null.`);
        return null;
    }

    yield put(expireAccessToken(response.userId));
    yield call(callCheckAuthenticationReq);
}

export function* accessTokenExpiredRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - accessTokenExpiredRes`);

    const response = Domains.AccessTokenExpiredRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - accessTokenExpiredRes: response is null.`);
        return null;
    }

    alert("사용자 인증이 만료되었습니다.");
    yield put(expireAccessToken(response.userId));
}

export function* refreshTokenExpiredRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - refreshTokenExpiredRes`);

    const response = Domains.RefreshTokenExpiredRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - refreshTokenExpiredRes: response is null.`);
        return null;
    }

    alert("사용자 인증 갱신이 만료되었습니다.");
    yield put(expireRefreshToken(response.userId));
}

export function* notificationRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - notificationRes`);

    const response = Domains.NotificationRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - notificationRes: response is null.`);
        return null;
    }

    switch (response.notificationType) {
        case Defines.NotificationType.FOLLOWER:
            yield put(addNotification(new Domains.Notification(response.id, response.notificationType, response.sendAt, response.isCheck, "", response.targetId)));
            break;

        case Defines.NotificationType.START_CHAT:
            yield put(addNotification(new Domains.Notification(response.id, response.notificationType, response.sendAt, response.isCheck, "", response.targetId, response.url)));
            break;

        case Defines.NotificationType.ADD_USER_CHAT_ROOM:
            yield put(addNotification(new Domains.Notification(response.id, response.notificationType, response.sendAt, response.isCheck, "", response.targetId, response.url)));
            break;
    }

    return response;
}

export function* notificationsStartChatRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - notificationsStartChatRes`);

    const response = Domains.NotificationsStartChatRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - notificationsStartChatRes: response is null.`);
        return null;
    }

    yield put(addNotifications(response.notifications));

    return response;
}

export function* notificationsFollowerRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - notificationsFollowerRes`);

    const response = Domains.NotificationsFollowerRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - notificationsFollowerRes: response is null.`);
        return null;
    }

    yield put(addNotifications(response.notifications));

    return response;
}

export function* checkNotificationRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - checkNotificationRes`);

    const response = Domains.CheckNotificationRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - checkNotificationRes: response is null.`);
        return null;
    }

    switch (response.result) {
        case Errors.CheckNotification.NONE:
            yield put(checkNotification(response.id));
            break;

        default:
            try {
                console.log(Errors.CheckNotification[response.result]);
            } catch (error) {
                console.error(error);
            }
    }
    return response;
}

export function* removeNotificationRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - removeNotificationRes`);

    const response = Domains.RemoveNotificationRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - removeNotificationRes: response is null.`);
        return null;
    }

    switch (response.result) {
        case Errors.RemoveNotification.NONE:
            yield put(removeNotification(response.id));
            break;

        default:
            try {
                console.log(Errors.RemoveNotification[response.result]);
            } catch (error) {
                console.error(error);
            }
    }
    return response;
}

export function* latestActiveUsersRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - latestActiveUsersRes`);

    const response = Domains.LatestActiveUsersRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - latestActiveUsersRes: response is null.`);
        return null;
    }

    yield put(setLatestActiveUsers(response.users));
    return response;
}

export function* connectedUsersRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - connectedUsersRes`);

    const response = Domains.ConnectedUsersRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - connectedUsersRes: response is null.`);
        return null;
    }

    yield put(setConnectedUsers(response.users));
    return response;
}

export function* noticeConnectedUserRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - noticeConnectedUserRes`);

    const response = Domains.NoticeConnectedUserRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - noticeConnectedUserRes: response is null.`);
        return null;
    }

    if (null == response.user) {
        return null;
    }

    yield put(addConnectedUser(response.user));
    return response;
}

export function* noticeDisconnectedUserRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - noticeDisconnectedUserRes`);

    const response = Domains.NoticeDisconnectedUserRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - noticeDisconnectedUserRes: response is null.`);
        return null;
    }

    if (isEmpty(response.userId)) {
        return null;
    }

    yield put(removeConnectedUser(response.userId));
    return response;
}

export function* getTokenUserInfoRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - getTokenUserInfoRes`);

    const response = Domains.GetTokenUserInfoRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - getTokenUserInfoRes: response is null.`);
        return null;
    }

    switch (response.result) {
        case Errors.GetTokenUserInfo.NONE:
            try {
                const appConfigs: AppConfigsState = yield select((state: RootState) => state.appConfigs);
                const imagePath = `${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}`;
                const profileImage = response.haveProfile ? imagePath + `${response.userId}` : "";
                yield put(setNickName(response.nickName));
                yield put(setHaveProfile(response.haveProfile));
                yield put(setProfileImageUrl(profileImage));
            } catch (error) {
                if ('production' !== process.env.NODE_ENV)
                    console.log(`packet - getTokenUserInfoRes: failed to get token user info.`);
                return;
            }
            break;

        default:
            yield put(setUserId(""));
            break;
    }

    return response;
}

export function* getOthersUserInfoRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - getOthersUserInfoRes`);

    const response = Domains.GetOthersUserInfoRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - getOthersUserInfoRes: response is null.`);
        return null;
    }

    if (null == response.user) {
        return null;
    }

    const appConfigs: AppConfigsState = yield select((state: RootState) => state.appConfigs);
    const userState: UserState = yield select((state: RootState) => state.user);
    const imagePath = `${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}`;
    const profileImage = response.user.haveProfile ? imagePath + `${response.user.userId}` : "";
    response.user.updateProfile(profileImage);
    yield put(addOthers(response.user));
    return response;
}

export function* followsRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - followsRes`);

    const response = Domains.FollowsRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - followsRes: response is null.`);
        return null;
    }

    if (0 < response.users.length) {
        const appConfigs: AppConfigsState = yield select((state: RootState) => state.appConfigs);
        const imagePath = `${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}`;

        for (let i = 0; i < response.users.length; i++) {
            const profileImage = response.users[i].haveProfile ? imagePath + `${response.users[i].userId}` : "";
            response.users[i].updateProfile(profileImage);
        }
    }

    yield put(setFollows(response.users));
    return response;
}

export function* followersRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - followersRes`);

    const response = Domains.FollowersRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - followersRes: response is null.`);
        return null;
    }

    if (0 < response.users.length) {
        const appConfigs: AppConfigsState = yield select((state: RootState) => state.appConfigs);
        const imagePath = `${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}`;

        for (let i = 0; i < response.users.length; i++) {
            const profileImage = response.users[i].haveProfile ? imagePath + `${response.users[i].userId}` : "";
            response.users[i].updateProfile(profileImage);
        }
    }

    yield put(setFollowers(response.users));
    return response;
}

export function* chatRoomsRes(data: Uint8Array) {
    const response = Domains.ChatRoomsRes.decode(data);

    if (response && 0 < response.roomIds.length) {
        const list: Domains.ChatRoom[] = [];
        for (let i = 0; i < response.roomIds.length; i++)
            list.push(new Domains.ChatRoom(response.roomIds[i], response.roomNames[i], response.roomOpenTypes[i], [], []));

        yield put(setChatRooms(list));
    }
    return response;
}

export function* followRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - followRes`);

    const response = Domains.FollowRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - followRes: response is null.`);
        return null;
    }
    
    switch (response.result) {
        case Errors.Follow.NONE:
            if (null != response.user) {
                const appConfigs: AppConfigsState = yield select((state: RootState) => state.appConfigs);
                const imagePath = `${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}`;
                const profileImage = response.user.haveProfile ? imagePath + `${response.user.userId}` : "";
                response.user.updateProfile(profileImage);
                yield put(addFollow(response.user));
            }
            break;

        case Errors.Follow.AUTH_REQUIRED:
            alert('로그인 후 이용해 주세요.');
            break;

        case Errors.Follow.NOT_FOUND_USER:
            alert('사용자를 찾을 수 없습니다.');
            break;

        case Errors.Follow.CAN_NOT_FOLLOW_SELF:
            alert('자신은 팔로우 할 수 없습니다.');
            break;

        case Errors.Follow.ALREADY_FOLLOWED:
            alert('팔로우 중인 사용자 입니다.');
            break;

        case Errors.Follow.FAILED_TO_FOLLOW:
            alert('팔로우하지 못했습니다.');
            break;
    }

    return response;
}

export function* unfollowRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - unfollowRes`);

    const response = Domains.UnfollowRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - unfollowRes: response is null.`);
        return null;
    }

    switch (response.result) {
        case Errors.Unfollow.NONE:
            if (!isEmpty(response.userId))
                yield put(removeFollow(response.userId));
            break;

        case Errors.Unfollow.AUTH_REQUIRED:
            alert('로그인 후 이용해 주세요.');
            break;

        case Errors.Unfollow.NOT_FOUND_USER:
            alert('사용자를 찾을 수 없습니다.');
            break;

        case Errors.Unfollow.CAN_NOT_UNFOLLOW_SELF:
            alert('자신은 팔로우 할 수 없습니다.');
            break;

        case Errors.Unfollow.NOT_FOUND_FOLLOWED:
            alert('팔로우 중인 사용자가 아닙니다.');
            break;

        case Errors.Unfollow.FAILED_TO_UNFOLLOW:
            alert('언팔로우하지 못했습니다.');
            break;
    }

    return response;
}

export function* followerRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - followerRes`);

    const response = Domains.FollowerRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - followerRes: response is null.`);
        return null;
    }

    if (null != response.user) {
        const appConfigs: AppConfigsState = yield select((state: RootState) => state.appConfigs);
        const imagePath = `${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}`;
        const profileImage = response.user.haveProfile ? imagePath + `${response.user.userId}` : "";
        response.user.updateProfile(profileImage);
        yield put(addFollower(response.user));
    }

    return response;
}

export function* unfollowerRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - unfollowerRes`);

    const response = Domains.UnfollowerRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - unfollowerRes: response is null.`);
        return null;
    }

    if (!isEmpty(response.userId))
        yield put(removeFollower(response.userId));

    return response;
}

export function* startChatRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - startChatRes`);

    const response = Domains.StartChatRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - startChatRes: response is null.`);
        return null;
    }

    switch (response.result) {
        case Errors.StartChat.NONE:
            yield put(addChatRooms([new Domains.ChatRoom(response.roomId, response.roomName, response.roomOpenType, [], [])]));
            yield put(enterChatRoom(response.roomId));
            yield put(push(`/chat/${Helpers.getBase62FromUUID(response.roomId)}`));

            break;

        case Errors.StartChat.AUTH_REQUIRED:
            alert('로그인 후 이용해 주세요.');
            break;

        case Errors.StartChat.NOT_FOUND_TARGET_USER:
            alert('없는 사용자 입니다.');
            break;
    }

    return response;
}

export function* openPreparedChatRoomRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - openPreparedChatRoomRes`);

    const response = Domains.OpenPreparedChatRoomRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - openPreparedChatRoomRes: response is null.`);
        return null;
    }

    yield put(openPreparedChatRoom(response.roomId));

    return response;
}

export function* noticeNickNameChangedRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - noticeNickNameChangedRes`);

    const response = Domains.NoticeNickNameChangedRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - noticeNickNameChangedRes: response is null.`);
        return null;
    }

    yield put(updateUsersData({ dataType: "nickName", userId: response.userId, userData: response.nickName }));
    return response;
}

export function* noticeUserMessageChangedRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - noticeUserMessageChangedRes`);

    const response = Domains.NoticeUserMessageChangedRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - noticeUserMessageChangedRes: response is null.`);
        return null;
    }

    yield put(updateUsersData({ dataType: "message", userId: response.userId, userData: response.userMessage }));
    return response;
}

export function* changeUserProfileRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - changeUserProfileRes`);

    const response = Domains.ChangeUserProfileRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - changeUserProfileRes: response is null.`);
        return null;
    }

    switch (response.result) {
        case Errors.ChangeUserProfile.NONE:
            const appConfigs: AppConfigsState = yield select((state: RootState) => state.appConfigs);
            const userState: UserState = yield select((state: RootState) => state.user);
            yield put(setProfileImageUrl(`${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}${userState.id}`));
            break;

        default:
            alert("프로필 변경 실패!");
            break;
    }
    return response;
}

export function* noticeUserProfileChangedRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - noticeUserProfileChangedRes`);

    const response = Domains.NoticeUserProfileChangedRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - noticeUserProfileChangedRes: response is null.`);
        return null;
    }

    const appConfigs: AppConfigsState = yield select((state: RootState) => state.appConfigs);
    const imagePath = `${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}${response.userId}`;
    yield put(updateUsersData({ dataType: "profile", userId: response.userId, userData: imagePath }));
    return response;
}

export function* removeUserProfileRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - removeUserProfileRes`);

    const response = Domains.RemoveUserProfileRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - removeUserProfileRes: response is null.`);
        return null;
    }

    switch (response.result) {
        case Errors.RemoveUserProfile.NONE:
            yield put(setProfileImageUrl(''));
            break;

        default:
            alert("프로필 변경 실패!");
            break;
    }
    return response;
}

export function* noticeUserProfileRemovedRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - noticeUserProfileRemovedRes`);

    const response = Domains.NoticeUserProfileRemovedRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - noticeUserProfileRemovedRes: response is null.`);
        return null;
    }

    yield put(updateUsersData({ dataType: "profile", userId: response.userId, userData: "" }));
    return response;
}

export function* createChatRoomRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - createChatRoom`);

    const response = Domains.CreateChatRoomRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - createChatRoom: response is null.`);
        return null;
    }

    switch (response.result) {
        case Errors.CreateChatRoom.NONE:
            yield put(enterChatRoom(response.roomId));
            yield put(push(`/chat/${Helpers.getBase62FromUUID(response.roomId)}`));

            break;

        case Errors.CreateChatRoom.NOT_ALLOWED_OPEN_TYPE:
            alert('채팅방 공개 범위가 잘못 설정되었습니다.');
            break;

        case Errors.CreateChatRoom.EXISTS_ROOM:
            alert('이미 개설된 채팅방 이름입니다.');
            break;
    }

    return response;
}

export function* addChatRoomRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - addChatRoomRes`);

    const response = Domains.AddChatRoomRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - addChatRoomRes: response is null.`);
        return null;
    }

    if (isEmpty(response.roomId)) {
        return null;
    }

    if (isEmpty(response.roomName)) {
        return null;
    }

    const chatState: ChatState = yield select((state: RootState) => state.chat);
    const existsRoom = chatState.chatRooms.find(_ => _.roomId == response.roomId);

    if ('undefined' != typeof existsRoom && null != existsRoom)
        return response;

    yield put(addChatRooms([new Domains.ChatRoom(response.roomId, response.roomName, response.roomOpenType, [], [])]));

    return response;
}

export function* removeChatRoomRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - removeChatRoomRes`);

    const response = Domains.RemoveChatRoomRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - removeChatRoomRes: response is null.`);
        return null;
    }

    if (isEmpty(response.roomId))
        return response;

    const chatState: ChatState = yield select((state: RootState) => state.chat);
    const existsRoom = chatState.chatRooms.find(_ => _.roomId == response.roomId);

    if (null == existsRoom || 'undefined' == typeof existsRoom)
        return response;

    yield put(removeChatRooms([response.roomId]));

    return response;
}

export function* updateChatRoomRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - updateChatRoomRes`);

    const response = Domains.UpdateChatRoomRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - updateChatRoomRes: response is null.`);
        return null;
    }

    yield put(setChatRoomUsers({roomId: response?.roomId ?? '', chatRoomUsers: []}));
    if (0 < response.userIds.length) {
        const list: Domains.User[] = [];
        for (let i = 0; i < response.userIds.length; i++)
            list.push(new Domains.User(response.userIds[i], Defines.AccountType.NONE, "", "", false, 0));

        yield put(setChatRoomUsers({roomId: response?.roomId ?? '', chatRoomUsers: list}));
    }
    return response;
}

export function* noticeAddChatRoomUserRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - noticeAddChatRoomUserRes`);

    const response = Domains.NoticeAddChatRoomUserRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - noticeAddChatRoomUserRes: response is null.`);
        return null;
    }

    if (isEmpty(response.roomId) || isEmpty(response.userId))
        return;

    yield put(addChatRoomUser({ roomId: response.roomId, chatRoomUser: new Domains.User(response.userId, Defines.AccountType.NONE, "", "", false, 0, false) }));
    return response;
}

export function* noticeRemoveChatRoomUserRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - noticeRemoveChatRoomUserRes`);

    const response = Domains.NoticeRemoveChatRoomUserRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - noticeRemoveChatRoomUserRes: response is null.`);
        return null;
    }

    if (isEmpty(response.roomId) || isEmpty(response.userId))
        return;

    yield put(removeChatRoomUser({ roomId: response.roomId, chatRoomUser: new Domains.User(response.userId, Defines.AccountType.NONE, "", "", false, 0, false) }));
    return response;
}

export function* enterChatRoomRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - enterChatRoomRes`);

    const response = Domains.EnterChatRoomRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - enterChatRoomRes: response is null.`);
        return null;
    }

    switch (response.result) {
        case Errors.EnterChatRoom.NONE:
            yield put(enterChatRoom(response.roomId));
            yield put(push(`/chat/${Helpers.getBase62FromUUID(response.roomId)}`));
            break;

        case Errors.EnterChatRoom.AUTH_REQUIRED:
            alert('로그인 후 이용해 주세요.');
            break;

        case Errors.EnterChatRoom.NO_EXISTS_ROOM:
            alert('채팅방이 없습니다.');
            yield put(removeChatRooms([response.roomId]));
            break;

        case Errors.EnterChatRoom.NOT_AVAILABLE_ROOM:
            alert('채팅방이 없습니다.');
            yield put(removeChatRooms([response.roomId]));
            break;

        case Errors.EnterChatRoom.ALREADY_IN_ROOM:
            alert('이미 입장한 채팅방 입니다.');
            break;
    }

    return response;
}

export function* exitChatRoomRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - exitChatRoomRes`);

    const response = Domains.ExitChatRoomRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - exitChatRoomRes: response is null.`);
        return null;
    }

    switch (response.result) {
        case Errors.ExitChatRoom.NONE:
            break;

        case Errors.ExitChatRoom.ROOM_REMOVED:
            alert('삭제된 채팅방입니다.');
            break;

        case Errors.ExitChatRoom.NO_EXISTS_ROOM:
            alert('그 채팅방은 없습니다.');
            break;

        case Errors.ExitChatRoom.NOT_IN_ROOM:
            alert('현재 그 채팅방에 입장중이 아닙니다.');
            break;

        case Errors.ExitChatRoom.FAILED_TO_EXIT:
            alert('채팅방 나가기 실패.');
            break;
    }

    yield put(exitChatRoom());
    yield put(push('/rooms'));

    return response;
}

export function* noticeEnterChatRoomRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - noticeEnterChatRoomRes`);

    const response = Domains.NoticeEnterChatRoomRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - noticeEnterChatRoomRes: response is null.`);
        return null;
    }

    const enterNotice = new Domains.Chat(Defines.ChatType.NOTICE, response?.roomId ?? '', uuid(), uuid(), new Date().getTime(), `'${response?.nickName}'님이 입장했습니다.`);
    yield put(addChatData({roomId: response?.roomId ?? '', chatData: enterNotice}));
    return response;
}

export function* noticeExitChatRoomRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - noticeExitChatRoomRes`);

    const response = Domains.NoticeExitChatRoomRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - noticeExitChatRoomRes: response is null.`);
        return null;
    }

    const exitNotice = new Domains.Chat(Defines.ChatType.NOTICE, response?.roomId ?? '', uuid(), uuid(), new Date().getTime(), `'${response?.nickName}'님이 퇴장했습니다.`);
    yield put(addChatData({roomId: response?.roomId ?? '', chatData: exitNotice}));
    return response;
}

export function* noticeChangeNameChatRoomRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - noticeChangeNameChatRoomRes`);

    const response = Domains.NoticeChangeNickNameChatRoomRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - noticeChangeNameChatRoomRes: response is null.`);
        return null;
    }

    const changeNameNotice = new Domains.Chat(Defines.ChatType.NOTICE, response?.roomId ?? '', uuid(), uuid(), new Date().getTime(), `'${response?.oldNickName}'님이 '${response?.newNickName}'으로 대화명을 변경했습니다.`);
    yield put(addChatData({roomId: response?.roomId ?? '', chatData: changeNameNotice}));
    return response;
}

export function* talkChatRoomRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - talkChatRoomRes`);

    const response = Domains.TalkChatRoomRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - talkChatRoomRes: response is null.`);
        return null;
    }

    yield put(addChatData({roomId: response.roomId ?? '', chatData: response.getChatData()}));
    return response;
}

export function* historyChatRoomRes(data: Uint8Array) {
    if ('production' !== process.env.NODE_ENV)
        console.log(`packet - historyChatRoomRes`);

    const response = Domains.HistoryChatRoomRes.decode(data);

    if (null == response) {
        if ('production' !== process.env.NODE_ENV)
            console.log(`packet - historyChatRoomRes: response is null.`);
        return null;
    }

    yield put(setChatDatas({ roomId: response.roomId ?? '', chatDatas: response.getChatHistories()}));
    return response;
}
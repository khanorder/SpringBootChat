import {useCallback, useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {Domains} from "@/domains";
import {getUserInfoReq} from "@/stores/reducers/webSocket";
import defaultProfileImageUrl = Domains.defaultProfileImageUrl;

export default function useGetUserInfo() {
    const user = useAppSelector(state => state.user);
    const dispatch = useAppDispatch();

    const getUserInfo = useCallback((userId: string): Domains.User => {
        let userInfo = user.others.find(_ => _.userId == userId);
        if (!userInfo) {
            userInfo = new Domains.User(userId, "알 수 없음", "", false, (new Date()).getTime(), false);
            userInfo.profileImageUrl = defaultProfileImageUrl;
            dispatch(getUserInfoReq(userId));
        }
        return userInfo;
    }, [user, dispatch]);

    return [getUserInfo];
}
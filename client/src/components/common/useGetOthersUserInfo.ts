import {useCallback, useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {Domains} from "@/domains";
import {getOthersUserInfoReq} from "@/stores/reducers/webSocket";
import defaultProfileImageUrl = Domains.defaultProfileImageUrl;
import {Defines} from "@/defines";

export default function useGetOthersUserInfo() {
    const user = useAppSelector(state => state.user);
    const dispatch = useAppDispatch();

    const getOthersUserInfo = useCallback((userId: string): Domains.User => {
        let userInfo = user.others.find(_ => _.userId == userId);
        if (!userInfo) {
            userInfo = new Domains.User(userId, Defines.AccountType.TEMP, "알 수 없음", "", false, (new Date()).getTime(), false);
            userInfo.profileImageUrl = defaultProfileImageUrl;
            dispatch(getOthersUserInfoReq(userId));
        }
        return userInfo;
    }, [user, dispatch]);

    return [getOthersUserInfo];
}
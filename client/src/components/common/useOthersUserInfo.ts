import {useCallback} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {Domains} from "@/domains";
import {getOthersUserInfoReq} from "@/stores/reducers/webSocket";
import {Defines} from "@/defines";
import useCurrentUser from "@/components/common/useCurrentUser";

export default function useOthersUserInfo() {
    const user = useAppSelector(state => state.user);
    const dispatch = useAppDispatch();
    const [currentUser] = useCurrentUser();

    const getOthersUserInfo = useCallback((userId: string): Domains.User => {
        if (userId === currentUser.userId)
            return new Domains.User(currentUser.userId, currentUser.accountType, currentUser.userName, currentUser.message, currentUser.haveProfile, currentUser.latestActiveAt, true);

        let userInfo = user.others.find(_ => _.userId == userId);
        if (!userInfo) {
            userInfo = new Domains.User(userId, Defines.AccountType.TEMP, "알 수 없음", "", false, (new Date()).getTime(), false);
            userInfo.profileImageUrl = Domains.defaultProfileImageUrl;
            dispatch(getOthersUserInfoReq(userId));
        }
        return userInfo;
    }, [user, currentUser, dispatch]);

    return [getOthersUserInfo];
}
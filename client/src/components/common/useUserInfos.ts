import {useCallback} from "react";
import {useAppSelector} from "@/hooks";
import {Helpers} from "@/helpers";
import {Domains} from "@/domains";

export default function useUserInfos() {
    const user = useAppSelector(state => state.user);

    const userInfos = useCallback((): Map<string, Domains.UserInfo> => {
        return Helpers.objectToMap(user.userInfos);
    }, [user]);

    return [userInfos()];
}
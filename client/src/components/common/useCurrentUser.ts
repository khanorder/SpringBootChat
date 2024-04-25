import {useCallback} from "react";
import {useAppSelector} from "@/hooks";
import {Helpers} from "@/helpers";
import {Domains} from "@/domains";

export default function useCurrentUser() {
    const user = useAppSelector(state => state.user);

    const currentUser = useCallback((): Domains.UserInfo => {
        return Helpers.getUserInfo(user.id, user.userInfos);
    }, [user]);

    return [currentUser()];
}
import styles from "@/styles/chatUserProfile.module.sass";
import {useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import Image from "next/image";
import UserIcon from "public/images/user-circle.svg";
import {Domains} from "@/domains";
import stylesMyProfile from "@/styles/chatMyProfile.module.sass";

export default function ChatMyProfile() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const user = useAppSelector(state => state.user);
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
        }

    }, [firstRender]);
    //#endregion

    return (
        <div className={stylesMyProfile.myProfileWrapper}>
            <div className={stylesMyProfile.userThumb}>
                {
                    user.haveProfile
                        ?
                        <img className={stylesMyProfile.userThumbImage}
                             src={`${appConfigs.serverProtocol}://${appConfigs.serverHost}/api/profileThumb/${user.id}`}
                             alt='사용자 프로필'/>
                        :
                        <Image className={stylesMyProfile.userThumbIcon} src={UserIcon} alt='사용자 프로필' fill={true}
                               priority={true}/>
                }
            </div>
            <div className={stylesMyProfile.userInfo}>
                <div className={stylesMyProfile.userName}>{user.name}</div>
                <div className={stylesMyProfile.userMessage}>{user.message}</div>
            </div>
        </div>
    )
}
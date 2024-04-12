import styles from "@/styles/chatUserProfile.module.sass";
import {useCallback, useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import Image from "next/image";
import UserIcon from "public/images/user-circle.svg";
import {Domains} from "@/domains";

export interface ChatUserProfileProps {
    userData: Domains.User;
}

export default function ChatUserProfile({ userData }: ChatUserProfileProps) {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
        }

    }, [firstRender]);
    //#endregion

    return (
        <div className={styles.userProfileWrapper}>

            <div className={styles.userThumbWrapper}>
                <div className={styles.userThumb}>
                    {
                        userData.haveProfile
                            ?
                            <img className={styles.userThumbImage}
                                 src={`${appConfigs.serverProtocol}://${appConfigs.serverHost}/api/profileThumb/${userData.userId}`}
                                 alt='사용자 프로필'/>
                            :
                            <Image className={styles.userThumbIcon} src={UserIcon} alt='사용자 프로필' fill={true}
                                   priority={true}/>
                    }
                </div>
                {
                    userData.online
                        ?
                        <div className={styles.online}></div>
                        :
                        <></>
                }
            </div>
            <div className={styles.userInfo}>
                <div className={styles.userName}>{userData.userName}</div>
                <div className={styles.userMessage}>{userData.message}</div>
            </div>
            <div className={styles.online}>
            </div>
        </div>
    )
}
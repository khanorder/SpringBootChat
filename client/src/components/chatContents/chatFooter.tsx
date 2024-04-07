import {useCallback, useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import isEmpty from "lodash/isEmpty";
import {exitChatRoomReq} from "@/stores/reducers/webSocket";
import styles from "@/styles/chatFooter.module.sass";
import Image from "next/image";
import PersonIcon from "public/images/person.svg";
import ChatIcon from "public/images/chat.svg";
import {CommonAPI} from "@/apis/commonAPI";
import {setActiveTab, toggleIsActiveGNB} from "@/stores/reducers/dialog";
import {Defines} from "@/defines";

export default function ChatFooter() {
    const firstRender = useRef(true);
    const dialog = useAppSelector(state => state.dialog);
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const changeTab = useCallback((tab: Defines.ActiveTab) => {
        dispatch(setActiveTab(tab));
    }, [dispatch]);

    return (
        <div className={styles.chatFooterWrapper}>
            <div className={styles.buttonWrapperEmpty}></div>
            <div className={`${styles.buttonWrapper} ${styles.buttonFriendWrapper}${Defines.ActiveTab.Friend == dialog.activeTab ? ` ${styles.activeTab}` : ''}`}>
                <button className={`${styles.button} ${styles.buttonFriend}`} onClick={e => changeTab(Defines.ActiveTab.Friend)}>
                    <Image className={styles.buttonIcon} src={PersonIcon} alt='친구' width={38} height={38} />
                    <span className={styles.buttonLabel}>친구</span>
                </button>
            </div>
            <div className={`${styles.buttonWrapper} ${styles.buttonChatWrapper}${Defines.ActiveTab.Chat == dialog.activeTab ? ` ${styles.activeTab}` : ''}`}>
                <button className={`${styles.button} ${styles.buttonChat}`} onClick={e => changeTab(Defines.ActiveTab.Chat)}>
                    <Image className={styles.buttonIcon} src={ChatIcon} alt='채팅' width={38} height={38}/>
                    <span className={styles.buttonLabel}>채팅</span>
                </button>
            </div>
            <div className={styles.buttonWrapperEmpty}></div>
        </div>
    );
}
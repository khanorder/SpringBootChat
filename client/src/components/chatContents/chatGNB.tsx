import {useCallback, useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {connectedUsersReq} from "@/stores/reducers/webSocket";
import styles from "@/styles/chatGNB.module.sass";
import Image from "next/image";
import PersonIcon from "public/images/person.svg";
import ChatIcon from "public/images/chat.svg";
import SearchIcon from "public/images/search.svg";
import {setActiveTab} from "@/stores/reducers/ui";
import {Defines} from "@/defines";

export default function ChatGNB() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const ui = useAppSelector(state => state.ui);
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const onChangeTab = useCallback((tab: Defines.TabType) => {
        switch (tab) {
            case Defines.TabType.SEARCH:
                dispatch(connectedUsersReq());
                break;
        }
        dispatch(setActiveTab(tab));
    }, [dispatch]);

    const gnbTabButton = useCallback((tab: Defines.TabType) => {
        let tabName: string = " ";
        let tabIcon: string = PersonIcon;
        let wrapperClass: string = styles.buttonWrapper + (tab == ui.activeTab ? ` ${styles.activeTab}` : "");

        switch (tab) {
            case Defines.TabType.FOLLOW:
                tabName = "친구";
                tabIcon = PersonIcon;
                break;

            case Defines.TabType.CHAT:
                tabName = "채팅";
                tabIcon = ChatIcon;
                break;

            case Defines.TabType.SEARCH:
                tabName = "검색";
                tabIcon = SearchIcon;
                break;
        }
        return (
            <div className={wrapperClass}>
                <button className={`${styles.button}`} onClick={e => onChangeTab(tab)}>
                    <Image className={styles.buttonIcon} src={tabIcon} alt={tabName} width={38} height={38}/>
                    <span className={styles.buttonLabel}>{tabName}</span>
                </button>
            </div>
        );
    }, [ui, onChangeTab]);

    return (
        <div className={`${styles.chatGNBWrapper}${appConfigs.isProd ? '' : ` ${styles.dev}`}`}>
            <div className={styles.buttonWrapperEmpty}></div>
            {gnbTabButton(Defines.TabType.FOLLOW)}
            {gnbTabButton(Defines.TabType.CHAT)}
            <div className={styles.buttonWrapperEmpty}></div>
        </div>
    );
}
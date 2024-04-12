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
import {useRouter} from "next/router";

export default function ChatGNB() {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const ui = useAppSelector(state => state.ui);
    const router = useRouter();
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const onChangeTab = useCallback((tab: Defines.TabType) => {
        switch (tab) {
            case Defines.TabType.FOLLOW:
                router.push("/");
                break;

            case Defines.TabType.CHAT:
                router.push("/rooms")
                break;
        }
    }, [router]);

    const gnbTabButton = useCallback((tab: Defines.TabType) => {
        let tabName: string = " ";
        let tabIcon: string = PersonIcon;
        let wrapperClass: string = styles.buttonWrapper;

        switch (tab) {
            case Defines.TabType.FOLLOW:
                tabName = "친구";
                tabIcon = PersonIcon;
                wrapperClass += "/" == router.pathname ? ` ${styles.activeTab}` : '';
                break;

            case Defines.TabType.CHAT:
                tabName = "채팅";
                tabIcon = ChatIcon;
                wrapperClass += "/rooms" == router.pathname ? ` ${styles.activeTab}` : '';
                break;

            case Defines.TabType.SEARCH:
                tabName = "검색";
                tabIcon = SearchIcon;
                wrapperClass += "/search" == router.pathname ? ` ${styles.activeTab}` : '';
                break;
        }
        return (
            <div className={wrapperClass}>
                <button className={`${styles.button}`} onClick={e => onChangeTab(tab)}>
                    <Image className={styles.buttonIcon} src={tabIcon} alt={tabName} width={28} height={28}/>
                    <span className={styles.buttonLabel}>{tabName}</span>
                </button>
            </div>
        );
    }, [ui, onChangeTab, router]);

    return (
        <div className={`${styles.chatGNBWrapper}${appConfigs.isProd ? '' : ` ${styles.dev}`}`}>
            <div className={styles.buttonWrapperEmpty}></div>
            {gnbTabButton(Defines.TabType.FOLLOW)}
            {gnbTabButton(Defines.TabType.CHAT)}
            <div className={styles.buttonWrapperEmpty}></div>
        </div>
    );
}
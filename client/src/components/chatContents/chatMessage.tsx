import styles from "@/styles/chatMessage.module.sass";
import {dayjs} from "@/helpers/localizedDayjs";
import {Defines} from "@/defines";
import {useCallback, useEffect, useRef} from "react";
import {Domains} from "@/domains";
import dynamic from "next/dynamic";
import {useAppDispatch, useAppSelector} from "@/hooks";
import isEmpty from "lodash/isEmpty";
import {setIsActiveChatImageDetail} from "@/stores/reducers/ui";
import {setChatDetailImageId} from "@/stores/reducers/chat";
import useOthersUserInfo from "@/components/common/useOthersUserInfo";
import chatImageSmallUrlPrefix = Domains.chatImageSmallUrlPrefix;
const NL2BR = dynamic(() => import("@/components/common/NL2BR"), { ssr: false });

export interface ChatMessageProps {
    data: Domains.Chat;
}

export default function ChatMessage({data}: ChatMessageProps) {
    const firstRender = useRef(true);
    const appConfigs = useAppSelector(state => state.appConfigs);
    const user = useAppSelector(state => state.user);
    const dispatch = useAppDispatch();
    const [getOthersUserInfo] = useOthersUserInfo();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const openChatImageDetailDialog = useCallback((chatId: string) => {
        if (isEmpty(chatId))
            return;

        dispatch(setChatDetailImageId(chatId));
        dispatch(setIsActiveChatImageDetail(true));
    }, [dispatch]);

    const userProfile = useCallback(() => {
        const isMine = user.id == data.userId;
        if (isMine)
            return;

        const userInfo = getOthersUserInfo(data.userId);

        return (
            <div className={styles.chatUserProfileWrapper}>
                <img className={styles.chatUserProfile} src={userInfo.profileImageUrl} title={userInfo.nickName} alt={userInfo.nickName} />
            </div>
        );
    }, [getOthersUserInfo, user, data]);

    const nickName = useCallback(() => {
        const isMine = user.id == data.userId;
        if (isMine)
            return;

        const userInfo = getOthersUserInfo(data.userId);

        return <div className={styles.chatNickName}>{userInfo.nickName}</div>;
    }, [getOthersUserInfo, user, data]);

    const chatElement = useCallback(() => {
        const isMine = user.id == data.userId;
        let chatContentsClass = styles.chatContents + (isMine ? ` ${styles.mine}` : '');
        let chatMessageClass = styles.chatMessage + (isMine ? ` ${styles.mine}` : '');
        
        switch (data.type) {
            case Defines.ChatType.NOTICE:
                return (
                    <li className={styles.chatNotice}>{data.message}</li>
                );

            case Defines.ChatType.TALK:
                return (
                    <li className={chatContentsClass}>
                        {userProfile()}
                        <div className={styles.chatWrapper}>
                            {nickName()}
                            <div className={chatMessageClass}>
                                <NL2BR text={data.message} />
                            </div>
                            <div className={styles.chatTime}>{dayjs(data.time).fromNow(true)}</div>
                        </div>
                    </li>
                );

            case Defines.ChatType.IMAGE:
                chatContentsClass += ' ' + styles.chatContentsImage;
                chatMessageClass += ' ' + styles.chatMessageImage;
                return (
                    <li className={chatContentsClass}>
                        {userProfile()}
                        <div className={styles.chatWrapper}>
                            {nickName()}
                            <div className={chatMessageClass}>
                                <img className={styles.chatImage}
                                     src={`${appConfigs.serverProtocol}://${appConfigs.serverHost}${chatImageSmallUrlPrefix}${data.id}`}
                                     alt={data.id + ' 이미지'}
                                     onClick={e => openChatImageDetailDialog(data.id)}/>
                            </div>
                            <div className={styles.chatTime}>{dayjs(data.time).fromNow(true)}</div>
                        </div>
                    </li>
                );
        }
    }, [user, data, userProfile, nickName, appConfigs, openChatImageDetailDialog]);

    return chatElement();
}
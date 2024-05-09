import styles from "@/styles/chatMessage.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import {dayjs} from "@/helpers/localizedDayjs";
import {Defines} from "@/defines";
import {useCallback, useEffect, useRef} from "react";
import {Domains} from "@/domains";
import dynamic from "next/dynamic";
import {useAppDispatch, useAppSelector} from "@/hooks";
import isEmpty from "lodash/isEmpty";
import {setIsActiveChatDetail, setIsActiveChatImageDetail} from "@/stores/reducers/ui";
import {setChatDetail, setChatDetailImageId} from "@/stores/reducers/ui";
import useOthersUserInfo from "@/components/common/useOthersUserInfo";
import chatImageSmallUrlPrefix = Domains.chatImageSmallUrlPrefix;
import profileImageSmallUrlPrefix = Domains.profileImageSmallUrlPrefix;
import Image from "next/image";
const NL2BR = dynamic(() => import("@/components/common/NL2BR"), { ssr: false });

export interface ChatMessageProps {
    data: Domains.Chat;
    isContinually: boolean;
    isContinuallyLast: boolean;
}

export default function ChatMessage({data, isContinually, isContinuallyLast}: ChatMessageProps) {
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

    const openChatImageDetailDialog = useCallback(() => {
        if (isEmpty(data.id))
            return;

        dispatch(setChatDetailImageId(data.id));
        dispatch(setIsActiveChatImageDetail(true));
    }, [dispatch, data]);

    const userProfile = useCallback(() => {
        const isMine = user.id == data.userId;
        if (isMine)
            return;

        const userInfo = getOthersUserInfo(data.userId);

        return (
            <div className={styles.chatUserProfileWrapper}>
                {
                    isContinually
                        ?
                            <></>
                        :
                            <Image className={styles.chatUserProfile}
                                   src={`${appConfigs.serverProtocol}://${appConfigs.serverHost}${profileImageSmallUrlPrefix}${userInfo.userId}`}
                                   title={userInfo.nickName}
                                   alt={userInfo.nickName}
                                   width={40}
                                   height={40}/>
                }
            </div>
        );
    }, [appConfigs, getOthersUserInfo, user, data, isContinually]);

    const nickName = useCallback(() => {
        const isMine = user.id == data.userId;
        if (isMine)
            return;

        const userInfo = getOthersUserInfo(data.userId);

        return (
            isContinually
                ?
                    <></>
                :
                    <div className={styles.chatNickName}>{userInfo.nickName}</div>
        );
    }, [getOthersUserInfo, user, data, isContinually]);

    const chatTime = useCallback((time: number) => {
        return (
            isContinuallyLast
                ?
                <div className={styles.chatTime}>{dayjs(time).format("A hh:mm")}</div>
                :
                <></>
        );
    }, [isContinuallyLast]);

    const onShowDetail = useCallback(() => {
        dispatch(setIsActiveChatDetail(true));
        dispatch(setChatDetail(data));
    }, [data, dispatch]);

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
                let message = data.message;
                if (data.message.length > 300)
                    message = data.message.substring(0, 300) + "\n... ...";

                if (data.message.split(/\n/).length > 10) {
                    const subLineMessage = data.message.split(/\n/).slice(0, 10).join("\n");
                    if (message.length > subLineMessage.length)
                        message = subLineMessage + "\n... ...";
                }

                return (
                    <li className={chatContentsClass}>
                        {userProfile()}
                        <div className={styles.chatWrapper}>
                            {nickName()}
                            <div className={chatMessageClass}>
                                <NL2BR text={message} />
                                {
                                    data.message.length > message.length
                                        ?
                                            <button className={`${stylesCommon.button} ${styles.buttonMore}`} onClick={onShowDetail}>더보기</button>
                                        :
                                            <></>
                                }
                            </div>
                            {chatTime(data.time)}
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
                                <Image className={styles.chatImage}
                                     src={`${appConfigs.serverProtocol}://${appConfigs.serverHost}${chatImageSmallUrlPrefix}${data.id}`}
                                     title={data.id + ' 이미지'}
                                     alt={data.id + ' 이미지'}
                                     onClick={openChatImageDetailDialog} width={150} height={150} />
                            </div>
                            {chatTime(data.time)}
                        </div>
                    </li>
                );
        }
    }, [user, data, userProfile, nickName, chatTime, appConfigs, openChatImageDetailDialog, isContinually]);

    return chatElement();
}
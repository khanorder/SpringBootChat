import {useCallback, useEffect, useRef} from "react";
import styles from "@/styles/chatDialogChatDetail.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import {Defines} from "@/defines";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setIsActiveChatDetail, setChatDetail} from "@/stores/reducers/ui";
import dynamic from "next/dynamic";
const NL2BR = dynamic(() => import("@/components/common/NL2BR"), { ssr: false });
const LayoutCenterDialog = dynamic(() => import("@/components/layouts/dialogCenter"), {ssr: false});

export default function DialogChatDetail() {
    const firstRender = useRef(true);
    const ui = useAppSelector(state => state.ui);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!firstRender.current && !ui.isActiveChatDetail)
            dispatch(setChatDetail(null));

    }, [firstRender, ui, dispatch]);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const hideDialog = useCallback(() => {
        dispatch(setIsActiveChatDetail(false));
        dispatch(setChatDetail(null));
    }, [dispatch]);

    const copyDetail = useCallback(() => {
        if (window && ui.chatDetail) {
            window.navigator.clipboard.writeText(ui.chatDetail.message);
            alert("채팅내용을 복사 했습니다.");
        }
    }, [ui]);

    const dialog = useCallback(() => {
        return (
            <LayoutCenterDialog
                type={Defines.CenterDialogType.CHAT_DETAIL}
                size={Defines.CenterDialogSize.MEDIUM}
                buttons={
                    <>
                        <button className={`${styles.button} ${stylesCommon.button} ${stylesCommon.primaryButton}`} onClick={copyDetail} title="복사">복사</button>
                        <button className={`${styles.button} ${stylesCommon.button}`} onClick={hideDialog} title="닫기">닫기</button>
                    </>
                }>
                <div className={styles.chatChatDetailWrapper}>
                    {
                        ui.chatDetail
                            ?
                            <NL2BR text={ui.chatDetail.message} />
                            :
                            <></>
                    }
                </div>
            </LayoutCenterDialog>
        );
    }, [copyDetail, hideDialog, ui]);

    return dialog();
}
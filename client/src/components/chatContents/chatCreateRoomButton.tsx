import styles from "@/styles/chatCreateRoomButton.module.sass";
import Image from "next/image";
import PlusIcon from "public/images/plus.svg";
import {useCallback} from "react";
import {toggleIsActiveCreateChatRoom} from "@/stores/reducers/ui";
import {useAppDispatch} from "@/hooks";

export default function ChatCreateRoomButton() {
    const dispatch = useAppDispatch();

    const toggleCreateChatRoomDialog = useCallback(() => {
        dispatch(toggleIsActiveCreateChatRoom());
    }, [dispatch]);

    return (
        <div className={styles.toggleCreateChatRoomDialogWrapper}>
            <button className={styles.toggleCreateChatRoomDialogButton} onClick={toggleCreateChatRoomDialog}>
                <Image className={styles.toggleCreateChatRoomDialogIcon} src={PlusIcon} alt='채팅방 생성' width={25} height={25}/>
            </button>
        </div>
    );
}
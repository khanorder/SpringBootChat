import styles from "@/styles/chat.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import Link from "next/link";

export interface NotFoundChatRoomProps {
    isProd: boolean;
}

export default function NotFoundChatRoom({ isProd }: NotFoundChatRoomProps) {
    return (
        <div className={styles.chatContentsWrapper}>
            <div className={styles.chatRoomNone}>
                <div>
                    {isProd ? '채팅방이 없습니다.' : ''}
                </div>
                <Link href='/' className={`${styles.goToMainButton} ${stylesCommon.button}`}>메인으로</Link>
            </div>
        </div>
    );
}
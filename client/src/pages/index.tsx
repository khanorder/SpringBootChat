import styles from 'src/styles/list.module.sass'
import {
    ReactElement,
    useCallback,
    useEffect,
    useRef
} from "react";
import {NextPageContext} from "next";
import MainLayout from "@/components/layouts/main";
import {useAppDispatch} from "@/hooks";
import Layout from "@/components/layouts";
import CreateChatRoomDialog from "@/components/dialogs/createChatRoomDialog";
import PlusIcon from 'public/images/plus-svgrepo-com.svg';
import Image from "next/image";
import ChatRoomList from "@/components/chatContents/chatRoomList";
import {toggleIsActiveCreateChatRoom} from "@/stores/reducers/dialog";
import MainHeader from "@/components/chatContents/mainHeader";


interface MainProps {
    isProd: boolean;
}

function Main({isProd}: MainProps) {
    const firstRender = useRef(true);
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const toggleCreateChatRoomDialog = useCallback(() => {
        dispatch(toggleIsActiveCreateChatRoom());
    }, [dispatch]);

    return (
        <>
            <MainHeader />
            <ChatRoomList isProd={isProd} />
            <div className={styles.toggleCreateChatRoomDialogWrapper}>
                <button className={styles.toggleCreateChatRoomDialogButton} onClick={toggleCreateChatRoomDialog}>
                    <Image className={styles.toggleCreateChatRoomDialogIcon} src={PlusIcon} alt='채팅방 생성' width={30} height={30} />
                </button>
            </div>
            <CreateChatRoomDialog isProd={isProd} />
        </>
    );
}

Main.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            <MainLayout>{page}</MainLayout>
        </Layout>
    );
}

Main.getInitialProps = ({res, err}: NextPageContext) => {
    return {isProd: ("production" === process.env.NODE_ENV)};
}

export default Main;
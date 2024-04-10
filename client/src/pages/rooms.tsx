import {
    ReactElement,
    useCallback,
    useEffect,
    useRef
} from "react";
import {NextPageContext} from "next";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setIsProd} from "@/stores/reducers/appConfigs";
import dynamic from "next/dynamic";
import {Defines} from "@/defines";
import {exitChatRoom} from "@/stores/reducers/chat";
import isEmpty from "lodash/isEmpty";
import {exitChatRoomReq} from "@/stores/reducers/webSocket";
const Layout = dynamic(() => import("@/components/layouts"), { ssr: false });
const DefaultLayout = dynamic(() => import("@/components/layouts/default"), { ssr: false });
const ChatRooms = dynamic(() => import("@/components/chatContents/chatRooms"), { ssr: false });

interface MainProps {
    isProd: boolean;
}

function Rooms({isProd}: MainProps) {
    const firstRender = useRef(true);
    const chat = useAppSelector(state => state.chat);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (firstRender.current && !isEmpty(chat.currentChatRoomId))
            dispatch(exitChatRoomReq(chat.currentChatRoomId));

    }, [firstRender, dispatch, chat]);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            dispatch(setIsProd(isProd))
        }

    }, [firstRender, dispatch, isProd]);
    //#endregion

    return <ChatRooms />;
}

Rooms.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            <DefaultLayout>{page}</DefaultLayout>
        </Layout>
    );
}

Rooms.getInitialProps = ({res, err}: NextPageContext) => {
    return {isProd: ("production" === process.env.NODE_ENV)};
}

export default Rooms;
import {
    ReactElement,
    useEffect,
    useRef
} from "react";
import {GetStaticProps, NextPageContext} from "next";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setIsProd} from "@/stores/reducers/appConfigs";
import dynamic from "next/dynamic";
import isEmpty from "lodash/isEmpty";
import {exitChatRoomReq} from "@/stores/reducers/webSocket";
const Layout = dynamic(() => import("@/components/layouts"), { ssr: false });
const DefaultLayout = dynamic(() => import("@/components/layouts/default"), { ssr: false });
const ChatRooms = dynamic(() => import("@/components/chatContents/chatRooms"), { ssr: false });

interface MainProps {
    isProd: boolean;
}

function Rooms() {
    const firstRender = useRef(true);
    const chat = useAppSelector(state => state.chat);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (firstRender.current && !isEmpty(chat.currentChatRoomId))
            dispatch(exitChatRoomReq(chat.currentChatRoomId));

    }, [firstRender, dispatch, chat]);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
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

export const getStaticProps: GetStaticProps = async (context) => {
    return {
        props: {}
    };
}

// Rooms.getInitialProps = ({res, err}: NextPageContext) => {
//     return {isProd: ("production" === process.env.NODE_ENV)};
// }

export default Rooms;
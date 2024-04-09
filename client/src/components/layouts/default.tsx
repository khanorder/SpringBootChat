import type {Metadata} from 'next'
import {ReactNode} from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import {useAppSelector} from "@/hooks";
const ChatGNB = dynamic(() => import("@/components/chatContents/chatGNB"), { ssr: false });

export const metadata: Metadata = {
    title: 'chat client',
    description: 'chat client',
}

export default function MainLayout({children}: { children: ReactNode }) {
    const appConfigs = useAppSelector(state => state.appConfigs);
    const title: string = appConfigs.name;
    const subject: string = appConfigs.name;
    const description: string = appConfigs.description;
    const keyword: string = appConfigs.keyword;
    const author: string = appConfigs.author;
    const copyright: string = appConfigs.copyright;
    const url: string = appConfigs.url;
    const ogImage: string = appConfigs.ogImage;

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
                <meta name="title" content={title}/>
                <meta name="subject" content={subject}/>
                <meta name="description" content={description}/>
                <meta name="keyword" content={keyword}/>
                <meta name="author" content={author}/>
                <meta name="copyright" content={copyright}/>
                <meta property="og:title" content={title}/>
                <meta property="og:site_name" content={title}/>
                <meta property="og:type" content={title}/>
                <meta property="og:description" content={description}/>
                <meta property="og:url" content={url}/>
                <meta property="og:image" content={ogImage}/>
                <meta property="og:image:type" content="image/jpeg"/>
                <meta property="og:image:alt" content={title}/>
                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:title" content={title}/>
                <meta name="twitter:description" content={description}/>
                <meta name="twitter:image" content={ogImage}/>
            </Head>
            {children}
            <ChatGNB />
        </>
    )
}

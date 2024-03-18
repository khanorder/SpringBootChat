import express, {NextFunction, Request, Response} from 'express';
import dotenv from 'dotenv';
import path from 'path';
import next from 'next';
dotenv.config({ path: path.join(process.cwd(), '.env') });

const isProd = "production" === process.env.NODE_ENV;
const portString = process.env.PORT;
let port = 3000;
if ('undefined' != typeof portString && null != portString && !isNaN(parseInt(portString)))
    port = parseInt(portString);

const app = next({ dev: !isProd, port: port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    server.use((req: Request, res: Response, next: NextFunction) => {
        return handle(req, res);
    });

    server.listen(port, (err?:any) => {
        console.log("ready");
    });
});
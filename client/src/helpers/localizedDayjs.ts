import dayjs, { Dayjs } from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import 'dayjs/locale/ko';
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(relativeTime);
const currentTimezone: string = 'Asia/Seoul';
let timezoneName = '';
switch (currentTimezone) {
    case 'America/Los_Angeles':
        timezoneName = '북미서부';
        break;

    case 'Asia/Seoul':
        timezoneName = '한국';
        break;

    case 'GMT':
        timezoneName = 'UTC+0';
        break;
}
dayjs.tz.setDefault(currentTimezone);
dayjs.locale('ko');
export { dayjs, Dayjs, timezone, utc, timezoneName };
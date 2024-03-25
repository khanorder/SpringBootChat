import UAParser from "ua-parser-js";

export class FingerPrint {
    private uaParser: UAParser | null;

    constructor() {
        if ('undefined' === typeof window) {
            this.uaParser = null;
        } else {
            this.uaParser = new UAParser();
        }
    }

    public getDeviceType(): string {
        if ('undefined' === typeof window)
            return '';

        if (null === this.uaParser)
            return '';

        return this.uaParser.getDevice().type ?? '';
    }

    public getDeviceVendor(): string {
        if ('undefined' === typeof window)
            return '';

        if (null === this.uaParser)
            return '';

        return this.uaParser.getDevice().vendor ?? '';
    }

    public getDeviceModel(): string {
        if ('undefined' === typeof window)
            return '';

        if (null === this.uaParser)
            return '';

        return this.uaParser.getDevice().model ?? '';
    }

    public getAgent(): string {
        if ('undefined' === typeof window)
            return '';

        if (null === this.uaParser)
            return '';

        return this.uaParser.getUA();
    }

    public getBrowser(): string {
        if ('undefined' === typeof window)
            return '';

        if (null === this.uaParser)
            return '';

        return this.uaParser.getBrowser().name ?? '';
    }

    public getBrowserVersion(): string {
        if ('undefined' === typeof window)
            return '';

        if (null === this.uaParser)
            return '';

        return this.uaParser.getBrowser().version ?? '';
    }

    public getEngine(): string {
        if ('undefined' === typeof window)
            return '';

        if (null === this.uaParser)
            return '';

        return this.uaParser.getEngine().name ?? '';
    }

    public getEngineVersion(): string {
        if ('undefined' === typeof window)
            return '';

        if (null === this.uaParser)
            return '';

        return this.uaParser.getEngine().version ?? '';
    }

    public getOS(): string {
        if ('undefined' === typeof window)
            return '';

        if (null === this.uaParser)
            return '';

        return this.uaParser.getOS().name ?? '';
    }

    public getOSVersion(): string {
        if ('undefined' === typeof window)
            return '';

        if (null === this.uaParser)
            return '';

        return this.uaParser.getOS().version ?? '';
    }

    public getFingerprint(): number | null {
        if ('undefined' === typeof window)
            return null;

        if (null === this.uaParser)
            return null;

        return this.generateHash(this.uaParser.getBrowser().name ?? '') +
            this.generateHash(this.uaParser.getBrowser().version ?? '') +
            this.generateHash(this.uaParser.getOS().name ?? '') +
            this.generateHash(this.uaParser.getOS().version ?? '') +
            this.generateHash(this.uaParser.getCPU().architecture ?? '') +
            this.generateHash(this.uaParser.getDevice().model ?? '') +
            this.generateHash(this.uaParser.getDevice().type ?? '') +
            this.generateHash(this.uaParser.getDevice().vendor ?? '') +
            this.generateHash(this.uaParser.getEngine().name ?? '') +
            this.generateHash(this.uaParser.getEngine().version ?? '') +
            this.generateHash(this.getVideoCardInfo() ?? '') +
            this.generateHash(this.getTimeZoneOffsetString() ?? '') +
            this.generateHash(navigator.language);
    }

    private generateHash = (input: string): number => {
        if (input)
            return Math.abs(input.split("").reduce(function (a, b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0));

        return 0;
    }

    private getVideoCardInfo = (): string => {
        const gl = document.createElement('canvas').getContext('webgl');

        if (!gl)
            return '';

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
    }

    private getTimeZoneOffsetString = (): string => {
        const offset = new Date().getTimezoneOffset();
        return offset.toString();
    }
}
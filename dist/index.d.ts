import { default as default_2 } from 'react';

declare const Captchala: default_2.ForwardRefExoticComponent<CaptchalaProps & default_2.RefAttributes<CaptchalaRef>>;
export { Captchala }
export default Captchala;

export declare interface CaptchalaProps {
    appKey: string;
    product?: 'popup' | 'float' | 'embed' | 'bind';
    action?: string;
    lang?: string;
    /** Element selector or HTMLElement to bind to (only for product="bind") */
    bindTo?: string | HTMLElement;
    /**
     * One-time server_token issued by your backend via POST /v1/server/challenge/issue
     * (with X-App-Key + X-App-Secret). If your captcha app has
     * `server_token_required=true`, this prop is mandatory.
     * Recommended for production: prevents anyone with the public app_key
     * from farming out captchas to human-solver farms.
     */
    serverToken?: string;
    /**
     * Optional: called by the SDK when the current `serverToken` is rejected by the
     * backend (server_token_invalid / exhausted / app_mismatch / binding_mismatch).
     * Return a fresh token to retry transparently once, or null to surface the error.
     * If not provided the SDK never auto-retries — onError fires immediately.
     */
    onServerTokenExpired?: () => Promise<string | null> | string | null;
    /** Theme: preset string or { custom: { brightness: 'light' | 'dark' | 'system', ... } }. Omit to follow the system. */
    theme?: any;
    onSuccess?: (result: CaptchalaResult) => void;
    onError?: (error: any) => void;
    onClose?: () => void;
    onReady?: () => void;
    className?: string;
    style?: default_2.CSSProperties;
}

export declare interface CaptchalaRef {
    verify: () => void;
    reset: () => void;
    destroy: () => void;
    bindTo: (selector: string | HTMLElement) => void;
    setLang: (lang: string) => void;
    getInstance: () => any;
}

export declare interface CaptchalaResult {
    token: string;
    type: string;
    action: string;
    offline?: boolean;
    clientOnly?: boolean;
}

declare interface CaptchalaResult_2 {
    token: string;
    type: string;
    action: string;
    offline?: boolean;
    clientOnly?: boolean;
}

export declare function isCaptchalaLoaded(): boolean;

export declare function loadCaptchalaSDK(): Promise<void>;

/**
 * Hook for using Captchala with more control
 */
export declare function useCaptchala(options: UseCaptchalaOptions): UseCaptchalaReturn;

export declare interface UseCaptchalaOptions {
    appKey: string;
    product?: 'popup' | 'float' | 'embed' | 'bind';
    action?: string;
    lang?: string;
    /** Theme: preset string or { custom: { brightness: 'light' | 'dark' | 'system', ... } }. Omit to follow the system. */
    theme?: any;
}

export declare interface UseCaptchalaReturn {
    ready: boolean;
    loading: boolean;
    error: Error | null;
    verify: () => Promise<CaptchalaResult_2>;
    reset: () => void;
    bindTo: (selector: string | HTMLElement) => void;
    appendTo: (selector: string | HTMLElement) => void;
    setLang: (lang: string) => void;
}

export { }

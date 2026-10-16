/// <reference types="vite/client" />

interface Window {
  google?: {
    accounts?: {
      id?: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential: string; select_by?: string }) => void;
          auto_select?: boolean;
          cancel_on_tap_outside?: boolean;
          context?: string;
        }) => void;
        prompt: (momentListener?: (notification: any) => void) => void;
        renderButton: (
          parent: HTMLElement,
          options: {
            theme?: 'outline' | 'filled_blue' | 'filled_black';
            size?: 'large' | 'medium' | 'small';
            text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
            shape?: 'rectangular' | 'pill' | 'circle' | 'square';
            width?: number | string;
          }
        ) => void;
        disableAutoSelect: () => void;
      };
      oauth2?: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (tokenResponse: { access_token?: string; error?: string }) => void;
          error_callback?: (error: any) => void;
        }) => {
          requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
        };
      };
    };
  };
}

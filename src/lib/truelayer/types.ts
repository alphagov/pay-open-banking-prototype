export interface TrueLayerPayment {
    id: string;
}

export interface Provider {
    id: string;
    display_name: string;
}

export interface ProviderSelection {
    status: string,
    authorization_flow: {
        actions: {
            next: {
                type: string;
                providers: Provider[]
            }
        }
    }
}

export interface RedirectResponse {
    status: string;
    authorization_flow: {
        actions: {
            next: {
                type: string;
                uri: string;
            }
        }
    }
}

export interface Payment {
    status: string;
    failure_reason?: string;
}

export interface ExtractionConfig {
    name: string;
    question: string;
    "undefined": string;
}

export interface ExtractionLogic {
    id: string;
    name: string;
    batch_size: number;
    config: ExtractionConfig[];
    last_updated_at: string;
    last_updated_by: string | null;
    is_active: boolean;
    version: number;
}

export interface DocumentType {
    id: string;
    name: string;
    description: string | null;
    code: string;
    extraction_logics: ExtractionLogic[];
}

export interface ApiResponse {
    status: string;
    message: string;
    data: DocumentType[];
}
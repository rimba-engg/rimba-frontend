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
}

export interface DocumentType {
    id: string;
    name: string;
    description: string | null;
    code: string;
    extraction_logic: ExtractionLogic | null;
}

export interface ApiResponse {
    status: string;
    message: string;
    data: DocumentType[];
}
import { v4 as uuidv4 } from 'uuid';

export function createGraphError(message: string, type: string, code: number, error_subcode?: number) {
    const error: any = {
        message,
        type,
        code,
        fbtrace_id: uuidv4().replace(/-/g, '').substring(0, 11).toUpperCase()
    };
    if (error_subcode !== undefined) {
        error.error_subcode = error_subcode;
    }
    return { error };
}

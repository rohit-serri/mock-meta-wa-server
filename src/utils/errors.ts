import { v4 as uuidv4 } from 'uuid';

export function createGraphError(
    message: string, 
    type: string, 
    code: number, 
    error_subcode?: number,
    is_transient: boolean = false,
    error_user_title?: string,
    error_user_msg?: string
) {
    const error: any = {
        message,
        type,
        code,
        fbtrace_id: uuidv4().replace(/-/g, '').substring(0, 11).toUpperCase()
    };
    if (error_subcode !== undefined) {
        error.error_subcode = error_subcode;
    }
    if (is_transient) {
        error.is_transient = is_transient;
    }
    if (error_user_title) {
        error.error_user_title = error_user_title;
    }
    if (error_user_msg) {
        error.error_user_msg = error_user_msg;
    }
    return { error };
}

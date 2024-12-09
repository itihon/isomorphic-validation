export type ValidationResult = typeof ValidationResultAPI;

declare namespace ValidationResultAPI {
    let isValid: boolean;
    /** Validatable object */
    let target: any; 
    /** 
     * @type {"started" | "valid" | "invalid" | "changed" | "validated" | "restored"} 
     * Validation result type 
     * */
    let type: string;
}

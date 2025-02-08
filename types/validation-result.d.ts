import { Validator } from "./predicate";

export type ValidationResult = typeof ValidationResultAPI & Map<any, Validator>;

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

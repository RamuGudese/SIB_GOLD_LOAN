// model.ts

import { AbstractControl, ValidationErrors } from '@angular/forms';

export function aadharValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const isValid = /^\d{12}$/.test(value) && !['0', '1'].includes(value[0]);
  return isValid ? null : { invalidAadhar: true };
}

export function panValidator(control: AbstractControl): ValidationErrors | null {
  let value = control.value;
  if (!value) return null;

  const upperValue = value.toUpperCase();

  // Update the control value if it's not already uppercase
  if (value !== upperValue) {
    control.setValue(upperValue, { emitEvent: false }); // Prevents re-triggering validation
    value = upperValue;
  }

  const isValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);
  return isValid ? null : { invalidPan: true };
}

export function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const isValid = /^[6-9]\d{9}$/.test(value);
  return isValid ? null : { invalidPhone: true };
}

export function onlyDigitsValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const isValid = /^\d+$/.test(value); // Matches only digits
  return isValid ? null : { nonNumeric: true };
}
export function decimalValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  // Accepts numbers like 1, 1.25, 0.5, 100.00
  const isValid = /^\d+(\.\d{1,2})?$/.test(value); // Up to 2 decimal places
  return isValid ? null : { invalidDecimal: true };
}
// export interface Borrower {
//   FullName: string;
//   Pan: string;
//   AadharNumber: string;
//   Mobile: string;
//   Email: string;
//   AnnualIncome: string;
// }
// export interface LoanDetails {
//   LoanAmount: string;
//   InterestRate: string;
//   LoanTerm: string;
//   EMI: string;
// }
// export interface Ornament {
//   goldItems: string;
//   grossWeight: string;
//   purity: string;
//   netWeight: string;
//   makingCharge: string;
//   stoneWeight: string;
//   stoneCharge: string;
//   totalAmount: string;
// }
// export interface Document {
//   docType: string;
//   docNumber: string;
//   issueDate: string;
//   expiryDate: string;
// }
// export interface LoanApplication {
//   borrower: Borrower;
//   loanDetails: LoanDetails;
//   ornaments: Ornament[];
//   documents: Document[];
// }

                                            
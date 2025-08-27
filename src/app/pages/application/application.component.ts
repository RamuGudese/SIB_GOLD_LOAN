import { Router } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime } from 'rxjs';
import { aadharValidator, panValidator, phoneValidator ,onlyDigitsValidator ,decimalValidator } from '../../model/model';
// ✅ Converted to Class
export class OrnamentRow {
  goldItems: string = '';
  GrossWeight: string = '';
  StoneWeight: string = '';
  NetGold: string = '';
  Purity: string = '';
  EquivalentWeight: string = '';
  MarketValue: string = '';
  Hallmark: string = '';
  Description: string = '';
  Images: File[] | string[] | null = null;

  constructor(init?: Partial<OrnamentRow>) {
    Object.assign(this, init);
  }
}

// ✅ Converted to Class
export class ApplicationData {
  borrower = {
    FullName: '',
    Pan: '',
    AadharNumber: '',
    Mobile: '',
    Email: '',
    AnnualIncome: '',
  };

  ornaments: OrnamentRow[] = [];

  ownership = {
    ownershipProof: '',
    ownershipDocument: null as File | string | null,
    ownershipDeclaration: false,
  };

  LoanCalculationSummary = {
    goldRate22K: '',
    ltvRatio: '',
  };

  calculationsection?: {
    totalWeight: number;
    totalValue: number;
    eligibleLoan: number;
    coinsWeight: number;
    isWeightValid: boolean;
  };

  constructor(init?: Partial<ApplicationData>) {
    Object.assign(this, init);
  }
}

@Component({
  selector: 'app-application',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.css'],
})
export class ApplicationComponent implements OnInit {
  router = inject(Router);

  MainForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.MainForm = this.fb.group(
      {
        borrower: this.fb.group({ 
          FullName: new FormControl<string>('', {
            nonNullable: true,
            validators: [
              Validators.required,
              Validators.minLength(4),
              Validators.pattern(/^[A-Za-z ]+$/),
            ],
          }),
          Pan: new FormControl<string>('', {
            nonNullable: true,
            validators: [
              Validators.required, 
              Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
              ,panValidator
            ],
          }),
          AadharNumber: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern(/^[0-9]{12}$/),Validators.minLength(12), Validators.maxLength(12),aadharValidator],
          }),
          Mobile: new FormControl<string>('', {
            nonNullable: true,
            
            validators: [Validators.required, Validators.pattern(/^[0-9]{10}$/),phoneValidator],
          }),
          Email: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.email],
          }),
          AnnualIncome: new FormControl<string>('', {
            nonNullable: true,
            validators: [
              Validators.required,
              Validators.pattern(/^[0-9]+$/),
              Validators.min(1),
              Validators.max(1000000),
            ],
          }),
        }),

        ornaments: this.fb.array([this.createOrnamentRow()]),

        ownership: this.fb.group({
          ownershipProof: ['', Validators.required],
          ownershipDocument: [null],
          ownershipDeclaration: [false, Validators.requiredTrue],
        }),

        LoanCalculationSummary: this.fb.group({
          goldRate22K: ['', [Validators.required, Validators.pattern(this.decimalPattern())]],
          ltvRatio: ['75', Validators.required],
        }),

        RegulatoryCompliance: this.fb.group({
          rbiCompliance: [true, Validators.requiredTrue],
          borrowerPresent: [true, Validators.requiredTrue],
          moneyLaunderingCheck: [true, Validators.requiredTrue],
        }),
      },
      { validators: this.ornamentsLimitValidator() }
    );
  }

  // ======= Getters =======
  get borrowerGroup(): FormGroup {
    return this.MainForm.get('borrower') as FormGroup;
  }

  get ornamentsArray(): FormArray {
    return this.MainForm.get('ornaments') as FormArray;
  }

  get ownershipGroup(): FormGroup {
    return this.MainForm.get('ownership') as FormGroup;
  }

  get regulatoryGroup(): FormGroup {
    return this.MainForm.get('RegulatoryCompliance') as FormGroup;
  }

  private decimalPattern(): RegExp {
    return /^\d+(\.\d{1,2})?$/;
  }

  private createOrnamentRow(): FormGroup {
    const group = this.fb.group(
      {
        goldItems: ['', Validators.required],
        GrossWeight: ['', [Validators.required,onlyDigitsValidator]],
      StoneWeight: ['', [Validators.required, decimalValidator]],
        NetGold: [{ value: '0', disabled: true }],
        Purity: ['', Validators.required],
        EquivalentWeight: [{ value: '0', disabled: true }],
        MarketValue: ['', [Validators.required,onlyDigitsValidator]],
        Hallmark: ['', [Validators.required, Validators.pattern(/^[A-Z0-9\- ]{3,}$/i)]],
        Description: [''],
        Images: [null],
      },
      { validators: this.weightRelationValidator }
    );

    group.get('GrossWeight')?.valueChanges.subscribe(() => this.updateCalculations(group));
    group.get('StoneWeight')?.valueChanges.subscribe(() => this.updateCalculations(group));
    group.get('Purity')?.valueChanges.subscribe(() => this.updateCalculations(group));

    return group;
  }

  private weightRelationValidator(control: AbstractControl): ValidationErrors | null {
    const gross = parseFloat(control.get('GrossWeight')?.value || '0');
    const stone = parseFloat(control.get('StoneWeight')?.value || '0');
    if (isNaN(gross) || isNaN(stone)) return null;
    return stone > gross ? { stoneExceedsGross: true } : null;
  }

  private ornamentsLimitValidator() {
    return (form: AbstractControl): ValidationErrors | null => {
      const arr = (form.get('ornaments') as FormArray | null)?.getRawValue() as OrnamentRow[];
      if (!arr || !arr.length) return null; 

      let totalNet = 0;
      let coinsNet = 0; 

      for (const row of arr) {
        const gross = parseFloat(row?.GrossWeight ?? '0') || 0;
        const stone = parseFloat(row?.StoneWeight ?? '0') || 0;
        const net = Math.max(gross - stone, 0);
        totalNet += net;
        if ((row?.goldItems || '').toLowerCase() === 'coins') coinsNet += net;
      }

      const errors: ValidationErrors = {};
      if (totalNet > 1000) errors['totalNetExceeded'] = true;
      if (coinsNet > 50) errors['coinsExceeded'] = true;

      return Object.keys(errors).length ? errors : null;
    };
  }

  private updateCalculations(group: FormGroup): void {
    const gross = parseFloat(group.get('GrossWeight')?.value || '0') || 0;
    const stone = parseFloat(group.get('StoneWeight')?.value || '0') || 0;
    const purity = parseFloat(group.get('Purity')?.value || '0') || 0;

    const netGold = Math.max(gross - stone, 0);
    group.get('NetGold')?.setValue(netGold.toFixed(2), { emitEvent: false });

    const eq22 = netGold * (purity / 22);
    group.get('EquivalentWeight')?.setValue(eq22 > 0 ? eq22.toFixed(4) : '0', { emitEvent: false });

    this.MainForm.updateValueAndValidity({ emitEvent: false });
  }

  addOrnament(): void {
    this.ornamentsArray.push(this.createOrnamentRow());
    this.saveToLocalStorage();
  }

  removeOrnament(index: number): void {
    this.ornamentsArray.removeAt(index);
    this.MainForm.updateValueAndValidity({ emitEvent: false });
    this.saveToLocalStorage();
  }

  onImagesSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const files = input?.files ? Array.from(input.files) : null;
    (this.ornamentsArray.at(index) as FormGroup).get('Images')?.setValue(files);
    this.saveToLocalStorage();
  }

  onOwnershipDocSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files && input.files.length ? input.files[0] : null;
    this.ownershipGroup.get('ownershipDocument')?.setValue(file);
    this.saveToLocalStorage();
  }   


  private STORAGE_KEY = 'ApplicationData';

  private serializeForStorage(): ApplicationData {
    const raw = this.MainForm.getRawValue() as ApplicationData;

    const ornaments = (raw.ornaments || []).map(
      (o) =>
        new OrnamentRow({
          ...o,
          Images: Array.isArray(o.Images)
            ? (o.Images as any[]).map((f) => (f && typeof (f as any).name === 'string' ? (f as any).name : String(f)))
            : o.Images,
        })
    );

    const ownershipDoc =
      raw.ownership?.ownershipDocument && (raw.ownership.ownershipDocument as any).name
        ? (raw.ownership.ownershipDocument as any).name
        : raw.ownership?.ownershipDocument ?? null;

    return new ApplicationData({
      borrower: raw.borrower,
      ornaments,
      ownership: {
        ownershipProof: raw.ownership?.ownershipProof || '',
        ownershipDocument: ownershipDoc,
        ownershipDeclaration: !!raw.ownership?.ownershipDeclaration,
      },
      LoanCalculationSummary: {
        goldRate22K: raw.LoanCalculationSummary?.goldRate22K || '',
        ltvRatio: raw.LoanCalculationSummary?.ltvRatio || '',
      },
      calculationsection: {
        totalWeight: this.totalWeight,
        totalValue: this.totalValue,
        eligibleLoan: this.eligibleLoan,
        coinsWeight: this.coinsWeight,
        isWeightValid: this.isWeightValid,
      },
    });
  }

  private saveToLocalStorage(): void {
    try {
      const data = this.serializeForStorage();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  private loadFromLocalStorage(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Partial<ApplicationData>;

      if (parsed.borrower) {
        this.borrowerGroup.patchValue(parsed.borrower);
      }

      const arr = Array.isArray(parsed.ornaments) ? parsed.ornaments : [];
      if (arr.length) {
        while (this.ornamentsArray.length) this.ornamentsArray.removeAt(0);
        arr.forEach((row) => {
          const fg = this.createOrnamentRow();
          fg.patchValue({
            goldItems: row.goldItems ?? '',
            GrossWeight: row.GrossWeight ?? '',
            StoneWeight: row.StoneWeight ?? '',
            Purity: row.Purity ?? '',
            MarketValue: row.MarketValue ?? '',
            Hallmark: row.Hallmark ?? '',
            Description: row.Description ?? '',
            Images: null,
          });
          this.updateCalculations(fg);
          this.ornamentsArray.push(fg);
        });
      }

      if (parsed.ownership) {
        this.ownershipGroup.patchValue({
          ownershipProof: parsed.ownership.ownershipProof ?? '',
          ownershipDocument: null,
          ownershipDeclaration: !!parsed.ownership.ownershipDeclaration,
        });
      }

      if (parsed.calculationsection) {
        this.totalWeight = parsed.calculationsection.totalWeight || 0;
        this.totalValue = parsed.calculationsection.totalValue || 0;
        this.eligibleLoan = parsed.calculationsection.eligibleLoan || 0;
        this.coinsWeight = parsed.calculationsection.coinsWeight || 0;
        this.isWeightValid = parsed.calculationsection.isWeightValid ?? true;
      }
    } catch (e) {
      console.warn('Failed to parse saved ApplicationData', e);
    }
  }

  ngOnInit(): void {
    this.loadFromLocalStorage();
    this.MainForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.saveToLocalStorage();
      this.calculateTotals(); // live updates for summary
    });
  }

  onSubmit(): void {
    this.MainForm.markAllAsTouched();

    if (this.MainForm.invalid) {
      alert('Please fix the validation errors before submitting.');
      return;
    }

    this.saveToLocalStorage();
    const payload = this.MainForm.getRawValue() as ApplicationData;
    console.log('Final submission:', payload);
    alert('Form submitted successfully and saved!');
  }

  trackByIndex(i: number): number {
    return i;
  }

  // ===== Loan Calculation Summary =====
  totalWeight: number = 0;
  totalValue: number = 0;
  eligibleLoan: number = 0;
  coinsWeight: number = 0;
  ltvRatio: number = 75;
  isWeightValid: boolean = true;

  calculateTotals() {
    const arr = this.ornamentsArray.getRawValue() as OrnamentRow[];

    this.totalWeight = arr.reduce((sum, o) => sum + (parseFloat(o.EquivalentWeight) || 0), 0);

    this.totalValue = arr.reduce((sum, o) => {
      const marketValue = parseFloat(o.MarketValue) || 0;
      const weight = parseFloat(o.EquivalentWeight) || 0;
      return sum + marketValue * weight;
    }, 0);

    const ltv = parseFloat(this.MainForm.get('LoanCalculationSummary.ltvRatio')?.value) || 75;
    this.eligibleLoan = this.totalValue * (ltv / 100);

    this.isWeightValid = this.totalWeight > 0 && this.totalWeight <= 500;

    this.coinsWeight = arr
      .filter((o) => (o.goldItems || '').toLowerCase() === 'coins')
      .reduce((sum, o) => sum + (parseFloat(o.EquivalentWeight) || 0), 0);
  }

  onGoldRateChange() {
    this.calculateTotals();
  }

  onLtvChange(event: any) {
    this.ltvRatio = parseFloat(event.target.value);
    this.calculateTotals();
  }

  validateForm() {
    this.router.navigate(['/c']);
  }
}

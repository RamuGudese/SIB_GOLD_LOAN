import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.css'],
})
export class CertificateComponent implements OnInit {

  ornamentInformation: any[] = [];  
  borrowerInformation: any = {};
  loancalculationSummary: any = {};
  calculationSection: any = {};

  constructor() { }

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedData = localStorage.getItem('ApplicationData');
      if (savedData) {
        const parsed = JSON.parse(savedData);

        // Borrower Info
        this.borrowerInformation = parsed.borrower || {};

        // Ornament Info
        if (Array.isArray(parsed.ornaments)) {
          this.ornamentInformation = parsed.ornaments.map((o: any) => ({
            goldItems: o.goldItems,
            grossWeight: parseFloat(o.GrossWeight) || 0,
            stoneWeight: parseFloat(o.StoneWeight) || 0,
            netWeight: parseFloat(o.NetGold) || 0,
            purity: parseFloat(o.Purity) || 0,
            equivalentWeight: parseFloat(o.EquivalentWeight) || 0,
            rate: parseFloat(parsed.LoanCalculationSummary?.goldRate22K) || 0,
            marketValue: parseFloat(o.MarketValue) || 0,
            hallmark: o.Hallmark || ''
          }));
        }

        // Loan Summary & Calculations
        this.loancalculationSummary = parsed.LoanCalculationSummary || {};
        this.calculationSection = parsed.calculationsection || {};
      }
    }
  }

  // ====== Table totals ======
  get totalGrossWeight() {
    return this.ornamentInformation.reduce((sum, o) => sum + o.grossWeight, 0);
  }
  get totalStoneWeight() {
    return this.ornamentInformation.reduce((sum, o) => sum + o.stoneWeight, 0);
  }
  get totalNetWeight() {
    return this.ornamentInformation.reduce((sum, o) => sum + o.netWeight, 0);
  }
  get totalEquivalentWeight() {
    return this.ornamentInformation.reduce((sum, o) => sum + o.equivalentWeight, 0);
  }
  get totalMarketValue() {
    return this.ornamentInformation.reduce((sum, o) => sum + o.marketValue, 0);
  }

  back() {
    window.history.back();
  }
}

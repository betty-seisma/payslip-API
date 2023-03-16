export interface Employee {
  firstName: string;
  lastName: string;
  annualSalary: number;
  paymentMonth: number;
  superRate: number;
}

interface PaySlip {
  employee: Employee;
  fromDate: string;
  toDate: string;
  grossIncome: number;
  incomeTax: number;
  superannuation: number;
  netIncome: number;
}

export type TaxBracket = {
  minIncome: number;
  maxIncome: number;
  taxRate: number;
  fixedTax: number;
};

export function generatePaySlip(employee: Employee, taxBrackets: TaxBracket[]): PaySlip {
  const fromDate = getDateRangeForMonth(employee.paymentMonth).fromDate;
  const toDate = getDateRangeForMonth(employee.paymentMonth).toDate;
  const grossIncome = calculateGrossIncome(employee.annualSalary);
  const incomeTax = calculateIncomeTax(employee.annualSalary, taxBrackets);
  const superannuation = calculateSuperannuation(
    grossIncome,
    employee.superRate
  );
  const netIncome = calculateNetIncome(grossIncome, incomeTax);

  return {
    employee,
    fromDate,
    toDate,
    grossIncome,
    incomeTax,
    superannuation,
    netIncome,
  };
}

export function getDateRangeForMonth(month: number): {
  fromDate: string;
  toDate: string;
} {
  const year = new Date().getFullYear();
  const startDate = new Date(year, month - 1, 2);
  const endDate = new Date(year, month, 1);
  const fromDate = startDate.toISOString().slice(0, 10);
  const toDate = endDate.toISOString().slice(0, 10);
  return { fromDate, toDate };
}

export function calculateGrossIncome(annualSalary: number): number {
  return Math.round(annualSalary / 12);
}

export function calculateIncomeTax(annualSalary: number, taxBrackets: TaxBracket[]): number{
  let tax = 0;

  for (const bracket of taxBrackets) {
    if (annualSalary > bracket.minIncome && annualSalary <= bracket.maxIncome) {
      tax = bracket.fixedTax + (annualSalary - bracket.minIncome) * bracket.taxRate;
      break;
    }
  }

  return Math.round(tax / 12);
  }

export function calculateSuperannuation(
  grossIncome: number,
  superRate: number
): number {
  return Math.round(grossIncome * superRate);
}

export function calculateNetIncome(grossIncome: number, incomeTax: number): number {
  return grossIncome - incomeTax;
}
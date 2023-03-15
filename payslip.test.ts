import {describe, expect, test, it} from '@jest/globals';

import request from 'supertest';
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { app } from './index'
import {  calculateIncomeTax, getDateRangeForMonth, TaxBracket, calculateGrossIncome, calculateNetIncome, calculateSuperannuation } from './payslip';

dotenv.config();

app.use(bodyParser.json());

describe('payslip API', () => {
  test('POST /payslip returns expected pay slip object', async () => {
    const employee = {
      firstName: 'John',
      lastName: 'Doe',
      annualSalary: 60000,
      paymentMonth: 3,
      superRate: 0.1,
    };

    const response = await request(app)
      .post('/payslip')
      .send(employee);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      employee,
      fromDate: '2023-03-01',
      toDate: '2023-03-31',
      grossIncome: 5000,
      incomeTax: 921,
      superannuation: 500,
      netIncome: 4079,
    });
  });
});

const taxBrackets: TaxBracket[] = [
  { minIncome: 0, maxIncome: 18200, taxRate: 0, fixedTax: 0 },
  { minIncome: 18201, maxIncome: 37000, taxRate: 0.19, fixedTax: 0 },
  { minIncome: 37001, maxIncome: 87000, taxRate: 0.325, fixedTax: 3572 },
  { minIncome: 87001, maxIncome: 180000, taxRate: 0.37, fixedTax: 19822 },
  { minIncome: 180001, maxIncome: Infinity, taxRate: 0.45, fixedTax: 54232 },
];


describe('calculateTax', () => {
  it('should calculate income tax for nil tax bracket', () => {
    const tax = calculateIncomeTax(0, taxBrackets);
    expect(tax).toEqual(0);
  });

  it('should calculate income tax for lower tax bracket', () => {
    const tax = calculateIncomeTax(18200, taxBrackets);
    expect(tax).toEqual(0);
  });

  it('should calculate income tax for middle tax bracket', () => {
    const tax = calculateIncomeTax(60050, taxBrackets);
    expect(tax).toEqual(922);
  });

  it('should calculate income tax for higher tax bracket', () => {
    const tax = calculateIncomeTax(120000, taxBrackets);
    expect(tax).toEqual(2669);
  });

  it('should calculate income tax for top tax bracket', () => {
    const tax = calculateIncomeTax(250000, taxBrackets);
    expect(tax).toEqual(7144);
  });
});

describe('getDateRangeForMonth', () => {
  it('returns expected date range for month with 31 days', () => {
    const { fromDate, toDate } = getDateRangeForMonth(3);
    expect(fromDate).toBe('2023-03-01');
    expect(toDate).toBe('2023-03-31');
  });

  it('returns expected date range for month with 28 days', () => {
    const { fromDate, toDate } = getDateRangeForMonth(2);
    expect(fromDate).toBe('2023-02-01');
    expect(toDate).toBe('2023-02-28');
  });

  it('returns expected date range for month with 30 days', () => {
    const { fromDate, toDate } = getDateRangeForMonth(4);
    expect(fromDate).toBe('2023-04-01');
    expect(toDate).toBe('2023-04-30');
  });
});

describe('calculateGrossIncome', () => {
  test('returns expected gross income for $60,000', () => {
    expect(calculateGrossIncome(60000)).toBe(5000);
  });
});


describe('calculateSuperannuation', () => {
  test('returns expected superannuation', () => {
    expect(calculateSuperannuation(5000, 0.1)).toBe(500);
  });
});

describe('calculateNetIncome', () => {
  test('returns expected net income', () => {
    expect(calculateNetIncome(5004, 922)).toBe(4082);
  });
});

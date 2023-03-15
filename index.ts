import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { Employee } from './payslip';
import { generatePaySlip, TaxBracket } from './payslip';

dotenv.config();

export const app: Express = express();
app.use(bodyParser.json());

const taxBrackets: TaxBracket[] = [
  { minIncome: 0, maxIncome: 18200, taxRate: 0, fixedTax: 0 },
  { minIncome: 18201, maxIncome: 37000, taxRate: 0.19, fixedTax: 0 },
  { minIncome: 37001, maxIncome: 87000, taxRate: 0.325, fixedTax: 3572 },
  { minIncome: 87001, maxIncome: 180000, taxRate: 0.37, fixedTax: 19822 },
  { minIncome: 180001, maxIncome: Infinity, taxRate: 0.45, fixedTax: 54232 },
];

app.post('/payslip', (req: Request, res: Response) => {
  const employee: Employee = req.body;
  const paySlip = generatePaySlip(employee, taxBrackets);
  res.json(paySlip);
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
const taxSchemas = {

  "Salary Record": {
    employerName: null,
    employeeName: null,
    taxYear: null,
    grossSalary: null,
    allowances: null,
    bonuses: null,
    deductions: null,
    taxWithheld: null,
    netSalary: null,
    currency: null
  },

 "Bank Statement": {
  accountHolder: null,
  bankName: null,
  accountNumberMasked: null,

  statementPeriod: null,
  taxYear: null,

  openingBalance: null,
  closingBalance: null,

  totalDeposits: null,
  totalWithdrawals: null,

  currency: null,

  salaryCredits: [],

  otherIncome: [],

  transactions: []
},



 "Withholding Record": {
  taxpayerName: null,
  taxCollector: null,
  taxYear: null,
  incomeType: null,
  grossAmount: null,
  taxWithheld: null,
  currency: null
},

  "Tax Document": {
    taxpayerName: null,
    taxYear: null,
    taxableIncome: null,
    taxAssessed: null,
    taxPaid: null,
    taxRefund: null,
    taxDue: null,
    currency: null
  },

  "Business Record": {
    businessName: null,
    taxYear: null,
    revenue: null,
    expenses: null,
    businessIncome: null,
    taxPaid: null,
    taxWithheld: null,
    currency: null
  },

  "Property Record": {
    ownerName: null,
    propertyType: null,
    propertyValue: null,
    rentalIncome: null,
    expenses: null,
    taxPaid: null,
    taxWithheld: null,
    currency: null
  },

  "Other": {
    relevantAmounts: [],
    dates: [],
    names: [],
    taxInformation: [],
    financialInformation: [],
    notes: []
  }

};

module.exports = taxSchemas;


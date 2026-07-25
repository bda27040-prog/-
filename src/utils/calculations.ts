import { Customer, Transaction, CustomerSummary, OverallStats, CustomerStatus } from '../types';

export function computeCustomerSummaries(
  customers: Customer[],
  transactions: Transaction[]
): CustomerSummary[] {
  const todayStr = new Date().toISOString().split('T')[0];

  return customers.map((customer) => {
    const custTxs = transactions.filter((tx) => tx && String(tx.customerId).trim() === String(customer.id).trim());
    
    // Sort transactions chronologically
    custTxs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let totalDebt = 0; // إجمالي عليه
    let totalPaid = 0; // إجمالي له
    let overdueCount = 0;
    let nextDueDate: string | undefined = undefined;

    custTxs.forEach((tx) => {
      if (tx.type === 'DEBT') {
        totalDebt += Number(tx.amount);
      } else if (tx.type === 'PAYMENT') {
        totalPaid += Number(tx.amount);
      }
    });

    const remainingBalance = totalDebt - totalPaid; // >0 means customer owes us (عليه), <0 means we owe customer (له)

    // Check overdue debts if there's an unpaid debt balance remaining
    if (remainingBalance > 0) {
      const debtTxs = custTxs.filter((tx) => tx.type === 'DEBT' && tx.dueDate);
      
      debtTxs.forEach((tx) => {
        if (tx.dueDate && tx.dueDate < todayStr) {
          overdueCount++;
        }
        if (tx.dueDate && (!nextDueDate || tx.dueDate < nextDueDate)) {
          nextDueDate = tx.dueDate;
        }
      });
    }

    let status: CustomerStatus = 'CLEARED';
    if (remainingBalance === 0) {
      status = 'CLEARED';
    } else if (overdueCount > 0) {
      status = 'OVERDUE';
    } else if (remainingBalance > 0) {
      status = 'DEBTOR'; // عليه
    } else {
      status = 'CREDITOR'; // له (دائن)
    }

    const lastTx = custTxs[custTxs.length - 1];

    return {
      ...customer,
      totalDebt,
      totalPaid,
      remainingBalance,
      status,
      overdueCount,
      lastTransactionDate: lastTx ? lastTx.date : undefined,
      nextDueDate,
    };
  });
}

export function calculateOverallStats(summaries: CustomerSummary[]): OverallStats {
  let totalDebts = 0;
  let totalPaid = 0;
  let netRemaining = 0;
  let overdueCustomersCount = 0;
  let overdueAmount = 0;
  let clearedCustomersCount = 0;
  let creditorsCount = 0;
  let totalCreditorsAmount = 0;

  summaries.forEach((s) => {
    totalDebts += s.totalDebt;
    totalPaid += s.totalPaid;
    if (s.remainingBalance > 0) {
      netRemaining += s.remainingBalance;
    } else if (s.remainingBalance < 0) {
      creditorsCount++;
      totalCreditorsAmount += Math.abs(s.remainingBalance);
    }

    if (s.status === 'OVERDUE') {
      overdueCustomersCount++;
      overdueAmount += Math.max(0, s.remainingBalance);
    } else if (s.status === 'CLEARED') {
      clearedCustomersCount++;
    }
  });

  return {
    totalCustomers: summaries.length,
    totalDebts,
    totalPaid,
    netRemaining,
    overdueCustomersCount,
    overdueAmount,
    clearedCustomersCount,
    creditorsCount,
    totalCreditorsAmount,
  };
}

export function formatMoney(amount: number, currency: string = 'ر.س'): string {
  const formatted = Math.abs(amount).toLocaleString('ar-SA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
}

export function formatArabicDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const months = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      return `${day} ${months[month - 1]} ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function cleanPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('05') && cleaned.length === 10) {
    cleaned = '966' + cleaned.substring(1);
  }
  return cleaned;
}

export function generateWhatsAppReminderUrl(
  customer: CustomerSummary,
  currency: string = 'ر.س',
  merchantName: string = 'الجندي حاسب'
): string {
  const phone = cleanPhoneForWhatsApp(customer.phone);
  const dateToday = new Date().toLocaleDateString('ar-SA');

  let text = `السلام عليكم ورحمة الله وبركاته، الأخ/ت ${customer.name}\n\n`;
  text += `تحية طيبة وبعد من (${merchantName})\n\n`;
  text += `نود إحاطتكم بتفاصيل كشف الحساب حتى تاريخ ${dateToday}:\n`;
  text += `-----------------------------------\n`;
  text += `• إجمالي الديون (عليه): ${formatMoney(customer.totalDebt, currency)}\n`;
  text += `• إجمالي المدفوعات (له): ${formatMoney(customer.totalPaid, currency)}\n`;
  text += `• الرصيد النهائي المستحق: ${formatMoney(customer.remainingBalance, currency)}\n`;
  
  if (customer.status === 'OVERDUE') {
    text += `⚠️ تنبيه: يوجد مبالغ متأخرة عن موعد السداد المكتوب.\n`;
  }

  text += `-----------------------------------\n`;
  text += `شاكرين ومقدرين حسن تعاونكم معنا. دمتم بخير!`;

  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${phone}?text=${encodedText}`;
}

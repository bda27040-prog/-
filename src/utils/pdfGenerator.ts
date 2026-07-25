import html2pdf from 'html2pdf.js';
import { CustomerSummary, Transaction, AppSettings } from '../types';
import { formatMoney, formatArabicDate } from './calculations';

function buildStatementContainer(
  customer: CustomerSummary,
  transactions: Transaction[],
  settings: AppSettings,
  filterType: 'ALL' | 'DEBT' | 'PAYMENT' = 'ALL'
): HTMLElement {
  // Sort transactions chronologically
  const sortedTxs = [...transactions]
    .filter((tx) => tx.customerId === customer.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate Running Balance line by line
  let runningBalance = 0;
  const txsWithRunningBalance = sortedTxs.map((tx) => {
    if (tx.type === 'DEBT') {
      runningBalance += Number(tx.amount);
    } else {
      runningBalance -= Number(tx.amount);
    }
    return {
      ...tx,
      runningBalanceAfter: runningBalance,
    };
  });

  const displayTxs = txsWithRunningBalance.filter((tx) => {
    if (filterType === 'DEBT') return tx.type === 'DEBT';
    if (filterType === 'PAYMENT') return tx.type === 'PAYMENT';
    return true;
  });

  const totalDebts = sortedTxs
    .filter((t) => t.type === 'DEBT')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalPaid = sortedTxs
    .filter((t) => t.type === 'PAYMENT')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const finalNetBalance = totalDebts - totalPaid;
  const todayDateStr = new Date().toISOString().split('T')[0];

  const container = document.createElement('div');
  container.id = 'pdf-export-container';
  container.style.position = 'static';
  container.style.width = '800px';
  container.style.margin = '0 auto';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = "'Cairo', 'Tajawal', 'Segoe UI', Tahoma, sans-serif";
  container.style.direction = 'rtl';
  container.style.padding = '24px';
  container.style.boxSizing = 'border-box';
  container.style.opacity = '1';
  container.style.visibility = 'visible';

  let statusText = '(حساب خالص ومتوازن)';
  let statusBg = '#f1f5f9';
  let statusColor = '#334155';

  if (finalNetBalance > 0) {
    statusText = '(مستحق عليه لصالحنا)';
    statusBg = '#fef2f2';
    statusColor = '#dc2626';
  } else if (finalNetBalance < 0) {
    statusText = '(مستحق له لدينا)';
    statusBg = '#ecfdf5';
    statusColor = '#059669';
  }

  container.innerHTML = `
    <div style="border: 2px solid #1e293b; border-radius: 16px; padding: 24px; background: #ffffff;">
      
      <!-- PDF Header with Logo & Merchant Info -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 52px; height: 52px; background: #0f172a; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #34d399; font-size: 24px; font-weight: bold;">
            ⚖️
          </div>
          <div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #0f172a;">
              ${settings.merchantName || 'مؤسسة الجندي التجاري'}
            </h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">
              ${settings.merchantNotes || 'إدارة الديون والحسابات'} ${settings.merchantPhone ? `• هاتف: ${settings.merchantPhone}` : ''}
            </p>
          </div>
        </div>

        <div style="text-align: left;">
          <span style="display: inline-block; background: #0f172a; color: #34d399; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 20px; margin-bottom: 4px;">
            كشف حساب تفصيلي
          </span>
          <div style="font-size: 11px; color: #64748b;">
            تاريخ التصدير: ${formatArabicDate(todayDateStr)}
          </div>
        </div>
      </div>

      <!-- Customer Details Card -->
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; font-size: 12px;">
        <div>
          <span style="color: #64748b; font-weight: bold;">اسم العميل: </span>
          <strong style="color: #0f172a; font-size: 14px;">${customer.name}</strong>
        </div>

        <div>
          <span style="color: #64748b; font-weight: bold;">رقم الهاتف: </span>
          <strong style="color: #0f172a; font-family: monospace;">${customer.phone}</strong>
        </div>

        <div>
          <span style="color: #64748b; font-weight: bold;">تصنيف العميل: </span>
          <span style="color: #334155;">${customer.category || 'عميل'}</span>
        </div>

        <div>
          <span style="color: #64748b; font-weight: bold;">العنوان / ملاحظات: </span>
          <span style="color: #334155;">${customer.address || customer.notes || 'لا يوجد'}</span>
        </div>
      </div>

      <!-- Statement Summary Bar -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; text-align: center;">
        
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 12px;">
          <span style="font-size: 11px; color: #047857; font-weight: bold; display: block; margin-bottom: 4px;">إجمالي له (المدفوعات)</span>
          <span style="font-size: 16px; font-weight: 900; color: #059669; font-family: monospace;">
            ${formatMoney(totalPaid, settings.currency)}
          </span>
        </div>

        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 12px;">
          <span style="font-size: 11px; color: #b91c1c; font-weight: bold; display: block; margin-bottom: 4px;">إجمالي عليه (الديون)</span>
          <span style="font-size: 16px; font-weight: 900; color: #dc2626; font-family: monospace;">
            ${formatMoney(totalDebts, settings.currency)}
          </span>
        </div>

        <div style="background: ${statusBg}; border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px;">
          <span style="font-size: 11px; color: #1e293b; font-weight: bold; display: block; margin-bottom: 4px;">الرصيد النهائي</span>
          <span style="font-size: 16px; font-weight: 900; color: ${statusColor}; font-family: monospace;">
            ${formatMoney(finalNetBalance, settings.currency)}
          </span>
          <span style="font-size: 10px; color: #64748b; display: block; margin-top: 2px;">
            ${statusText}
          </span>
        </div>

      </div>

      <!-- Transactions Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 11px; text-align: right;">
        <thead>
          <tr style="background: #0f172a; color: #ffffff;">
            <th style="padding: 10px; border: 1px solid #1e293b;">#</th>
            <th style="padding: 10px; border: 1px solid #1e293b;">التاريخ</th>
            <th style="padding: 10px; border: 1px solid #1e293b;">البيان / التفاصيل</th>
            <th style="padding: 10px; border: 1px solid #1e293b; text-align: center; color: #34d399;">له (دائن)</th>
            <th style="padding: 10px; border: 1px solid #1e293b; text-align: center; color: #f87171;">عليه (مدين)</th>
            <th style="padding: 10px; border: 1px solid #1e293b; text-align: center;">الرصيد</th>
          </tr>
        </thead>
        <tbody>
          ${displayTxs.length === 0 ? `
            <tr>
              <td colspan="6" style="padding: 20px; text-align: center; color: #94a3b8; border: 1px solid #cbd5e1;">
                لا توجد عمليات مسجلة للعميل.
              </td>
            </tr>
          ` : displayTxs.map((tx, idx) => {
            const isDebt = tx.type === 'DEBT';
            const debtAmount = isDebt ? tx.amount : 0;
            const paymentAmount = !isDebt ? tx.amount : 0;

            return `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px; border: 1px solid #e2e8f0; color: #64748b; font-family: monospace;">${idx + 1}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; font-family: monospace;">${formatArabicDate(tx.date)}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">
                  <strong style="color: #0f172a;">${tx.description}</strong>
                  ${tx.notes ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">ملاحظة: ${tx.notes}</div>` : ''}
                  ${tx.paymentMethod ? `<div style="font-size: 9px; color: #94a3b8; margin-top: 1px;">طريقة الدفع: ${tx.paymentMethod}</div>` : ''}
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-family: monospace; font-weight: bold; color: #059669; background: #ecfdf5;">
                  ${paymentAmount > 0 ? formatMoney(paymentAmount, tx.currency || settings.currency) : '-'}
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-family: monospace; font-weight: bold; color: #dc2626; background: #fef2f2;">
                  ${debtAmount > 0 ? formatMoney(debtAmount, tx.currency || settings.currency) : '-'}
                </td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-family: monospace; font-weight: bold; color: #0f172a; background: #f1f5f9;">
                  ${formatMoney(tx.runningBalanceAfter, settings.currency)}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- Signatures Footer Zone -->
      <div style="margin-top: 32px; padding-top: 16px; border-top: 2px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #475569;">
        <div>
          <div style="font-weight: bold; margin-bottom: 30px;">توقيع وختم المؤسسة:</div>
          <div style="width: 160px; border-bottom: 1px solid #94a3b8;"></div>
        </div>

        <div style="text-align: left;">
          <div style="font-weight: bold; margin-bottom: 30px;">توقيع العميل بالمصادقة:</div>
          <div style="width: 160px; border-bottom: 1px solid #94a3b8; margin-right: auto;"></div>
        </div>
      </div>

      <!-- Footer Disclaimer -->
      <div style="margin-top: 24px; text-align: center; font-size: 10px; color: #94a3b8;">
        تم استخراج هذا المستند إلكترونياً من تطبيق ${settings.appName || 'الجندي حاسب'} بتاريخ ${formatArabicDate(todayDateStr)}
      </div>

    </div>
  `;

  return container;
}

export async function generateCustomerStatementPDF(
  customer: CustomerSummary,
  transactions: Transaction[],
  settings: AppSettings,
  filterType: 'ALL' | 'DEBT' | 'PAYMENT' = 'ALL'
): Promise<void> {
  const todayDateStr = new Date().toISOString().split('T')[0];
  const container = buildStatementContainer(customer, transactions, settings, filterType);

  // Position container off-screen
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.zIndex = '-9999';

  document.body.appendChild(container);

  // Detach all page stylesheets temporarily so html2canvas doesn't fail on Tailwind v4 CSS rules
  const styleNodes = Array.from(
    document.querySelectorAll<HTMLLinkElement | HTMLStyleElement>('style, link[rel="stylesheet"]')
  );
  const detachedNodes: { node: Node; parent: Node | null; next: Node | null }[] = [];

  styleNodes.forEach((node) => {
    detachedNodes.push({
      node,
      parent: node.parentNode,
      next: node.nextSibling,
    });
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  });

  const origAdoptedStyleSheets = (document as any).adoptedStyleSheets;
  if (origAdoptedStyleSheets) {
    try {
      (document as any).adoptedStyleSheets = [];
    } catch (e) {
      // ignore
    }
  }

  // Small delay to allow layout engine to update
  await new Promise((resolve) => setTimeout(resolve, 150));

  const opt = {
    margin: [6, 6, 6, 6],
    filename: `كشف_حساب_${customer.name.replace(/\s+/g, '_')}_${todayDateStr}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 850
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(container).save();
  } finally {
    // Restore page stylesheets
    detachedNodes.forEach(({ node, parent, next }) => {
      if (parent) {
        if (next && parent.contains(next)) {
          parent.insertBefore(node, next);
        } else {
          parent.appendChild(node);
        }
      }
    });

    if (origAdoptedStyleSheets) {
      try {
        (document as any).adoptedStyleSheets = origAdoptedStyleSheets;
      } catch (e) {
        // ignore
      }
    }

    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

export function printCustomerStatement(
  customer: CustomerSummary,
  transactions: Transaction[],
  settings: AppSettings,
  filterType: 'ALL' | 'DEBT' | 'PAYMENT' = 'ALL'
): void {
  const container = buildStatementContainer(customer, transactions, settings, filterType);
  
  // Style container for printing
  container.style.position = 'static';
  container.style.left = 'auto';
  container.style.top = 'auto';
  container.style.width = '100%';
  container.style.padding = '0';

  const printIframe = document.createElement('iframe');
  printIframe.style.position = 'fixed';
  printIframe.style.right = '0';
  printIframe.style.bottom = '0';
  printIframe.style.width = '0';
  printIframe.style.height = '0';
  printIframe.style.border = '0';
  printIframe.style.opacity = '0';

  document.body.appendChild(printIframe);

  const iframeDoc = printIframe.contentWindow?.document;
  if (!iframeDoc) {
    window.print();
    return;
  }

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>طباعة كشف حساب - ${customer.name}</title>
      <style>
        @page { size: A4 portrait; margin: 10mm; }
        body { margin: 0; padding: 10px; background: #ffffff; color: #000000; font-family: 'Cairo', 'Tajawal', sans-serif; direction: rtl; }
      </style>
    </head>
    <body>
      ${container.outerHTML}
    </body>
    </html>
  `);
  iframeDoc.close();

  setTimeout(() => {
    try {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
    } catch (e) {
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(printIframe)) {
          document.body.removeChild(printIframe);
        }
      }, 2000);
    }
  }, 300);
}


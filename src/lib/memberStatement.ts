import type { Contribution, Loan, Member, PayoutSchedule, Stokvel } from '../types';
import { computeMemberBalance } from '../components/MemberBalanceBreakdown';

const rand = (n: number) =>
  `R ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export async function downloadMemberStatement(
  member: Member,
  stokvel: Stokvel,
  contributions: Contribution[],
  loans: Loan[],
  payouts: PayoutSchedule[],
) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const b = computeMemberBalance(member, contributions, loans, payouts);
  const head = { fillColor: [88, 28, 135] as [number, number, number], textColor: 255 };
  const W = doc.internal.pageSize.getWidth();

  doc.setFontSize(18).setFont('helvetica', 'bold').text('Member Statement', 40, 50);
  doc.setFontSize(10).setFont('helvetica', 'normal');
  doc.text(stokvel.name || 'Stokvel group', 40, 68);
  doc.text(`Generated ${new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}`, W - 40, 50, { align: 'right' });
  doc.text(`Member: ${member.name}`, 40, 90);
  doc.text(`Role: ${member.role}   Joined: ${member.joinDate || '-'}`, 40, 104);
  if (member.phone || member.email) doc.text([member.phone, member.email].filter(Boolean).join('   '), 40, 118);

  const section = (title: string, y: number) => {
    doc.setFontSize(12).setFont('helvetica', 'bold').text(title, 40, y);
    doc.setFont('helvetica', 'normal');
  };
  const lastY = () => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  section('Balance breakdown', 145);
  autoTable(doc, {
    startY: 152,
    head: [['', 'Amount']],
    headStyles: head,
    columnStyles: { 1: { halign: 'right' } },
    body: [
      [`+ Contributions confirmed (${b.verifiedCount})`, rand(b.paidIn)],
      ['- Payouts received', rand(b.received)],
      ['- Loan still owed', rand(b.stillOwed)],
      [{ content: '= Balance', styles: { fontStyle: 'bold' } }, { content: rand(b.net), styles: { fontStyle: 'bold' } }],
    ],
  });
  if (b.pendingCount > 0) {
    doc.setFontSize(9).text(`${rand(b.pendingIn)} in ${b.pendingCount} payment(s) waiting to be confirmed is not counted yet.`, 40, lastY() + 14);
  }

  const mine = contributions.filter((c) => c.memberId === member.id);
  section('Contributions', lastY() + 36);
  autoTable(doc, {
    startY: lastY() + 43,
    head: [['Date', 'Month', 'Method', 'Reference', 'Status', 'Amount']],
    headStyles: head,
    columnStyles: { 5: { halign: 'right' } },
    body: mine.length
      ? mine.map((c) => [c.date, c.cycleMonth, c.paymentMethod, c.reference, c.status, rand(c.amount)])
      : [[{ content: 'No contributions yet', colSpan: 6 }]],
  });

  const myLoans = loans.filter((l) => l.borrowerId === member.id);
  section('Loans and repayments', lastY() + 30);
  autoTable(doc, {
    startY: lastY() + 37,
    head: [['Start', 'Borrowed', 'To repay', 'Repaid', 'Still owed', 'Status']],
    headStyles: head,
    body: myLoans.length
      ? myLoans.map((l) => {
          const total = l.monthlyRepayment * l.durationMonths || l.amount;
          const owed = l.status === 'repaid' ? 0 : l.remainingBalance;
          return [l.startDate, rand(l.amount), rand(total), rand(Math.max(0, total - owed)), rand(owed), l.status];
        })
      : [[{ content: 'No loans taken', colSpan: 6 }]],
  });

  const myPayouts = payouts.filter((p) => p.memberId === member.id);
  section('Payouts', lastY() + 30);
  autoTable(doc, {
    startY: lastY() + 37,
    head: [['Date', 'Month', 'Status', 'Amount']],
    headStyles: head,
    columnStyles: { 3: { halign: 'right' } },
    body: myPayouts.length
      ? myPayouts.map((p) => [p.payoutDate, p.month, p.status, rand(p.amount)])
      : [[{ content: 'No payouts yet', colSpan: 4 }]],
  });

  doc.setFontSize(8).setTextColor(120).text('Only confirmed contributions and completed payouts count towards the balance.', 40, lastY() + 24);
  doc.save(`statement-${member.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`);
}

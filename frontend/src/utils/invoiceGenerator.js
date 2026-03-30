import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Utility for number to words conversion (Indian numbering system)
const numberToWords = (num) => {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const n = ('000000000' + Math.round(num)).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.toUpperCase() + ' RUPEES ONLY';
};

export const generateInvoicePDF = (invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header - Company Info
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('INFINI MOULD TECH LLP', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const headerLines = [
        'Specialist in All types of Mould Base & Machining Work',
        'Plot No. 1472, New G.I.D.C., Gundlav, Valsad - 396035, Gujarat, India',
        'Email: infinimouldtech@gmail.com | Phone: +91 99241 12098'
    ];
    headerLines.forEach((line, i) => {
        doc.text(line, pageWidth / 2, 26 + (i * 4), { align: 'center' });
    });

    // GSTIN & Title
    doc.setDrawColor(200, 200, 200);
    doc.line(10, 40, pageWidth - 10, 40);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`GSTIN : 24AAHFI4575G1Z9`, 10, 46);
    doc.setFontSize(14);
    doc.text('TAX INVOICE', pageWidth / 2, 46, { align: 'center' });
    doc.setFontSize(8);
    doc.text('ORIGINAL FOR RECIPIENT', pageWidth - 10, 46, { align: 'right' });
    
    doc.line(10, 50, pageWidth - 10, 50);

    // Customer & Invoice Details
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Detail', 10, 56);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`M/S      : ${invoice.customer_name}`, 10, 62);
    doc.text(`Address : ${invoice.customer_address || 'N/A'}`, 10, 67, { maxWidth: 80 });
    doc.text(`GSTIN   : ${invoice.customer_gstin || 'N/A'}`, 10, 77);

    // Invoice Info Box (Right Side)
    const rightX = 120;
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice No.', rightX, 56);
    doc.setFontSize(12);
    doc.text(String(invoice.invoice_number || 'N/A'), rightX + 30, 56);
    doc.setFontSize(9);
    doc.text('Invoice Date', rightX, 64);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(invoice.created_at).toLocaleDateString('en-GB'), rightX + 30, 64);
    doc.setFont('helvetica', 'bold');
    doc.text('Due Date', rightX, 72);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-GB') : 'N/A', rightX + 30, 72);

    doc.line(10, 85, pageWidth - 10, 85);

    // Table
    const tableData = (invoice.items || []).map((item, index) => {
        const taxableValue = Number(item.amount) || 0;
        const gstRate = (Number(invoice.gst_rate) || 18) / 2; // Split CGST/SGST
        const gstAmt = (taxableValue * gstRate) / 100;
        const total = taxableValue + (gstAmt * 2);
        
        return [
            index + 1,
            item.description,
            item.hsn_code || '8480',
            item.quantity,
            item.unit_price,
            taxableValue.toFixed(2),
            `${gstRate}%`, gstAmt.toFixed(2),
            `${gstRate}%`, gstAmt.toFixed(2),
            total.toFixed(2)
        ];
    });

    autoTable(doc, {
        startY: 90,
        head: [['Sr.', 'Name of Product / Service', 'HSN/SAC', 'Qty', 'Rate', 'Taxable', 'CGST%', 'CGST Amt', 'SGST%', 'SGST Amt', 'Total']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 8 },
            1: { cellWidth: 45 },
            2: { cellWidth: 15 },
            3: { cellWidth: 10 },
            4: { cellWidth: 15 },
            5: { cellWidth: 18 },
            10: { cellWidth: 20 },
        }
    });

    const finalY = (doc).lastAutoTable.finalY + 10;

    // Totals Section
    doc.setFont('helvetica', 'bold');
    doc.text('Total in words:', 10, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(numberToWords(Math.round(Number(invoice.total))), 10, finalY + 5, { maxWidth: 100 });

    // Summary Box (Right Side)
    const summaryX = 130;
    doc.setFont('helvetica', 'normal');
    doc.text('Taxable Amount', summaryX, finalY);
    doc.text(Number(invoice.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 }), pageWidth - 10, finalY, { align: 'right' });
    
    doc.text(`Add : CGST (${(Number(invoice.gst_rate) || 18)/2}%)`, summaryX, finalY + 6);
    doc.text((Number(invoice.gst_amount || 0) / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 }), pageWidth - 10, finalY + 6, { align: 'right' });
    
    doc.text(`Add : SGST (${(Number(invoice.gst_rate) || 18)/2}%)`, summaryX, finalY + 12);
    doc.text((Number(invoice.gst_amount || 0) / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 }), pageWidth - 10, finalY + 12, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.line(summaryX, finalY + 15, pageWidth - 10, finalY + 15);
    doc.text('Total Amount After Tax', summaryX, finalY + 20);
    doc.text(`INR ${Number(invoice.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - 10, finalY + 20, { align: 'right' });

    // Bank Details (Bottom Left)
    const bankY = finalY + 35;
    doc.setDrawColor(220, 220, 220);
    doc.rect(10, bankY - 5, 100, 30);
    doc.setFont('helvetica', 'bold');
    doc.text('Bank Details', 12, bankY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Name          : ICICI BANK`, 12, bankY + 6);
    doc.text(`Branch        : S.P. RING ROAD ODHAV BRANCH`, 12, bankY + 10);
    doc.text(`Acc. Number   : 230905500894`, 12, bankY + 14);
    doc.text(`IFSC          : ICIC0002309`, 12, bankY + 18);

    // Terms & Signatory
    doc.setFontSize(7);
    doc.text('Terms and Conditions:', 10, bankY + 32);
    doc.text('1. Subject to Ahmedabad Jurisdiction.', 10, bankY + 36);
    doc.text('2. Our Responsibility Ceases as soon as goods leaves our Premises.', 10, bankY + 40);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('For INFINI MOULD TECH LLP', pageWidth - 15, bankY + 10, { align: 'right' });
    doc.text('Authorised Signatory', pageWidth - 15, bankY + 35, { align: 'right' });

    doc.save(`Invoice_${invoice.invoice_number}.pdf`);
};

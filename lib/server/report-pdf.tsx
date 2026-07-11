import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { ReportSummary } from "@/lib/server/report-data";
import { formatCurrency, formatDate } from "@/lib/format";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 4, fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 10, marginBottom: 16, color: "#666666" },
  summaryRow: { flexDirection: "row", marginBottom: 16, gap: 16 },
  summaryBox: { flex: 1, padding: 8, backgroundColor: "#f5f5f5", borderRadius: 4 },
  summaryLabel: { fontSize: 8, color: "#666666", textTransform: "uppercase" },
  summaryValue: { fontSize: 14, fontFamily: "Helvetica-Bold", marginTop: 2 },
  tableHeader: { flexDirection: "row", borderBottom: "1 solid #333333", paddingBottom: 4, marginBottom: 4 },
  tableRow: { flexDirection: "row", borderBottom: "1 solid #eeeeee", paddingVertical: 4 },
  colDate: { width: "15%" },
  colType: { width: "12%" },
  colCategory: { width: "20%" },
  colChannel: { width: "13%" },
  colNote: { width: "25%" },
  colAmount: { width: "15%", textAlign: "right" },
  headerText: { fontFamily: "Helvetica-Bold", fontSize: 9 },
});

function ReportDocument({ summary, currency }: { summary: ReportSummary; currency: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Expense Report</Text>
        <Text style={styles.subtitle}>
          {formatDate(summary.periodStart)} – {formatDate(summary.periodEnd)}
        </Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total income</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summary.totalIncome, currency)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total expense</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summary.totalExpense, currency)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Net</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summary.net, currency)}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.colDate, styles.headerText]}>Date</Text>
          <Text style={[styles.colType, styles.headerText]}>Type</Text>
          <Text style={[styles.colCategory, styles.headerText]}>Category</Text>
          <Text style={[styles.colChannel, styles.headerText]}>Channel</Text>
          <Text style={[styles.colNote, styles.headerText]}>Note</Text>
          <Text style={[styles.colAmount, styles.headerText]}>Amount</Text>
        </View>

        {summary.rows.length === 0 ? (
          <Text>No transactions in this period.</Text>
        ) : (
          summary.rows.map((row, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDate}>{formatDate(row.txn_date)}</Text>
              <Text style={styles.colType}>{row.type}</Text>
              <Text style={styles.colCategory}>{row.category}</Text>
              <Text style={styles.colChannel}>{row.channel}</Text>
              <Text style={styles.colNote}>{row.note}</Text>
              <Text style={styles.colAmount}>{formatCurrency(row.amount, currency)}</Text>
            </View>
          ))
        )}
      </Page>
    </Document>
  );
}

export async function buildReportPdf(summary: ReportSummary, currency: string): Promise<Buffer> {
  return renderToBuffer(<ReportDocument summary={summary} currency={currency} />);
}

import React from 'react';
import { Button } from 'react-bootstrap';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

const styles = StyleSheet.create({
  watermark: {
    position: 'absolute',
    opacity: 0.2,  // Ajusta la opacidad según lo necesario
    width: '100%', // Ajusta el tamaño según lo necesario
    height: '100%', // Ajusta el tamaño según lo necesario
    top: 0,
    left: 0,
  },
  page: {
    paddingTop: 19.1, // 1.91 cm
    paddingBottom: 19.1, // 1.91 cm
    paddingLeft: 17.8, // 1.78 cm
    paddingRight: 17.8, // 1.78 cm
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 14,
    textAlign: 'left',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 12,
    marginTop: 10,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  tableContainer: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#ffc107',
    color: '#534314',
    textAlign: 'center',
    padding: 5,
    fontWeight: 'bold',
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    textAlign: 'center',
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 12,
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
    textAlign: 'left',
    wordWrap: 'break-word', // Ajuste de texto para comentarios largos
  },
  commentCell: {
    width: '40%',
    textAlign: 'left',
    paddingLeft: 10,
  },
  defaultCell: {
    width: '15%',
  },
});

const RoutinePdf = ({ rutina, dias, ejercicios }) => {
  const generatePdfDocument = () => (
    <Document>
      <Page style={styles.page} size="A4" orientation="landscape">
        <Text style={styles.header}>{rutina.NombreRutina}</Text>
        {dias.map(dia => (
          <View key={dia.IdDia} wrap={false}>
            <Text style={styles.subHeader}>Día {dia.NumDia}</Text>
            <View style={styles.tableContainer}>
              <View style={styles.tableRow}>
                <View style={[styles.tableColHeader, styles.defaultCell]}>
                  <Text style={styles.tableCellHeader}>Ejercicio</Text>
                </View>
                <View style={[styles.tableColHeader, styles.defaultCell]}>
                  <Text style={styles.tableCellHeader}>Peso</Text>
                </View>
                <View style={[styles.tableColHeader, styles.defaultCell]}>
                  <Text style={styles.tableCellHeader}>Serie</Text>
                </View>
                <View style={[styles.tableColHeader, styles.defaultCell]}>
                  <Text style={styles.tableCellHeader}>Repeticiones</Text>
                </View>
                <View style={[styles.tableColHeader, styles.commentCell]}>
                  <Text style={styles.tableCellHeader}>Comentarios</Text>
                </View>
              </View>
              {ejercicios[dia.IdDia] && ejercicios[dia.IdDia].map(ejercicio => (
                <View key={ejercicio.IdEjercicio} style={styles.tableRow}>
                  <View style={[styles.tableCol, styles.defaultCell]}>
                    <Text style={styles.tableCell}>{ejercicio.Ejercicio}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.defaultCell]}>
                    <Text style={styles.tableCell}>{ejercicio.Peso}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.defaultCell]}>
                    <Text style={styles.tableCell}>{ejercicio.Serie}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.defaultCell]}>
                    <Text style={styles.tableCell}>{ejercicio.Repe}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.commentCell]}>
                    <Text style={styles.tableCell}>{ejercicio.Comentario}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );

  const handlePrint = async () => {
    const doc = generatePdfDocument();
    const asPdf = pdf(doc);
    const pdfBlob = await asPdf.toBlob();
    saveAs(pdfBlob, `${rutina.NombreRutina}.pdf`);
  };

  return (
    <Button variant='btn btn-sm btn-outline-dark' onClick={handlePrint} >
      <img src="./src/assets/print.svg" alt="Print" />
    </Button>
  );
};

export default RoutinePdf;

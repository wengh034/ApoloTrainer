import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Este componente es la plantilla de lo que se imprimirá
const PlantillaImpresion = ( rutina, dias, ejercicios) => {
    const doc = new jsPDF('p', 'mm', 'a4');

        // Verifica que rutina.NombreRutina sea una cadena
        if (typeof rutina.NombreRutina !== 'string') {
            // console.error('NombreRutina debe ser una cadena');
            return;
          }
          const watermarkImg = 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8IS0tIENyZWF0b3I6IENvcmVsRFJBVyAyMDIwICg2NC1CaXQpIC0tPg0KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIxMDkuMjE5bW0iIGhlaWdodD0iNjguMjQxMm1tIiB2ZXJzaW9uPSIxLjEiIHN0eWxlPSJzaGFwZS1yZW5kZXJpbmc6Z2VvbWV0cmljUHJlY2lzaW9uOyB0ZXh0LXJlbmRlcmluZzpnZW9tZXRyaWNQcmVjaXNpb247IGltYWdlLXJlbmRlcmluZzpvcHRpbWl6ZVF1YWxpdHk7IGZpbGwtcnVsZTpldmVub2RkOyBjbGlwLXJ1bGU6ZXZlbm9kZCINCnZpZXdCb3g9IjAgMCAxMDkyMS45NCA2ODI0LjEyIg0KIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIg0KIHhtbG5zOnhvZG09Imh0dHA6Ly93d3cuY29yZWwuY29tL2NvcmVsZHJhdy9vZG0vMjAwMyI+DQogPGRlZnM+DQogICA8Y2xpcFBhdGggaWQ9ImlkMCI+DQogICAgPHJlY3QgeD0iMzY0MC42MiIgeT0iMTkzMC40IiB3aWR0aD0iNjE2My43NSIgaGVpZ2h0PSIzMTQ5LjYiLz4NCiAgIDwvY2xpcFBhdGg+DQogICA8Y2xpcFBhdGggaWQ9ImlkMSI+DQogICAgPHJlY3QgeD0iODQuNjUiIHk9Ii02Ny43NCIgd2lkdGg9IjQ2MDUuODYiIGhlaWdodD0iNjgxNS42NiIvPg0KICAgPC9jbGlwUGF0aD4NCiA8L2RlZnM+DQogPGcgaWQ9IkNhcGFfeDAwMjBfMSI+DQogIDxtZXRhZGF0YSBpZD0iQ29yZWxDb3JwSURfMENvcmVsLUxheWVyIi8+DQogIDxnIHN0eWxlPSJjbGlwLXBhdGg6dXJsKCNpZDApIj4NCiAgIDxpbWFnZSB4PSIzNjQwLjYyIiB5PSIxOTMwLjM5IiB3aWR0aD0iNjE2My43NiIgaGVpZ2h0PSIzMTQ5LjYxIiB4bGluazpocmVmPSJMb2dvIDNfSW1hZ2VzXExvZ28gM19JbWdJRDEucG5nIi8+DQogIDwvZz4NCiAgPGcgc3R5bGU9ImNsaXAtcGF0aDp1cmwoI2lkMSkiPg0KICAgPGltYWdlIHg9Ijg0LjY1IiB5PSItNjcuNzQiIHdpZHRoPSI0NjA1Ljg2IiBoZWlnaHQ9IjY4MTUuNjYiIHhsaW5rOmhyZWY9IkxvZ28gM19JbWFnZXNcTG9nbyAzX0ltZ0lEMi5wbmciLz4NCiAgPC9nPg0KIDwvZz4NCjwvc3ZnPg0K'; // Reemplaza con tu imagen en base64
            doc.addImage(watermarkImg, 'PNG', 15, 40, 180, 160, undefined, 'FAST');
            doc.setTextColor(255, 255, 255); // Color blanco para el texto sobre la marca de agua
            doc.setFontSize(40);
            doc.text("Marca de Agua", 105, 150, { align: 'center', angle: 45 });

  // Agregar título
  doc.setFontSize(18);
  doc.text(rutina.NombreRutina, 14, 22);
  
  dias.forEach((dia, index) => {
    // Agregar título del día
    doc.setFontSize(14);
    doc.text(`Día ${dia.NumDia}`, 14, 30 + index * 60);
    
    if (ejercicios[dia.IdDia]) {
      // Agregar tabla
      const tableColumn = ["Ejercicio", "Peso", "Serie", "Repeticiones", "Comentario"];
      const tableRows = ejercicios[dia.IdDia].map(ejercicio => [
        ejercicio.Ejercicio,
        ejercicio.Peso,
        ejercicio.Serie,
        ejercicio.Repe,
        ejercicio.Comentario
      ]);

      doc.autoTable({
        startY: 40 + index * 60,
        head: [tableColumn],
        body: tableRows,
        margin: { top: 10 },
        styles: { overflow: 'linebreak' }
      });
    }
  });

  doc.save('rutina.pdf');
};

export default PlantillaImpresion;

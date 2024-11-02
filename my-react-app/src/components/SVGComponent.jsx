import { ReactSVG } from 'react-svg';

const SVGComponent = ({ src, color, width, height, padding }) => (
  <div style={{ padding: padding}}>
      <ReactSVG
      src={src}
      beforeInjection={(svg) => {
          svg.setAttribute('style', `fill: ${color}`);
          if (width) {
            svg.setAttribute('width', width); // Ajusta el ancho si se pasa como prop
          }
          if (height) {
            svg.setAttribute('height', height); // Ajusta la altura si se pasa como prop
          }
      }}
  />
  </div>

);
export default SVGComponent;
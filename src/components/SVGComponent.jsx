import { ReactSVG } from 'react-svg';

const SVGComponent = ({ src, color, width, height, padding }) => (
  <div style={{ padding: padding}}>
      <ReactSVG
      src={src}
      beforeInjection={(svg) => {
          svg.setAttribute('style', `fill: ${color}`);
          if (width) {
            svg.setAttribute('width', width);
          }
          if (height) {
            svg.setAttribute('height', height);
          }
      }}
  />
  </div>

);
export default SVGComponent;
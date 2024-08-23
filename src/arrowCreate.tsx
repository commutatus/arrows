import { createRef, h, render } from 'preact'
import { useEffect, useState } from 'preact/hooks'

import observer from './observer/observer';
import { IArrow, IArrowProps, IArrowComponentProps } from './interfaces/IArrow'
import arrowVector from './arrowVector';
import { castToAnchor } from './anchor';
import { headTransformCSS, HeadWithPoint, HEAD } from './head';

export const Arrow = ({
  className, head, from, to, forwardRef, updateDelay, onClick
}: IArrowComponentProps): JSX.Element => {
  const [arrow, setArrow] = useState(() => arrowVector(from, to, head));

  useEffect(() => {
    const update = () => setArrow(arrowVector(from, to, head))
    const watcher = observer(from, to, { update, updateDelay });
    return watcher.clear
  }, [from, head, to, updateDelay]);

  const renderHead = (head: HeadWithPoint) => {
    if (!head.node) return null

    const props = {
      className: `${className}__head ${className}__head--${head.id}`,
      transform: headTransformCSS(head),
    }

    if (typeof head.node === 'string') {
      return <g key={head.id} {...props} dangerouslySetInnerHTML={{__html: head.node }} />
    }

    const htmlNode = (head.node as HTMLElement)
    if (htmlNode.tagName) return <g {...props} dangerouslySetInnerHTML={{__html: htmlNode.outerHTML }} />
    return <g key={head.id} {...props}>{head.node}</g>;
  }

  return (
    <svg
      className={className}
      style={{
        top: arrow.offset.y,
        left: arrow.offset.x,
        position: 'fixed',
      }}
      width={arrow.size.width}
      height={arrow.size.height}
      ref={forwardRef}
    >
      <path className={`${className}__path${onClick ? " clickable" : ""}`} d={arrow.pathCommands} onClick={onClick || null} />
      {arrow.heads.map(renderHead)}
    </svg>
  );
};

const arrowCreate = ({
  className = 'arrow', head = HEAD.THIN, from, to, updateDelay, onClick
}: IArrowProps): IArrow => {
  const arrowRef = createRef<SVGSVGElement>()
  const node = document.createDocumentFragment();

  if (!from) throw new Error('undefined from, try to pass it as from={() => ...}')
  if (!to) throw new Error('undefined to, try to pass it as to={() => ...}')

  render(
    <Arrow
      className={className}
      head={head}
      from={castToAnchor(from)}
      to={castToAnchor(to)}
      forwardRef={arrowRef}
      updateDelay={updateDelay}
      onClick={onClick}
    />,
    node,
  );

  const clear = () => {
    const arrow = arrowRef.current
    const { parentNode } = arrow;

    if (parentNode) parentNode.removeChild(arrow);
  };

  return {
    node,
    clear,
  };
};

export default arrowCreate;

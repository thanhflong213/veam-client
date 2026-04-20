'use client';

import type { NavItem } from '../../lib/types';

interface Props {
  items: NavItem[];
  onChange: (items: NavItem[]) => void;
}

function emptyItem(): NavItem {
  return { label: '', href: '', enabled: true, children: [] };
}

function updateAt<T>(arr: T[], i: number, val: T): T[] {
  return arr.map((x, j) => (j === i ? val : x));
}
function removeAt<T>(arr: T[], i: number): T[] {
  return arr.filter((_, j) => j !== i);
}
function swapAt<T>(arr: T[], i: number, j: number): T[] {
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

interface RowProps {
  item: NavItem;
  depth: number;
  isFirst: boolean;
  isLast: boolean;
  onChange: (v: NavItem) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function ItemRow({ item, depth, isFirst, isLast, onChange, onRemove, onMoveUp, onMoveDown }: RowProps) {
  const children = item.children ?? [];

  function addChild() {
    onChange({ ...item, children: [...children, emptyItem()] });
  }

  return (
    <div className={`nav-ed-level nav-ed-d${depth}`}>
      <div className="nav-ed-row">
        <button
          type="button"
          className={`nav-ed-vis${item.enabled ? '' : ' off'}`}
          title={item.enabled ? 'Visible — click to hide' : 'Hidden — click to show'}
          onClick={() => onChange({ ...item, enabled: !item.enabled })}
        >
          {item.enabled ? '●' : '○'}
        </button>
        <input
          className="form-input nav-ed-label"
          placeholder="Label"
          value={item.label}
          onChange={e => onChange({ ...item, label: e.target.value })}
        />
        <input
          className="form-input nav-ed-href"
          placeholder="Link (blank = group only)"
          value={item.href ?? ''}
          onChange={e => onChange({ ...item, href: e.target.value })}
        />
        <div className="nav-ed-btns">
          <button type="button" className="nav-ed-mv" onClick={onMoveUp} disabled={isFirst} title="Move up">↑</button>
          <button type="button" className="nav-ed-mv" onClick={onMoveDown} disabled={isLast} title="Move down">↓</button>
          <button type="button" className="nav-ed-del" onClick={onRemove} title="Remove">✕</button>
        </div>
      </div>

      {children.length > 0 && (
        <div className="nav-ed-children">
          {children.map((child, i) => (
            <ItemRow
              key={i}
              item={child}
              depth={depth + 1}
              isFirst={i === 0}
              isLast={i === children.length - 1}
              onChange={v => onChange({ ...item, children: updateAt(children, i, v) })}
              onRemove={() => onChange({ ...item, children: removeAt(children, i) })}
              onMoveUp={() => onChange({ ...item, children: swapAt(children, i, i - 1) })}
              onMoveDown={() => onChange({ ...item, children: swapAt(children, i, i + 1) })}
            />
          ))}
        </div>
      )}

      {depth < 2 && (
        <button type="button" className="nav-ed-add-child" onClick={addChild}>
          + Add {depth === 0 ? 'sub-item' : 'nested item'}
        </button>
      )}
    </div>
  );
}

export function NavMenuEditor({ items, onChange }: Props) {
  return (
    <div className="nav-ed-root">
      {items.map((item, i) => (
        <ItemRow
          key={i}
          item={item}
          depth={0}
          isFirst={i === 0}
          isLast={i === items.length - 1}
          onChange={v => onChange(updateAt(items, i, v))}
          onRemove={() => onChange(removeAt(items, i))}
          onMoveUp={() => onChange(swapAt(items, i, i - 1))}
          onMoveDown={() => onChange(swapAt(items, i, i + 1))}
        />
      ))}
      <button
        type="button"
        className="btn btn-secondary"
        style={{ marginTop: 8, fontSize: 12 }}
        onClick={() => onChange([...items, emptyItem()])}
      >
        + Add nav item
      </button>
    </div>
  );
}

// components/admin/ResizableImageView.tsx
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { useRef, useState, useCallback } from 'react'

export default function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
    const { src, alt, width, align } = node.attrs
    const containerRef = useRef<HTMLDivElement>(null)
    const [isResizing, setIsResizing] = useState(false)

    const startResize = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        const startX = e.clientX
        const startWidth = containerRef.current?.querySelector('img')?.offsetWidth ?? 300

        setIsResizing(true)

        const onMove = (ev: MouseEvent) => {
            const delta = ev.clientX - startX
            const newWidth = Math.max(80, startWidth + delta)
            updateAttributes({ width: `${newWidth}px` })
        }
        const onUp = () => {
            setIsResizing(false)
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
    }, [updateAttributes])

    const alignStyle: React.CSSProperties =
        align === 'left' ? { marginRight: 'auto' }
            : align === 'right' ? { marginLeft: 'auto' }
                : { marginLeft: 'auto', marginRight: 'auto' }

    return (
        <NodeViewWrapper
            style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start', userSelect: 'none' }}
        >
            <div
                ref={containerRef}
                style={{ position: 'relative', display: 'inline-block', width, ...alignStyle }}
                className={`rimg-wrap${selected ? ' rimg-selected' : ''}${isResizing ? ' rimg-resizing' : ''}`}
            >
                {/* Alignment toolbar shown when selected */}
                {selected && (
                    <div className="rimg-toolbar">
                        <button type="button" className={align === 'left' ? 'active' : ''} onMouseDown={e => { e.preventDefault(); updateAttributes({ align: 'left' }) }} title="Align left">◀</button>
                        <button type="button" className={align === 'center' ? 'active' : ''} onMouseDown={e => { e.preventDefault(); updateAttributes({ align: 'center' }) }} title="Center">■</button>
                        <button type="button" className={align === 'right' ? 'active' : ''} onMouseDown={e => { e.preventDefault(); updateAttributes({ align: 'right' }) }} title="Align right">▶</button>
                        <span className="rimg-size">{typeof width === 'string' && width.endsWith('px') ? width : 'auto'}</span>
                    </div>
                )}

                <img src={src} alt={alt ?? ''} style={{ width: '100%', display: 'block', borderRadius: 4 }} draggable={false} />

                {/* Right resize handle */}
                {selected && (
                    <div className="rimg-handle rimg-handle-r" onMouseDown={startResize} />
                )}
            </div>
        </NodeViewWrapper>
    )
}
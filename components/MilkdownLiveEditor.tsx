import React, { useEffect, useRef } from 'react';
import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { upload, uploadConfig } from '@milkdown/plugin-upload';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { nord } from '@milkdown/theme-nord';
import '@milkdown/theme-nord/style.css';
import { getMarkdown, replaceAll } from '@milkdown/utils';
import type { Node as ProseMirrorNode } from '@milkdown/prose/model';

type UploadImage = (file: File) => Promise<string | null>;

interface MilkdownLiveEditorProps {
    value: string;
    onChange: (markdown: string) => void;
    uploadImage: UploadImage;
}

const MilkdownEditorInner: React.FC<MilkdownLiveEditorProps> = ({ value, onChange, uploadImage }) => {
    const onChangeRef = useRef(onChange);
    const uploadImageRef = useRef(uploadImage);
    const isSyncingRef = useRef(false);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        uploadImageRef.current = uploadImage;
    }, [uploadImage]);

    const { get } = useEditor((root) => {
        return Editor.make()
            .config(nord)
            .config((ctx) => {
                ctx.set(rootCtx, root);
                ctx.set(defaultValueCtx, value || '');
            })
            .use(commonmark)
            .use(gfm)
            .use(listener)
            .use(upload)
            .config((ctx) => {
                ctx.set(uploadConfig.key, {
                    uploader: async (files, schema) => {
                        const imageNode = schema.nodes.image;
                        if (!imageNode) return [];

                        const nodes: ProseMirrorNode[] = [];
                        for (let i = 0; i < files.length; i++) {
                            const file = files.item(i);
                            if (!file || !file.type.startsWith('image/')) continue;

                            const url = await uploadImageRef.current(file);
                            if (!url) continue;

                            const node = imageNode.createAndFill({ src: url, alt: file.name });
                            if (node) nodes.push(node);
                        }

                        return nodes;
                    },
                    enableHtmlFileUploader: false,
                    uploadWidgetFactory: (pos, spec) => {
                        const widget = document.createElement('span');
                        widget.className = 'milkdown-upload-widget';
                        widget.textContent = 'Uploading image...';
                        return (window as any).Decoration
                            ? (window as any).Decoration.widget(pos, widget, spec)
                            : spec as any;
                    }
                });

                ctx.get(listenerCtx).markdownUpdated((_ctx, markdown, prevMarkdown) => {
                    if (isSyncingRef.current || markdown === prevMarkdown) return;
                    onChangeRef.current(markdown);
                });
            });
    }, []);

    useEffect(() => {
        const editor = get();
        if (!editor) return;

        const nextValue = value || '';
        const currentValue = editor.action(getMarkdown());
        if (currentValue === nextValue) return;

        isSyncingRef.current = true;
        editor.action(replaceAll(nextValue, true));
        isSyncingRef.current = false;
    }, [get, value]);

    return <Milkdown />;
};

const MilkdownLiveEditor: React.FC<MilkdownLiveEditorProps> = (props) => {
    return (
        <MilkdownProvider>
            <MilkdownEditorInner {...props} />
        </MilkdownProvider>
    );
};

export default MilkdownLiveEditor;

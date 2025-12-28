import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

import Delimiter from '@editorjs/delimiter';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import InlineCode from '@editorjs/inline-code';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import { Box } from '@mui/material';

interface EditorJSComponentProps {
  value?: OutputData | Record<string, unknown>;
  onChange?: (data: OutputData) => void;
  placeholder?: string;
}

export interface EditorJSRef {
  save: () => Promise<OutputData>;
}

const EditorJSComponent = forwardRef<EditorJSRef, EditorJSComponentProps>(
  ({ value, onChange, placeholder = 'Start writing your content...' }, ref) => {
    const editorRef = useRef<EditorJS | null>(null);
    const holderRef = useRef<HTMLDivElement>(null);
    const isInitialized = useRef(false);
    const onChangeRef = useRef(onChange);

    // Keep onChange ref up to date
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    useImperativeHandle(ref, () => ({
      save: async () => {
        if (editorRef.current) {
          return await editorRef.current.save();
        }
        return { blocks: [] };
      },
    }));

    // Convert old format to EditorJS format if needed
    const getEditorData = (data?: OutputData | Record<string, unknown>): OutputData => {
      if (data && 'blocks' in data) {
        return data as OutputData;
      } else if (data && typeof data === 'object') {
        // Convert legacy content to EditorJS format
        return {
          blocks: [
            {
              type: 'paragraph',
              data: {
                text: 'This page uses legacy format. Please edit and save to convert to the new editor format.',
              },
            },
            {
              type: 'paragraph',
              data: {
                text: JSON.stringify(data, null, 2),
              },
            },
          ],
        };
      }
      return { blocks: [] };
    };

    // Initialize editor
    useEffect(() => {
      if (!holderRef.current || isInitialized.current) {
        return;
      }

      const editorData = getEditorData(value);

      editorRef.current = new EditorJS({
        holder: holderRef.current,
        data: editorData,
        placeholder,
        tools: {
          header: Header,
          paragraph: Paragraph,
          list: List,
          quote: Quote,
          delimiter: Delimiter,
          inlineCode: InlineCode,
        },
        onChange: () => {
          void (async () => {
            if (editorRef.current && onChangeRef.current) {
              const data = await editorRef.current.save();
              onChangeRef.current(data);
            }
          })();
        },
      });
      isInitialized.current = true;

      return () => {
        if (editorRef.current?.destroy) {
          editorRef.current.destroy();
          editorRef.current = null;
        }
        isInitialized.current = false;
      };
    }, [value, placeholder]);

    return (
      <Box
        ref={holderRef}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          minHeight: 400,
          '& .ce-toolbar__actions': {
            right: 0,
          },
          '& .ce-block__content': {
            maxWidth: '100%',
          },
          '& .cdx-block': {
            maxWidth: '100%',
          },
          '& .ce-paragraph': {
            fontSize: '16px',
            lineHeight: 1.6,
          },
        }}
      />
    );
  }
);

EditorJSComponent.displayName = 'EditorJSComponent';

export default EditorJSComponent;

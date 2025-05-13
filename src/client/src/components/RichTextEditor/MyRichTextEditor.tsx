import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { EditorOptions, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { RichTextEditor } from "@mantine/tiptap";
import { Input, Text } from "@mantine/core";

export interface IMyTextEditor extends Partial<EditorOptions> {
  label?: string;
  error?: string;
  value?: string;
  onChange?: any;
  isRequired?: boolean;
  content?: string;
}

export default function MyRichTextEditor({
  onChange,
  value,
  error,
  label,
  isRequired,
  content,
  ...rest
}: IMyTextEditor) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Highlight],
    content: content,
  });

  return (
    <Input.Wrapper
      flex={1}
      w={"100%"}
      p={0.1}
      label={
        <Text size="sm" fw={400}>
          {label}
        </Text>
      }
      error={error}
      required={isRequired}
    >
      <RichTextEditor editor={editor} w="100%" variant="subtle">
        <RichTextEditor.Toolbar sticky stickyOffset="var(--docs-header-height)">
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.ClearFormatting />
            <RichTextEditor.Highlight />
            <RichTextEditor.Code />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
      </RichTextEditor>
    </Input.Wrapper>
  );
}

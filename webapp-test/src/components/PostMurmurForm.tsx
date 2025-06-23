import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface PostMurmurFormProps {
  onSubmit: (text: string) => Promise<void>;
  submitError?: string | null;
  isLoading?: boolean; // To disable button during submission
}
const MAX_MURMUR_LENGTH = 5000;

const PostMurmurForm: React.FC<PostMurmurFormProps> = ({ onSubmit, submitError, isLoading }) => {
  const [text, setText] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [characterCount, setCharacterCount] = useState(0);

  // Function to strip HTML and count characters
  const getPlainTextLength = (htmlString: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    return (tempDiv.textContent || tempDiv.innerText || "").length;
  };

  const handleEditorChange = (event: any, editor: any) => {
    const data = editor.getData();
    setText(data);
    const plainTextLength = getPlainTextLength(data);
    setCharacterCount(plainTextLength);

    if (plainTextLength > MAX_MURMUR_LENGTH) {
      setLocalError(`Murmur text cannot exceed ${MAX_MURMUR_LENGTH} characters (currently ${plainTextLength}).`);
    } else if (!data.replace(/<[^>]*>?/gm, '').trim()) {
      setLocalError(null);
    } else {
      setLocalError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const plainText = text.replace(/<[^>]*>?/gm, '').trim();
    const currentLength = getPlainTextLength(text);

    if (!plainText) {
      setLocalError(null);
      return;
    }
    if (currentLength > MAX_MURMUR_LENGTH) {
      setLocalError(`Murmur text cannot exceed ${MAX_MURMUR_LENGTH} characters (currently ${currentLength}).`);
      return;
    }
    setLocalError(null); // Clear local error before submit
    try {
      await onSubmit(text);
      setText(''); // Clear editor on successful submission
      setCharacterCount(0); // Reset character count
    } catch (err) {
      // Parent component is expected to handle and pass down submitError
    }
  };
  const isTextEmpty = !text.replace(/<[^>]*>?/gm, '').trim();
  const isOverLimit = characterCount > MAX_MURMUR_LENGTH;
  const canSubmit = !isTextEmpty && !isOverLimit && !isLoading;

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-fluid">
        <div className="p-field mb-3">
          <CKEditor
            editor={ClassicEditor}
            data={text}
            onChange={handleEditorChange}
            config={{
              toolbar: [
                'undo',
          'redo',
          '|',
          'heading',
          '|',
          'fontSize',
          'fontFamily',
          'fontColor',
          'fontBackgroundColor',
          '|',
          'bold',
          'italic',
          'underline',
          'strikethrough',
          'code',
          'removeFormat',
          '|',
          'horizontalLine',
          'link',
          'bookmark',
          'insertTable',
          'highlight',
          'blockQuote',
          'codeBlock',
          '|',
          'alignment',
          '|',
          'bulletedList',
          'numberedList',
          'todoList',
          'outdent',
          'indent',
              ],
              placeholder: 'Whats on your mind?',
            }}
          />
          <small className={`block mt-1 ${isOverLimit ? 'p-error' : 'p-text-secondary'}`}>
            {characterCount}/{MAX_MURMUR_LENGTH} characters
          </small>
        </div>
      </div>
      {(localError || submitError) && (
        <Message severity="error" text={localError || submitError || 'An error occurred'} className="mb-3 w-full" />
      )}
      <Button type="submit" label="Post Murmur" icon="pi pi-send"  disabled={!canSubmit} className="w-full sm:w-auto" />
    </form>
  );
};

export default PostMurmurForm;

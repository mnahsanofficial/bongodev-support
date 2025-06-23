import React, { useState } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Card } from 'primereact/card';

interface PostMurmurFormProps {
  onSubmit: (text: string) => Promise<void>;
  submitError?: string | null;
  isLoading?: boolean; // To disable button during submission
}

const PostMurmurForm: React.FC<PostMurmurFormProps> = ({ onSubmit, submitError, isLoading }) => {
  const [text, setText] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) {
      setLocalError('Murmur text cannot be empty.');
      return;
    }
    setLocalError(null); // Clear local error
    try {
      await onSubmit(text);
      setText(''); // Clear textarea on successful submission
    } catch (err) {
      // Parent component is expected to handle and pass down submitError
    }
  };

  return (
    // Removed Card wrapper from here. The parent component (TimelinePage) will provide the Card.
    <form onSubmit={handleSubmit}>
      <div className="p-fluid">
        <div className="p-field mb-3"> {/* mb-3 might be adjusted by parent or remain if PostMurmurForm is used standalone elsewhere */}
          <InputTextarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              className="w-full"
              autoResize
              required
            />
          </div>
        </div>
        {(localError || submitError) && (
          <Message severity="error" text={localError || submitError || 'An error occurred'} className="mb-3 w-full" />
        )}
        <Button type="submit" label="Post Murmur" icon="pi pi-send" disabled={isLoading} className="w-full sm:w-auto" />
      </form>
  );
};

export default PostMurmurForm;

import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';

interface CreateCommentFormProps {
  onSubmit: (text: string) => Promise<void>;
  submitError?: string | null;
  isLoading?: boolean;
}

const CreateCommentForm: React.FC<CreateCommentFormProps> = ({ onSubmit, submitError, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) {
      return;
    }
    try {
      await onSubmit(text);
      setText('');
    } catch (err) {
      // Error is handled by the parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <InputTextarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full"
        placeholder="Write a comment..."
        disabled={isLoading}
      />
      {submitError && <Message severity="error" text={submitError} className="mt-2" />}
      <Button
        type="submit"
        label="Submit Comment"
        icon="pi pi-check"
        className="mt-2"
        disabled={!text.trim() || isLoading}
      />
    </form>
  );
};

export default CreateCommentForm;

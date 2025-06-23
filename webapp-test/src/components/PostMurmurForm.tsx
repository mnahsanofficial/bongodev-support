import React, { useState } from 'react';

interface PostMurmurFormProps {
  onSubmit: (text: string) => Promise<void>; // Make onSubmit async if it performs API calls
  submitError?: string | null;
}

const PostMurmurForm: React.FC<PostMurmurFormProps> = ({ onSubmit, submitError }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) {
      setError('Murmur text cannot be empty.');
      return;
    }
    setError(null); // Clear local error
    try {
      await onSubmit(text);
      setText(''); // Clear textarea on successful submission
    } catch (err) {
      // Error handling can be done in the parent component via onSubmit promise rejection
      // Or, if submitError prop is used to pass errors from parent:
      // setError("Failed to post murmur."); // This would be a generic message
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <h4>Post a new Murmur</h4>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        rows={3}
        style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }}
        required
      />
      {(error || submitError) && <p style={{ color: 'red' }}>{error || submitError}</p>}
      <button type="submit">Post Murmur</button>
    </form>
  );
};

export default PostMurmurForm;

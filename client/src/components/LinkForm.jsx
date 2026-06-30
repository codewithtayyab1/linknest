import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

export default function LinkForm({ defaultValues, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  useEffect(() => {
    reset(defaultValues ?? { title: '', url: '', icon: '' });
  }, [defaultValues, reset]);

  return (
    <AnimatePresence>
      {/* backdrop */}
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-40 bg-black/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      />

      {/* card */}
      <motion.div
        key="card"
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <div className="ln-card w-full max-w-sm p-7" onClick={(e) => e.stopPropagation()}>
          <h2 className="mb-5 text-base">
            {defaultValues?._id ? 'Edit link' : 'Add link'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label className="ln-label">Title</label>
              <input
                type="text"
                className="ln-input"
                placeholder="My portfolio"
                {...register('title', {
                  required: 'Title is required',
                  maxLength: { value: 100, message: 'Max 100 characters' },
                })}
              />
              {errors.title && <p className="field-err">{errors.title.message}</p>}
            </div>

            <div>
              <label className="ln-label">URL</label>
              <input
                type="url"
                className="ln-input"
                placeholder="https://example.com"
                {...register('url', {
                  required: 'URL is required',
                  pattern: { value: /^https?:\/\/.+/, message: 'Must start with http:// or https://' },
                })}
              />
              {errors.url && <p className="field-err">{errors.url.message}</p>}
            </div>

            <div>
              <label className="ln-label">
                Icon URL{' '}
                <span className="font-normal text-[var(--ink-muted)]">(optional)</span>
              </label>
              <input
                type="text"
                className="ln-input"
                placeholder="https://example.com/icon.png"
                {...register('icon')}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onCancel} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                {isSubmitting ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
